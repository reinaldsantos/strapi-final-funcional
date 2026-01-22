"use strict";

module.exports = ({ strapi }) => {
  console.log("?????? HOOK DE LIFECYCLE INICIANDO ??????");
  
  // Usar o hook 'strapi.content-types.registered' que roda APÓS content-types
  strapi.hook('strapi::content-types.registered', async () => {
    console.log("?????? CONFIGURANDO PERMISSÕES VIA HOOK...");
    
    try {
      // Aguardar um pouco para garantir que tudo carregou
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 1. Encontrar role Public
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });
      
      if (!publicRole) {
        console.error('? Role Public não encontrado!');
        return;
      }
      
      console.log('? Role Public encontrado! ID:', publicRole.id);
      
      // 2. Lista das coleções
      const collections = [
        { singular: 'noticia', plural: 'noticias' },
        { singular: 'evento', plural: 'eventos' },
        { singular: 'curso', plural: 'cursos' }
      ];
      
      console.log('?? Coleções:', collections.map(c => c.singular).join(', '));
      
      // 3. Configurar permissões
      for (const collection of collections) {
        console.log(`\n?? ${collection.singular}:`);
        
        // Verificar se o content-type existe
        try {
          const contentType = strapi.contentType(`api::${collection.singular}.${collection.singular}`);
          console.log(`   ? Content-type encontrado`);
        } catch (error) {
          console.log(`   ? Content-type não encontrado: ${error.message}`);
          continue;
        }
        
        const actions = ['find', 'findOne'];
        
        for (const action of actions) {
          const actionName = `api::${collection.singular}.${collection.singular}.${action}`;
          
          // Verificar se já existe
          const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: {
              role: publicRole.id,
              action: actionName
            }
          });
          
          if (!exists) {
            console.log(`   ? Criando: ${action}`);
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action: actionName,
                role: publicRole.id
              }
            });
            console.log(`   ? ${action} criada!`);
          } else {
            console.log(`   ?? ${action} já existe`);
          }
        }
      }
      
      console.log('\n?????? PERMISSÕES CONFIGURADAS VIA HOOK! ??????');
      console.log('?? APIs devem funcionar AGORA!');
      console.log('\n?? Teste estas URLs:');
      console.log('   https://strapi-final-funcional.onrender.com/api/noticias');
      console.log('   https://strapi-final-funcional.onrender.com/api/eventos');
      console.log('   https://strapi-final-funcional.onrender.com/api/cursos');
      
    } catch (error) {
      console.error('? ERRO no hook:', error.message);
      console.error('Stack:', error.stack);
    }
  });
  
  // Backup: também executar após 60 segundos
  setTimeout(async () => {
    console.log('??? EXECUÇÃO DE BACKUP APÓS 60 SEGUNDOS...');
    
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });
      
      if (publicRole) {
        console.log('?? Verificando permissões no backup...');
        
        const collections = ['noticia', 'evento', 'curso'];
        for (const collection of collections) {
          const perms = await strapi.db.query('plugin::users-permissions.permission').findMany({
            where: {
              role: publicRole.id,
              action: { $contains: `api::${collection}.${collection}` }
            }
          });
          
          console.log(`   ${collection}: ${perms.length} permissões`);
        }
      }
    } catch (error) {
      // Ignorar erros no backup
    }
  }, 60000);
};
