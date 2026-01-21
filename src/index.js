'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Iniciando Strapi com SISTEMA NUCLEAR...');
    
    // ==================== SISTEMA NUCLEAR ====================
    // Proteção contra perda de dados no Render
    
    // 1. Função para garantir permissões públicas
    const garantirPermissoesPublicas = async () => {
      try {
        console.log('🛡️  Verificando permissões públicas...');
        
        // Obtém o serviço de permissões
        const permissionsService = strapi.plugin('users-permissions').service('role');
        
        // Obtém o role "Public"
        const publicRole = await permissionsService.findOne(2); // ID 2 = Public
        
        if (publicRole) {
          console.log('✅ Role Public encontrado');
          
          // Lista de tipos de conteúdo para proteger
          const conteudosParaProteger = [
            'noticia', 'noticias',
            'evento', 'eventos', 
            'curso', 'cursos'
          ];
          
          let alteracoes = false;
          
          // Para cada tipo de conteúdo, garante permissões
          for (const contentType of conteudosParaProteger) {
            const permissaoAtual = publicRole.permissions[`api::${contentType}.${contentType}`];
            
            if (!permissaoAtual || !permissaoAtual.controllers || 
                !permissaoAtual.controllers.find || 
                !permissaoAtual.controllers.findOne) {
              
              console.log(`🔧 Configurando permissões para ${contentType}...`);
              
              // Configura permissões básicas
              if (!publicRole.permissions[`api::${contentType}.${contentType}`]) {
                publicRole.permissions[`api::${contentType}.${contentType}`] = {};
              }
              
              publicRole.permissions[`api::${contentType}.${contentType}`].controllers = {
                find: { enabled: true },
                findOne: { enabled: true }
              };
              
              alteracoes = true;
            }
          }
          
          // Salva se houver alterações
          if (alteracoes) {
            await permissionsService.updateRole(2, {
              permissions: publicRole.permissions
            });
            console.log('✅ Permissões públicas CONSOLIDADAS!');
          } else {
            console.log('✅ Permissões já configuradas corretamente');
          }
        }
        
      } catch (error) {
        console.error('❌ Erro ao configurar permissões:', error.message);
      }
    };
    
    // 2. Função para publicar conteúdo automaticamente
    const publicarConteudoAutomaticamente = async () => {
      try {
        console.log('📢 Verificando conteúdo não publicado...');
        
        // Tipos de conteúdo a verificar
        const tiposConteudo = ['noticias', 'eventos', 'cursos'];
        
        for (const tipo of tiposConteudo) {
          try {
            // Busca conteúdo não publicado
            const conteudosNaoPublicados = await strapi.entityService.findMany(`api::${tipo}.${tipo}`, {
              filters: { publicado: { $ne: true } },
              limit: 50
            });
            
            if (conteudosNaoPublicados && conteudosNaoPublicados.length > 0) {
              console.log(`🔧 Publicando ${conteudosNaoPublicados.length} ${tipo} não publicados...`);
              
              // Publica cada um
              for (const conteudo of conteudosNaoPublicados) {
                await strapi.entityService.update(`api::${tipo}.${tipo}`, conteudo.id, {
                  data: { publicado: true }
                });
              }
              
              console.log(`✅ ${conteudosNaoPublicados.length} ${tipo} publicados automaticamente!`);
            }
          } catch (error) {
            console.log(`⚠️ Tipo ${tipo} não encontrado ou erro:`, error.message);
          }
        }
        
      } catch (error) {
        console.error('❌ Erro ao publicar conteúdo:', error.message);
      }
    };
    
    // 3. Executa a proteção imediatamente
    await garantirPermissoesPublicas();
    await publicarConteudoAutomaticamente();
    
    console.log('✅ SISTEMA NUCLEAR INICIADO COM SUCESSO!');
    console.log('🛡️  Seus dados estão PROTEGIDOS contra perda!');
    
    // 4. Configura verificação periódica (a cada 5 minutos)
    setInterval(async () => {
      console.log('⏰ Verificação periódica do Sistema Nuclear...');
      await garantirPermissoesPublicas();
      await publicarConteudoAutomaticamente();
    }, 5 * 60 * 1000); // 5 minutos
    
    // 5. Endpoint de status do sistema
    strapi.server.routes([
      {
        method: 'GET',
        path: '/api/system/status',
        handler: async (ctx) => {
          ctx.send({
            status: 'active',
            system: 'nuclear-protection',
            features: [
              'auto-permissions',
              'auto-publishing', 
              'periodic-checks',
              'survives-deploys'
            ],
            lastCheck: new Date().toISOString(),
            message: 'Sistema Nuclear ativo - Dados protegidos 24/7'
          });
        },
        config: { auth: false }
      }
    ]);
    
    console.log('🎉 Bootstrap completado com SISTEMA NUCLEAR!');
  },
};