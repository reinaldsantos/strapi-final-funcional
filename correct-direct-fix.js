// correct-direct-fix.js - Baseado na estrutura REAL do banco
const { Client } = require('pg');

async function correctFix() {
  console.log('?????? FIX CORRETO BASEADO NA ESTRUTURA REAL ??????\n');
  
  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com:5432/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('? Conectado ao banco!');
    
    // 1. Encontrar ID do role Public (CORRETO)
    console.log('\n?? Buscando role Public...');
    const roleResult = await client.query(`
      SELECT id FROM up_roles WHERE type = 'public' LIMIT 1
    `);
    
    if (roleResult.rows.length === 0) {
      console.log('? Role Public não encontrado!');
      return;
    }
    
    const publicRoleId = roleResult.rows[0].id;
    console.log(`? Role Public encontrado! ID: ${publicRoleId}`);
    
    // 2. Lista das coleções
    const collections = [
      { singular: 'noticia', plural: 'noticias' },
      { singular: 'evento', plural: 'eventos' },
      { singular: 'curso', plural: 'cursos' }
    ];
    
    console.log('\n?? Configurando permissões para:', collections.map(c => c.singular).join(', '));
    
    let totalCreated = 0;
    
    // 3. Para cada coleção, criar permissões
    for (const collection of collections) {
      console.log(`\n?? ${collection.singular}:`);
      
      const actions = ['find', 'findOne'];
      
      for (const action of actions) {
        const actionName = `api::${collection.singular}.${collection.singular}.${action}`;
        
        // Verificar se a permissão já existe
        const permExists = await client.query(`
          SELECT p.id 
          FROM up_permissions p
          JOIN up_permissions_role_links prl ON p.id = prl.permission_id
          WHERE p.action = $1 AND prl.role_id = $2
        `, [actionName, publicRoleId]);
        
        if (permExists.rows.length === 0) {
          // Primeiro, criar a permissão
          const permResult = await client.query(`
            INSERT INTO up_permissions (action, created_at, updated_at)
            VALUES ($1, NOW(), NOW())
            RETURNING id
          `, [actionName]);
          
          const permissionId = permResult.rows[0].id;
          
          // Depois, linkar ao role
          await client.query(`
            INSERT INTO up_permissions_role_links (permission_id, role_id)
            VALUES ($1, $2)
          `, [permissionId, publicRoleId]);
          
          console.log(`   ? Criada: ${action}`);
          totalCreated++;
        } else {
          console.log(`   ?? Já existe: ${action}`);
        }
      }
    }
    
    // 4. Verificar resultado
    console.log('\n?? VERIFICAÇÃO FINAL:');
    
    const checkResult = await client.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total,
        COUNT(DISTINCT CASE WHEN p.action LIKE 'api::noticia.noticia%' THEN p.id END) as noticia_perms,
        COUNT(DISTINCT CASE WHEN p.action LIKE 'api::evento.evento%' THEN p.id END) as evento_perms,
        COUNT(DISTINCT CASE WHEN p.action LIKE 'api::curso.curso%' THEN p.id END) as curso_perms
      FROM up_permissions p
      JOIN up_permissions_role_links prl ON p.id = prl.permission_id
      WHERE prl.role_id = $1
    `, [publicRoleId]);
    
    console.log(`   Total permissões para role Public: ${checkResult.rows[0].total}`);
    console.log(`   Noticia: ${checkResult.rows[0].noticia_perms}`);
    console.log(`   Evento: ${checkResult.rows[0].evento_perms}`);
    console.log(`   Curso: ${checkResult.rows[0].curso_perms}`);
    
    if (checkResult.rows[0].total >= 6) {
      console.log('\n?????? PERMISSÕES CONFIGURADAS COM SUCESSO! ??????');
      console.log(`   ${totalCreated} novas permissões criadas`);
      console.log('\n?????? Agora as APIs DEVEM funcionar!');
      console.log('?? Aguarde 30 segundos para o Strapi detectar as mudanças');
      
      console.log('\n?? URLs para teste:');
      console.log('   https://strapi-final-funcional.onrender.com/api/noticias');
      console.log('   https://strapi-final-funcional.onrender.com/api/eventos');
      console.log('   https://strapi-final-funcional.onrender.com/api/cursos');
    } else {
      console.log('\n??????  Permissões incompletas!');
      console.log('?? Tente executar este script novamente');
    }
    
  } catch (error) {
    console.error('??? ERRO:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n?? Conexão encerrada');
  }
}

// Executar
correctFix();
