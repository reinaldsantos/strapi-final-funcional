// CORREÇÃO DEFINITIVA DO BANCO
const { Client } = require('pg');

async function fixDatabase() {
  console.log('?? INICIANDO CORREÇÃO DEFINITIVA DO BANCO...');

  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com:5432/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('? Conectado ao banco!');

    // ETAPA 1: Diagnóstico
    console.log('\n?? DIAGNÓSTICO INICIAL:');
    
    // Verificar tabelas
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`   Tabelas encontradas: ${tabelas.rows.map(t => t.table_name).join(', ')}`);

    // Verificar estrutura da tabela noticias
    const colunas = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'noticias'
      ORDER BY ordinal_position
    `);
    
    console.log('\n?? ESTRUTURA da tabela noticias:');
    colunas.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });

    // ETAPA 2: Correção SEGURA
    console.log('\n?? INICIANDO CORREÇÃO...');

    // 1. Primeiro, verificar o tipo atual
    const tipoAtual = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'noticias' AND column_name = 'conteudo'
    `);
    
    console.log(`   Tipo atual da coluna 'conteudo': ${tipoAtual.rows[0]?.data_type || 'desconhecido'}`);

    // 2. Se for JSONB, converter para TEXT primeiro
    if (tipoAtual.rows[0]?.data_type === 'jsonb') {
      console.log('   Convertendo JSONB ? TEXT...');
      await client.query('ALTER TABLE noticias ALTER COLUMN conteudo TYPE TEXT');
    }

    // 3. Corrigir dados inválidos
    console.log('   Corrigindo dados inválidos...');
    
    // a) NULLs e vazios
    const nulls = await client.query(`
      UPDATE noticias 
      SET conteudo = '{"texto": "", "_corrigido": true}'
      WHERE conteudo IS NULL OR conteudo = ''
      RETURNING id
    `);
    console.log(`      ${nulls.rowCount} NULLs/vazios corrigidos`);

    // b) Textos não-JSON
    const naoJson = await client.query(`
      SELECT id, conteudo
      FROM noticias
      WHERE conteudo IS NOT NULL 
      AND conteudo != ''
      AND (conteudo !~ '^[[:space:]]*\{' AND conteudo !~ '^[[:space:]]*\[')
    `);

    if (naoJson.rows.length > 0) {
      console.log(`      ${naoJson.rows.length} textos não-JSON encontrados`);
      
      for (const row of naoJson.rows) {
        const texto = row.conteudo.toString().trim();
        const jsonValido = JSON.stringify({ 
          texto: texto,
          _corrigido: true,
          _original_length: texto.length,
          _timestamp: new Date().toISOString()
        });
        
        await client.query(
          'UPDATE noticias SET conteudo = $1 WHERE id = $2',
          [jsonValido, row.id]
        );
      }
      console.log('      Todos convertidos para JSON');
    }

    // 4. Converter para JSONB
    console.log('   Convertendo TEXT ? JSONB...');
    try {
      await client.query(`
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE JSONB 
        USING conteudo::JSONB
      `);
      console.log('      ? Conversão bem-sucedida!');
    } catch (e) {
      console.log(`      ? Erro na conversão: ${e.message}`);
      console.log('      Tentando método alternativo...');
      
      // Método alternativo
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
      await client.query(`
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE JSONB 
        USING conteudo::JSONB
      `);
      console.log('      ? Método alternativo aplicado!');
    }

    // ETAPA 3: Verificação final
    console.log('\n? VERIFICAÇÃO FINAL:');
    
    const verificacao = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN conteudo IS NULL THEN 1 END) as nulls,
        COUNT(CASE WHEN jsonb_typeof(conteudo) IS NOT NULL THEN 1 END) as valid_jsonb
      FROM noticias
    `);
    
    console.log(`   Total registros: ${verificacao.rows[0].total}`);
    console.log(`   NULLs: ${verificacao.rows[0].nulls}`);
    console.log(`   JSONB válidos: ${verificacao.rows[0].valid_jsonb}`);
    
    if (verificacao.rows[0].valid_jsonb === verificacao.rows[0].total) {
      console.log('\n?? ?? ?? CORREÇÃO COMPLETA COM SUCESSO! ?? ?? ??');
      console.log('?? O Strapi vai iniciar normalmente agora!');
      console.log('?? Faça deploy novamente!');
    } else {
      console.log('\n??  Ainda há problemas no banco');
      console.log('?? Contate o suporte para ajuda adicional');
    }

  } catch (error) {
    console.error('\n? ERRO CRÍTICO:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n?? Conexão encerrada');
  }
}

// Executar
fixDatabase();
