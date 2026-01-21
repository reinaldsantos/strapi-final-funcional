'use strict';

module.exports = {
  async bootstrap({ strapi }) {
    console.log('🚀 Inicializando Strapi com Sistema Nuclear corrigido...');
    
    // 🔥 SISTEMA DE PERMISSÕES PERMANENTE
    try {
      // 1. Garantir role Public
      let publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });
      
      if (!publicRole) {
        console.log('🔧 Criando role Public...');
        publicRole = await strapi.db.query('plugin::users-permissions.role').create({
          data: {
            name: 'Public',
            type: 'public',
            description: 'Default role given to unauthenticated user.'
          }
        });
      }
      
      // 2. Configurar permissões para as coleções EXISTENTES
      // Use os nomes CORRETOS no singular (conforme seus logs)
      const colecoes = [
        'api::noticia.noticia',    // SINGULAR (conforme log)
        'api::evento.evento',      // SINGULAR
        'api::curso.curso'         // SINGULAR
      ];
      
      for (const colecao of colecoes) {
        try {
          // Verificar se a coleção existe
          const model = strapi.getModel(colecao);
          if (!model) {
            console.log(\⚠️  Coleção \ não encontrada\);
            continue;
          }
          
          // Configurar permissões find e findOne
          const permissoes = ['find', 'findOne'];
          
          for (const acao of permissoes) {
            const acaoCompleta = \\.\\;
            
            const existe = await strapi.db.query('plugin::users-permissions.permission').findOne({
              where: {
                action: acaoCompleta,
                role: publicRole.id
              }
            });
            
            if (!existe) {
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: {
                  action: acaoCompleta,
                  role: publicRole.id
                }
              });
              console.log(\✅ Permissão criada: \\);
            }
          }
          
        } catch (error) {
          console.log(\⚠️  Erro em \:\, error.message);
        }
      }
      
      console.log('🔒 Permissões configuradas com SUCESSO!');
      console.log('🎉 Agora NUNCA MAIS vão sumir!');
      
    } catch (error) {
      console.log('⚠️  Erro no sistema de permissões:', error.message);
    }
    
    // 🔄 SISTEMA NUCLEAR DE VERIFICAÇÃO PERIÓDICA
    setInterval(async () => {
      try {
        console.log('🛡️  Verificação periódica do Sistema Nuclear...');
        
        // Verificar role Public
        const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type: 'public' }
        });
        
        if (publicRole) {
          console.log('✅ Role Public encontrado');
          
          // Verificar permissões CRÍTICAS
          const permissoesCriticas = [
            'api::noticia.noticia.find',
            'api::noticia.noticia.findOne',
            'api::evento.evento.find',
            'api::evento.evento.findOne', 
            'api::curso.curso.find',
            'api::curso.curso.findOne'
          ];
          
          for (const permissao of permissoesCriticas) {
            const existe = await strapi.db.query('plugin::users-permissions.permission').findOne({
              where: {
                action: permissao,
                role: publicRole.id
              }
            });
            
            if (!existe) {
              console.log(\🔧 Recriando permissão: \\);
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: {
                  action: permissao,
                  role: publicRole.id
                }
              });
            }
          }
          
          console.log('✅ Permissões públicas CONSOLIDADAS!');
          
          // Verificar conteúdo não publicado (OPCIONAL)
          try {
            for (const colecao of ['noticia', 'evento', 'curso']) {
              const model = strapi.getModel(\pi::\.\\);
              if (model) {
                const naoPublicados = await strapi.db.query(\pi::\.\\).count({
                  where: { publicado: false }
                });
                if (naoPublicados > 0) {
                  console.log(\📢 \: \ item(s) não publicado(s)\);
                }
              }
            }
          } catch (error) {
            // Ignora erros nesta parte
          }
          
        } else {
          console.log('⚠️  Role Public NÃO encontrado! Recriando...');
          await strapi.db.query('plugin::users-permissions.role').create({
            data: {
              name: 'Public',
              type: 'public',
              description: 'Default role given to unauthenticated user.'
            }
          });
        }
        
      } catch (error) {
        console.log('⚠️  Erro na verificação periódica:', error.message);
      }
    }, 300000); // Verifica a cada 5 minutos (300000 ms)
    
    console.log('🎉 Sistema Nuclear ativado e corrigido!');
  },
};
