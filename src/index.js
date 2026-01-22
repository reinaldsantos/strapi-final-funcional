"use strict";

module.exports = ({ strapi }) => {
  console.log("?? SERVER BOOTSTRAP INICIADO");
  
  // Executar quando o servidor estiver pronto
  strapi.server.on("listening", () => {
    console.log("? Servidor pronto na porta", strapi.config.get("server.port"));
    console.log("?? APIs que DEVEM estar disponíveis:");
    console.log("   • /api/noticias");
    console.log("   • /api/eventos");
    console.log("   • /api/cursos");
    console.log("   • /admin");
    
    // Dar tempo para admin bootstrap rodar
    setTimeout(() => {
      console.log("? Admin bootstrap deve ter executado agora");
      console.log("?? Teste as APIs em 30 segundos");
    }, 10000);
  });
};
