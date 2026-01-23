// middleware público de emergência
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const publicPaths = [
      '/api/noticias',
      '/api/noticias/:id',
      '/api/eventos',
      '/api/eventos/:id', 
      '/api/cursos',
      '/api/cursos/:id'
    ];
    
    const currentPath = ctx.request.path;
    
    // Verificar se é uma rota pública
    const isPublicRoute = publicPaths.some(path => {
      if (path.includes(':id')) {
        const basePath = path.split('/:id')[0];
        return currentPath.startsWith(basePath);
      }
      return currentPath === path;
    });
    
    if (isPublicRoute && ctx.request.method === 'GET') {
      console.log(`🌐 Acesso público permitido: ${currentPath}`);
      // Pular verificação de autenticação
      return await next();
    }
    
    // Para outras rotas, seguir fluxo normal
    await next();
  };
};
