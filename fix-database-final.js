// FIX CORRETO PARA BANCO DE DADOS
const { Client } = require('pg');

async function fixDatabase() {
  console.log('?? Corrigindo banco de dados...');

  const client = new Client({
    host: 'dpg-d5kgas94tr6s73au58pg-a',
    port: 5432,
    database: 'strapi_5cj5',
    user: 'meu_admin',
    password: 'QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('? Conectado ao banco');

    // PASSO 1: Primeiro, converter para TEXT
    console.log('?? Convertendo para TEXT...');
    try {
      await client.query('ALTER TABLE noticias ALTER COLUMN conteudo TYPE TEXT');
    } catch (e) {
      console.log('?? Já está como TEXT ou erro:', e.message);
    }

    // PASSO 2: Corrigir dados inválidos
    console.log('?? Corrigindo dados...');
    
    // a) Corrigir NULLs
    await client.query(`
      UPDATE noticias 
      SET conteudo = '{"texto": ""}'
      WHERE conteudo IS NULL OR conteudo = ''
    `);
    console.log('? NULLs corrigidos');

    // b) Corrigir textos não-JSON
    const { rows } = await client.query(`
      SELECT id, conteudo
      FROM noticias
      WHERE conteudo IS NOT NULL
      AND conteudo != ''
      AND (conteudo !~ '^[[:space:]]*\{' AND conteudo !~ '^[[:space:]]*\[')
    `);

    if (rows.length > 0) {
      console.log(`?? Encontrados ${rows.length} textos não-JSON`);
      
      for (const row of rows) {
        const texto = row.conteudo.toString().trim();
        const jsonValido = JSON.stringify({ 
          texto: texto,
          _corrigido: true,
          _timestamp: new Date().toISOString()
        });
        
        await client.query(
          'UPDATE noticias SET conteudo = $1 WHERE id = $2',
          [jsonValido, row.id]
        );
      }
      console.log('? Textos convertidos para JSON');
    }

    // PASSO 3: Converter para JSONB
    console.log('?? Convertendo para JSONB...');
    try {
      await client.query(`
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE JSONB 
        USING conteudo::JSONB
      `);
      console.log('? Convertido para JSONB com sucesso!');
    } catch (e) {
      console.log('? Erro na conversão final:', e.message);
      
      // Método alternativo
      console.log('?? Tentando método alternativo...');
      await client.query('ALTER TABLE noticias ADD COLUMN conteudo_temp TEXT');
      await client.query(`
        UPDATE noticias 
        SET conteudo_temp = 
          CASE 
            WHEN conteudo IS NULL THEN '{}'
            WHEN conteudo = '' THEN '{}'
            ELSE conteudo
          END
      `);
      await client.query('ALTER TABLE noticias DROP COLUMN conteudo');
      await client.query('ALTER TABLE noticias RENAME COLUMN conteudo_temp TO conteudo');
      await client.query('ALTER TABLE noticias ALTER COLUMN conteudo TYPE JSONB USING conteudo::JSONB');
      console.log('? Método alternativo aplicado!');
    }

    console.log('?? ?? ?? BANCO CORRIGIDO COM SUCESSO! ?? ?? ??');
    console.log('?? Agora faça push e deploy!');

  } catch (error) {
    console.error('? ERRO CRÍTICO:', error.message);
  } finally {
    await client.end();
    console.log('?? Conexão encerrada');
  }
}

fixDatabase();
