// direct-fix-permissions.js - Configura permissões DIRETAMENTE no banco
const { Client } = require('pg');

async function directFix() {
  console.log('?????? CONFIGURAÇÃO DIRETA DE PERMISSÕES NO BANCO ??????\n');
  
  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com:5432/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('? Conectado ao banco!');
    
    // 1. Encontrar ID do role Public
    console.log('\n?? Buscando role Public...');
    const roleResult = await client.query(`
      SELECT id FROM up_roles WHERE type = 'public' LIMIT 1
    `);
    
    if (roleResult.rows.length === 0) {
      console.log('? Role Public não encontrado na tabela up_roles!');
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
    
    // 3. Para cada coleção, criar permissões find e findOne
    for (const collection of collections) {
      console.log(`\n?? ${collection.singular}:`);
      
      const actions = ['find', 'findOne'];
      
      for (const action of actions) {
        const actionName = `api::${collection.singular}.${collection.singular}.${action}`;
        
        // Verificar se já existe
        const existsResult = await client.query(`
          SELECT id FROM up_permissions 
          WHERE role = $1 AND action = $2
        `, [publicRoleId, actionName]);
        
        if (existsResult.rows.length === 0) {
          // Criar permissão
          await client.query(`
            INSERT INTO up_permissions (action, role, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
          `, [actionName, publicRoleId]);
          
          console.log(`   ? Criada: ${action}`);
        } else {
          console.log(`   ?? Já existe: ${action}`);
        }
      }
    }
    
    // 4. Verificar resultado
    console.log('\n?? VERIFICAÇÃO FINAL:');
    const checkResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN action LIKE 'api::noticia.noticia%' THEN 1 END) as noticia_perms,
        COUNT(CASE WHEN action LIKE 'api::evento.evento%' THEN 1 END) as evento_perms,
        COUNT(CASE WHEN action LIKE 'api::curso.curso%' THEN 1 END) as curso_perms
      FROM up_permissions
      WHERE role = $1
    `, [publicRoleId]);
    
    console.log(`   Total permissões para role Public: ${checkResult.rows[0].total}`);
    console.log(`   Noticia: ${checkResult.rows[0].noticia_perms}`);
    console.log(`   Evento: ${checkResult.rows[0].evento_perms}`);
    console.log(`   Curso: ${checkResult.rows[0].curso_perms}`);
    
    if (checkResult.rows[0].total >= 6) { // 2 permissões × 3 coleções = 6
      console.log('\n?????? PERMISSÕES CONFIGURADAS COM SUCESSO! ??????');
      console.log('?????? Agora as APIs DEVEM funcionar!');
      console.log('\n?? Aguarde 30 segundos e teste:');
      console.log('   https://strapi-final-funcional.onrender.com/api/noticias');
    } else {
      console.log('\n??????  Permissões incompletas!');
    }
    
  } catch (error) {
    console.error('??? ERRO:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n?? Conexão encerrada');
  }
}

directFix();
