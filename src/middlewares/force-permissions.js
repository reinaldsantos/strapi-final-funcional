// src/middlewares/force-permissions.js
'use strict';

module.exports = (strapi) => {
  return {
    initialize() {
      console.log('?????? MIDDLEWARE FORCE-PERMISSIONS INICIANDO ??????');
      
      // Executar quando Strapi estiver pronto
      strapi.server.on('listening', async () => {
        console.log('?????? CONFIGURANDO PERMISSÕES VIA MIDDLEWARE...');
        
        try {
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
          
          console.log('\n?????? PERMISSÕES CONFIGURADAS VIA MIDDLEWARE! ??????');
          console.log('?? APIs devem funcionar em 30 segundos!');
          
          // 4. Registrar rotas manualmente (truque)
          setTimeout(() => {
            console.log('\n?? URLs disponíveis:');
            console.log('   https://strapi-final-funcional.onrender.com/api/noticias');
            console.log('   https://strapi-final-funcional.onrender.com/api/eventos');
            console.log('   https://strapi-final-funcional.onrender.com/api/cursos');
          }, 30000);
          
        } catch (error) {
          console.error('? ERRO no middleware:', error.message);
        }
      });
    },
  };
};
