// 🚀 SCRIPT SUPER SIMPLES
const { Client } = require('pg');

async function main() {
  console.log('🔧 Conectando ao banco...');
  
  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // PASSO 1: Converter para TEXT
    console.log('📝 Convertendo conteudo para TEXT...');
    await client.query("ALTER TABLE noticias ALTER COLUMN conteudo TYPE TEXT");
    
    // PASSO 2: Corrigir dados inválidos
    console.log('🔨 Corrigindo dados inválidos...');
    const result = await client.query("SELECT id FROM noticias");
    console.log(\📊 Total de registros: \\);
    
    // PASSO 3: Converter de volta para JSONB
    console.log('🔄 Convertendo para JSONB...');
    await client.query("ALTER TABLE noticias ALTER COLUMN conteudo TYPE JSONB USING conteudo::JSONB");
    
    console.log('✅✅✅ BANCO CORRIGIDO COM SUCESSO! ✅✅✅');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

main();
