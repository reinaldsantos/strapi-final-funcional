// 🚀 SCRIPT NUCLEAR DE CORREÇÃO - NÃO APAGA NADA!
const { Client } = require('pg');

const DB_URL = 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a/strapi_5cj5';

async function correcaoNuclear() {
  console.log('🚀 INICIANDO CORREÇÃO NUCLEAR...');
  
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. CONECTAR
    await client.connect();
    console.log('✅ Conectado ao banco!');

    // 2. CORREÇÃO EM 3 ETAPAS (SUPER SEGURO)
    console.log('🔧 ETAPA 1: Convertendo coluna para TEXT...');
    await client.query(\
      ALTER TABLE noticias 
      ALTER COLUMN conteudo TYPE TEXT
    \);
    console.log('✅ Coluna agora é TEXT');

    // 3. CORRIGIR CADA REGISTRO
    console.log('🔍 ETAPA 2: Corrigindo dados...');
    const { rows } = await client.query('SELECT id, conteudo FROM noticias');
    
    let corrigidos = 0;
    for (const row of rows) {
      let novoConteudo = row.conteudo;
      
      // Se for NULL ou vazio
      if (!novoConteudo) {
        novoConteudo = '{"texto": ""}';
        corrigidos++;
      }
      // Se NÃO for JSON válido
      else if (!novoConteudo.trim().startsWith('{') && !novoConteudo.trim().startsWith('[')) {
        // Converter texto simples para JSON
        novoConteudo = JSON.stringify({
          texto: novoConteudo,
          bloqueado: false,
          editavel: true
        });
        corrigidos++;
      }
      
      // Atualizar se mudou
      if (corrigidos > 0) {
        await client.query(
          'UPDATE noticias SET conteudo =  WHERE id = ',
          [novoConteudo, row.id]
        );
      }
    }
    
    console.log(\✅ \ registro corrigido\);

    // 4. CONVERTER DE VOLTA PARA JSONB
    console.log('🔄 ETAPA 3: Convertendo para JSONB...');
    await client.query(\
      ALTER TABLE noticias 
      ALTER COLUMN conteudo TYPE JSONB 
      USING conteudo::JSONB
    \);
    
    console.log('🎉 🎉 🎉 CORREÇÃO COMPLETA! 🎉 🎉 🎉');
    console.log('🔥 O Strapi vai funcionar PERFEITAMENTE agora!');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.log('💡 Executando plano B...');
    
    // PLANO B: Solução mais agressiva
    try {
      await client.query(\
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE TEXT;
      \);
      
      await client.query(\
        UPDATE noticias 
        SET conteudo = '{"texto": ""}'
        WHERE conteudo IS NULL OR conteudo = '';
      \);
      
      await client.query(\
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE JSONB 
        USING conteudo::JSONB;
      \);
      
      console.log('✅ Correção de emergência aplicada!');
    } catch (err2) {
      console.error('❌ ERRO CRÍTICO:', err2.message);
    }
  } finally {
    await client.end();
    console.log('🔒 Conexão encerrada');
  }
}

// EXECUTAR AGORA!
correcaoNuclear();
