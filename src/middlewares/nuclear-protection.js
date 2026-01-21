'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // Executa a ação original primeiro
      await next();
      
      // ========== PÓS-PROCESSAMENTO NUCLEAR ==========
      
      // Se foi uma criação ou atualização de conteúdo
      if (ctx.request.method === 'POST' || ctx.request.method === 'PUT') {
        const path = ctx.request.path;
        
        // Verifica se é um dos tipos de conteúdo protegidos
        if (path.includes('/api/noticias') || 
            path.includes('/api/eventos') || 
            path.includes('/api/cursos')) {
          
          // Aguarda um momento para garantir que o conteúdo foi salvo
          setTimeout(async () => {
            try {
              // Obtém o ID do conteúdo (pode estar no response ou params)
              let contentId = ctx.response.body?.data?.id || ctx.params.id;
              
              if (contentId) {
                // Determina o tipo de conteúdo pelo path
                let contentType = '';
                if (path.includes('noticias')) contentType = 'noticias';
                else if (path.includes('eventos')) contentType = 'eventos';
                else if (path.includes('cursos')) contentType = 'cursos';
                
                if (contentType) {
                  // Garante que o conteúdo está publicado
                  await strapi.entityService.update(`api::${contentType}.${contentType}`, contentId, {
                    data: { publicado: true }
                  });
                  
                  console.log(`✅ SISTEMA NUCLEAR: Conteúdo ${contentType}/${contentId} garantido como publicado`);
                }
              }
            } catch (error) {
              console.log('⚠️ Sistema Nuclear: Erro ao garantir publicação:', error.message);
            }
          }, 1000); // 1 segundo de delay
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no middleware Nuclear:', error);
      throw error;
    }
  };
};