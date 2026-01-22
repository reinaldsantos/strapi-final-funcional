const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com:5432/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('?? VERIFICANDO CONTENT-TYPES NO BANCO:\n');
    
    // Verificar tabelas de content-types
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('noticias', 'eventos', 'cursos')
      ORDER BY table_name
    `);
    
    console.log('?? TABELAS ENCONTRADAS:');
    tables.rows.forEach(row => {
      console.log(`   ? ${row.table_name}`);
    });
    
    if (tables.rows.length === 0) {
      console.log('   ? NENHUMA tabela encontrada!');
      console.log('\n?? PROBLEMA: Tabelas não existem no banco.');
      console.log('   Solução: O Strapi não criou as tabelas automaticamente.');
    } else if (tables.rows.length < 3) {
      console.log(`\n??  Faltam tabelas! Esperado: 3, Encontrado: ${tables.rows.length}`);
    } else {
      console.log('\n? Todas as 3 tabelas existem no banco!');
    }
    
    // Verificar se tem dados
    console.log('\n?? DADOS NAS TABELAS:');
    for (const table of ['noticias', 'eventos', 'cursos']) {
      if (tables.rows.some(t => t.table_name === table)) {
        const count = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`   ${table}: ${count.rows[0].count} registros`);
      } else {
        console.log(`   ${table}: ? tabela não existe`);
      }
    }
    
  } catch (error) {
    console.error('? Erro:', error.message);
  } finally {
    await client.end();
  }
}

check();
