// Diagnóstico do banco
const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a/strapi_5cj5",
  ssl: { rejectUnauthorized: false }
});

async function diagnosticar() {
  try {
    await client.connect();
    console.log("=== DIAGNÓSTICO DO BANCO ===");
    
    // 1. Ver tabelas
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("\n📋 TABELAS EXISTENTES:");
    tabelas.rows.forEach(t => console.log(" - " + t.table_name));
    
    // 2. Ver estrutura da tabela noticias
    if (tabelas.rows.some(t => t.table_name === 'noticias')) {
      const colunas = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'noticias'
        ORDER BY ordinal_position;
      `);
      
      console.log("\n🔧 ESTRUTURA da tabela 'noticias':");
      colunas.rows.forEach(c => {
        console.log(` - ${c.column_name}: ${c.data_type} (${c.is_nullable})`);
      });
      
      // 3. Ver alguns dados
      const dados = await client.query(`
        SELECT id, conteudo 
        FROM noticias 
        LIMIT 3
      `);
      
      console.log(`\n📊 PRIMEIROS ${dados.rows.length} REGISTROS:`);
      dados.rows.forEach((d, i) => {
        console.log(`  ${i+1}. ID ${d.id}:`);
        console.log(`     Tipo: ${typeof d.conteudo}`);
        if (d.conteudo) {
          console.log(`     Valor: ${JSON.stringify(d.conteudo).substring(0, 80)}...`);
        }
      });
    }
    
  } catch (error) {
    console.log("❌ ERRO no diagnóstico:", error.message);
  } finally {
    await client.end();
  }
}

diagnosticar();
