"use strict";

module.exports = ({ strapi }) => {
  // Sistema de permissões SEGURO e CORRETO
  console.log("?? Configurando permissões públicas de forma segura...");
  
  const setupSafePermissions = async () => {
    try {
      // 1. Encontrar role Public
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });
      
      if (!publicRole) {
        console.error("? Role Public não encontrado");
        return;
      }
      
      console.log("? Role Public encontrado");
      
      // 2. LISTA EXATA DOS SEUS CONTENT-TYPES
      // Use os nomes SINGULARES como estão configurados
      const yourContentTypes = [
        "noticia",    // singular (como está no schema)
        "evento",     // singular  
        "curso"       // singular
      ];
      
      console.log("?? Configurando para:", yourContentTypes.join(", "));
      
      // 3. Configurar cada content-type
      for (const contentType of yourContentTypes) {
        console.log(`   ?? ${contentType}...`);
        
        // Ações necessárias para APIs públicas
        const requiredActions = ["find", "findOne"];
        
        for (const action of requiredActions) {
          // Verificar se permissão já existe
          const actionName = `api::${contentType}.${contentType}.${action}`;
          
          const existing = await strapi.db.query("plugin::users-permissions.permission").findOne({
            where: {
              role: publicRole.id,
              action: actionName
            }
          });
          
          if (!existing) {
            // Criar permissão
            await strapi.db.query("plugin::users-permissions.permission").create({
              data: {
                action: actionName,
                role: publicRole.id
              }
            });
            console.log(`      ? ${action} criada`);
          } else {
            console.log(`      ?? ${action} já existe`);
          }
        }
      }
      
      console.log("?? PERMISSÕES CONFIGURADAS COM SUCESSO!");
      console.log("?? Suas publicações NÃO vão mais sumir!");
      
    } catch (error) {
      console.error("? Erro:", error.message);
    }
  };
  
  // Executar quando o admin estiver pronto
  strapi.app.on("adminReady", () => {
    console.log("?? Admin pronto, configurando permissões...");
    setTimeout(setupSafePermissions, 2000);
  });
};
