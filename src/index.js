"use strict";

module.exports = ({ strapi }) => {
  // Código vazio ou mínimo - as permissões são configuradas no admin/bootstrap.js
  console.log("?? Strapi iniciado com configuração estável");
  
  // Apenas verificar se está rodando
  strapi.server.on("listening", () => {
    console.log("? Servidor pronto na porta", strapi.config.get("server.port"));
    console.log("?? APIs públicas disponíveis:");
    console.log("   /api/noticias");
    console.log("   /api/eventos");  
    console.log("   /api/cursos");
  });
};
