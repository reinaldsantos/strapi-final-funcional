// Verificação corrigida
const { Client } = require('pg');

async function verify() {
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
    
    console.log('=== VERIFICAÇÃO DO BANCO ===');
    
    // Verificar tabela
    const existe = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'noticias'
      )
    `);
    
    if (!existe.rows[0].exists) {
      console.log('? Tabela noticias não existe');
      return;
    }
    
    // Verificar estrutura
    const estrutura = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'noticias'
      ORDER BY ordinal_position
    `);
    
    console.log('\n?? ESTRUTURA DA TABELA:');
    estrutura.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar dados
    const dados = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN conteudo IS NULL THEN 1 END) as nulls,
        COUNT(CASE WHEN conteudo::text ~ '^[[:space:]]*\{' THEN 1 END) as valid_json,
        COUNT(CASE WHEN conteudo::text !~ '^[[:space:]]*\{' AND conteudo::text !~ '^[[:space:]]*\[' THEN 1 END) as invalid
      FROM noticias
    `);
    
    console.log('\n?? ESTATÍSTICAS:');
    console.log(`   Total registros: ${dados.rows[0].total}`);
    console.log(`   JSON válidos: ${dados.rows[0].valid_json}`);
    console.log(`   NULLs: ${dados.rows[0].nulls}`);
    console.log(`   Inválidos: ${dados.rows[0].invalid}`);
    
    if (dados.rows[0].invalid > 0) {
      console.log('\n? AINDA HÁ DADOS INVÁLIDOS!');
      console.log('?? Execute o script de correção novamente.');
    } else {
      console.log('\n? TODOS OS DADOS ESTÃO VÁLIDOS!');
      console.log('?? Pode fazer deploy com segurança.');
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await client.end();
  }
}

verify();
