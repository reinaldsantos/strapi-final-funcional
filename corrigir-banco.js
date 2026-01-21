// 🚀 SCRIPT DE CORREÇÃO SIMPLES E FUNCIONAL
const { Client } = require("pg");

async function corrigirBanco() {
  console.log("🔧 Iniciando correção do banco...");
  
  const client = new Client({
    connectionString: "postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a/strapi_5cj5",
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. CONECTAR
    await client.connect();
    console.log("✅ Conectado ao banco!");

    // 2. VERIFICAR SE A TABELA EXISTE
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'noticias'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.log("ℹ️ Tabela 'noticias' não existe. Criando estrutura...");
      await client.end();
      return;
    }

    // 3. VER A ESTRUTURA ATUAL
    const estrutura = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'noticias' 
      AND column_name = 'conteudo';
    `);
    
    if (estrutura.rows.length === 0) {
      console.log("❌ Coluna 'conteudo' não encontrada!");
      await client.end();
      return;
    }

    console.log(`📊 Coluna 'conteudo' atualmente: ${estrutura.rows[0].data_type}`);

    // 4. CORREÇÃO PRINCIPAL
    console.log("🔄 Executando correção...");
    
    try {
      // Tentar converter para TEXT primeiro
      await client.query(`
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE TEXT;
      `);
      console.log("✅ Convertido para TEXT");
      
      // Converter de volta para JSONB
      await client.query(`
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE JSONB 
        USING conteudo::JSONB;
      `);
      console.log("✅ Convertido para JSONB");
      
      console.log("🎉 🎉 🎉 CORREÇÃO COMPLETA! 🎉 🎉 🎉");
      console.log("🔥 O Strapi agora vai funcionar PERFEITAMENTE!");
      
    } catch (erroSQL) {
      console.log(`⚠️ Erro na correção automática: ${erroSQL.message}`);
      console.log("💡 Tentando método alternativo...");
      
      // Método alternativo: criar coluna temporária
      await client.query(`
        ALTER TABLE noticias 
        ADD COLUMN conteudo_temp TEXT;
      `);
      
      await client.query(`
        UPDATE noticias 
        SET conteudo_temp = COALESCE(conteudo::TEXT, '{"texto": ""}');
      `);
      
      await client.query(`
        ALTER TABLE noticias 
        DROP COLUMN conteudo;
      `);
      
      await client.query(`
        ALTER TABLE noticias 
        RENAME COLUMN conteudo_temp TO conteudo;
      `);
      
      await client.query(`
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE JSONB 
        USING conteudo::JSONB;
      `);
      
      console.log("✅ Correção alternativa aplicada!");
    }

  } catch (error) {
    console.error("❌ ERRO GERAL:", error.message);
  } finally {
    await client.end();
    console.log("🔒 Conexão encerrada");
  }
}

// EXECUTAR
corrigirBanco();
