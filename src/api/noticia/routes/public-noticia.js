// Rotas públicas para noticia
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/noticias/public',
      handler: 'noticia.find',
      config: {
        auth: false, // 👈 IMPORTANTE: Sem autenticação
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/noticias/public/:id',
      handler: 'noticia.findOne',
      config: {
        auth: false, // 👈 IMPORTANTE: Sem autenticação
        policies: [],
        middlewares: [],
      },
    },
  ],
};
