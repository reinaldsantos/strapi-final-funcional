const { Client } = require('pg');

async function verify() {
  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Verificar se agora funciona
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN conteudo::text ~ '^[[:space:]]*\{' THEN 1 ELSE 0 END) as valid_json,
        SUM(CASE WHEN conteudo IS NULL THEN 1 ELSE 0 END) as nulls
      FROM noticias
    `);
    
    console.log('?? VERIFICAÇÃO:');
    console.log(`   Total registros: ${result.rows[0].total}`);
    console.log(`   JSON válidos: ${result.rows[0].valid_json}`);
    console.log(`   NULLs: ${result.rows[0].nulls}`);
    
    if (result.rows[0].valid_json == result.rows[0].total) {
      console.log('? TODOS os dados estão em JSON válido!');
      console.log('?? Agora pode fazer push e deploy!');
    } else {
      console.log('? Ainda há dados inválidos');
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await client.end();
  }
}

verify();
