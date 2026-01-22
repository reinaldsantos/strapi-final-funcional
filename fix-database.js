// fix-database.js - Corrige dados inválidos antes do Strapi tentar iniciar
const { Client } = require('pg');

async function fixDatabase() {
  console.log('?? Corrigindo banco de dados...');
  
  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('? Conectado ao banco');

    // PASSO 1: Verificar dados problemáticos
    console.log('?? Buscando dados inválidos...');
    const { rows } = await client.query(`
      SELECT id, conteudo, 
             CASE 
               WHEN conteudo IS NULL THEN 'NULL'
               WHEN conteudo = '' THEN 'EMPTY'
               WHEN conteudo::text !~ '^[[:space:]]*\{' AND conteudo::text !~ '^[[:space:]]*\['
               THEN 'INVALID_JSON'
               ELSE 'VALID'
             END as status
      FROM noticias
      WHERE conteudo IS NULL 
         OR conteudo = ''
         OR conteudo::text !~ '^[[:space:]]*\{' 
         AND conteudo::text !~ '^[[:space:]]*\['
    `);

    console.log(`?? Encontrados ${rows.length} registros problemáticos`);

    // PASSO 2: Corrigir cada registro
    for (const row of rows) {
      let novoValor;
      
      if (row.status === 'NULL' || row.status === 'EMPTY') {
        novoValor = '{"texto": ""}';
      } else if (row.status === 'INVALID_JSON') {
        // Tentar limpar e converter para JSON válido
        const texto = row.conteudo?.toString() || '';
        const textoLimpo = texto.trim();
        novoValor = JSON.stringify({ 
          texto: textoLimpo,
          _corrigido: true,
          _original: textoLimpo.substring(0, 100)
        });
      }
      
      await client.query(
        'UPDATE noticias SET conteudo = $1::text WHERE id = $2',
        [novoValor, row.id]
      );
      console.log(`   ? ID ${row.id}: ${row.status} ? corrigido`);
    }

    // PASSO 3: Forçar conversão para JSONB
    console.log('?? Convertendo coluna para JSONB...');
    await client.query(`
      ALTER TABLE noticias 
      ALTER COLUMN conteudo TYPE TEXT;
    `);
    
    await client.query(`
      UPDATE noticias 
      SET conteudo = '{"texto": ""}'
      WHERE conteudo IS NULL OR conteudo = '';
    `);
    
    await client.query(`
      ALTER TABLE noticias 
      ALTER COLUMN conteudo TYPE JSONB 
      USING conteudo::JSONB;
    `);

    console.log('?? BANCO CORRIGIDO COM SUCESSO!');
    console.log('?? Agora faça deploy novamente.');

  } catch (error) {
    console.error('? Erro:', error.message);
  } finally {
    await client.end();
  }
}

fixDatabase();
