// CORREÇÃO DEFINITIVA - VERSÃO SEGURA
const { Client } = require('pg');

async function fixDatabase() {
  console.log('?? CORREÇÃO DEFINITIVA DO BANCO (versão segura)...');

  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com:5432/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('? Conectado ao banco!');

    // ETAPA 1: Diagnóstico simples
    console.log('\n?? VERIFICANDO DADOS PROBLEMÁTICOS...');
    
    // Buscar todos os registros
    const { rows } = await client.query('SELECT id, conteudo FROM noticias');
    console.log(`   Total registros: ${rows.length}`);
    
    let nullCount = 0;
    let emptyCount = 0;
    let invalidJsonCount = 0;
    let validCount = 0;
    
    // Analisar cada registro
    for (const row of rows) {
      if (row.conteudo === null) {
        nullCount++;
      } else if (row.conteudo === '') {
        emptyCount++;
      } else {
        // Tentar verificar se é JSON
        try {
          JSON.parse(row.conteudo);
          validCount++;
        } catch (e) {
          invalidJsonCount++;
        }
      }
    }
    
    console.log(`   ? JSON válidos: ${validCount}`);
    console.log(`   ? NULLs: ${nullCount}`);
    console.log(`   ? Vazios: ${emptyCount}`);
    console.log(`   ? JSON inválidos: ${invalidJsonCount}`);

    // ETAPA 2: Correção SIMPLES e SEGURA
    console.log('\n?? APLICANDO CORREÇÃO...');
    
    // 1. Corrigir NULLs
    if (nullCount > 0) {
      await client.query(`
        UPDATE noticias 
        SET conteudo = '{"texto": "", "_corrigido": "null"}'
        WHERE conteudo IS NULL
      `);
      console.log(`   ? ${nullCount} NULLs corrigidos`);
    }
    
    // 2. Corrigir vazios
    if (emptyCount > 0) {
      await client.query(`
        UPDATE noticias 
        SET conteudo = '{"texto": "", "_corrigido": "empty"}'
        WHERE conteudo = ''
      `);
      console.log(`   ? ${emptyCount} vazios corrigidos`);
    }
    
    // 3. Corrigir JSON inválidos
    if (invalidJsonCount > 0) {
      console.log(`   ?? Corrigindo ${invalidJsonCount} JSONs inválidos...`);
      
      // Buscar registros inválidos
      const invalidRows = rows.filter(row => {
        if (row.conteudo === null || row.conteudo === '') return false;
        try {
          JSON.parse(row.conteudo);
          return false;
        } catch {
          return true;
        }
      });
      
      for (const row of invalidRows) {
        const texto = String(row.conteudo).trim();
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
      console.log(`   ? ${invalidJsonCount} JSONs inválidos corrigidos`);
    }

    // ETAPA 3: Converter para JSONB
    console.log('\n?? CONVERTENDO PARA JSONB...');
    
    try {
      // Primeiro garantir que tudo seja TEXT válido
      await client.query(`
        UPDATE noticias 
        SET conteudo = '{"texto": "", "_corrigido": "fallback"}'
        WHERE conteudo IS NULL OR conteudo = ''
      `);
      
      // Converter para JSONB
      await client.query(`
        ALTER TABLE noticias 
        ALTER COLUMN conteudo TYPE JSONB 
        USING conteudo::JSONB
      `);
      
      console.log('   ? Conversão para JSONB bem-sucedida!');
      
    } catch (error) {
      console.log(`   ? Erro na conversão: ${error.message}`);
      console.log('   ?? Tentando método alternativo...');
      
      // Método alternativo: criar nova coluna
      await client.query('ALTER TABLE noticias ADD COLUMN conteudo_new JSONB DEFAULT \'{"texto":""}\'::jsonb');
      
      // Copiar dados convertendo
      const allRows = await client.query('SELECT id, conteudo FROM noticias');
      
      for (const row of allRows.rows) {
        let jsonData;
        try {
          if (!row.conteudo || row.conteudo === '') {
            jsonData = { texto: "" };
          } else {
            try {
              jsonData = JSON.parse(row.conteudo);
            } catch {
              jsonData = { 
                texto: String(row.conteudo),
                _corrigido: true 
              };
            }
          }
          
          await client.query(
            'UPDATE noticias SET conteudo_new = $1 WHERE id = $2',
            [jsonData, row.id]
          );
          
        } catch (e) {
          // Se falhar, usar valor padrão
          await client.query(
            'UPDATE noticias SET conteudo_new = \'{"texto":"","_erro":"correcao"}\'::jsonb WHERE id = $1',
            [row.id]
          );
        }
      }
      
      // Remover coluna antiga e renomear nova
      await client.query('ALTER TABLE noticias DROP COLUMN conteudo');
      await client.query('ALTER TABLE noticias RENAME COLUMN conteudo_new TO conteudo');
      
      console.log('   ? Método alternativo aplicado!');
    }

    // ETAPA 4: Verificação final
    console.log('\n? VERIFICAÇÃO FINAL:');
    
    try {
      const check = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN conteudo IS NULL THEN 1 END) as nulls,
          COUNT(CASE WHEN jsonb_typeof(conteudo) = 'object' THEN 1 END) as valid_objects
        FROM noticias
      `);
      
      console.log(`   Total registros: ${check.rows[0].total}`);
      console.log(`   NULLs: ${check.rows[0].nulls}`);
      console.log(`   Objetos JSONB válidos: ${check.rows[0].valid_objects}`);
      
      if (check.rows[0].nulls === 0) {
        console.log('\n?? ?? ?? CORREÇÃO COMPLETA COM SUCESSO! ?? ?? ??');
        console.log('?? O Strapi deve iniciar normalmente agora!');
        console.log('?? Faça deploy manual no Render!');
      } else {
        console.log('\n??  Ainda há NULLs no banco');
      }
      
    } catch (e) {
      console.log('   ??  Não foi possível verificar jsonb_typeof (coluna pode não ser JSONB ainda)');
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
