"use strict";

module.exports = ({ strapi }) => {
  console.log("?????? ADMIN BOOTSTRAP INICIANDO - VERSÃO DEFINITIVA ??????");
  
  // Função que será chamada quando o admin estiver pronto
  const setupPermissions = async () => {
    console.log("?????? CONFIGURANDO PERMISSÕES PÚBLICAS...");
    
    try {
      // 1. Encontrar role Public
      console.log("?? Buscando role Public...");
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });
      
      if (!publicRole) {
        console.error("??? Role Public não encontrado!");
        return;
      }
      
      console.log("??? Role Public encontrado! ID:", publicRole.id);
      
      // 2. Lista das SUAS coleções
      const yourCollections = [
        { singular: "noticia", plural: "noticias" },
        { singular: "evento", plural: "eventos" },
        { singular: "curso", plural: "cursos" }
      ];
      
      console.log("?????? Suas coleções:", yourCollections.map(c => c.singular).join(", "));
      
      // 3. Para CADA coleção, garantir permissões
      for (const collection of yourCollections) {
        console.log(`\n?? Processando: ${collection.singular} ? /api/${collection.plural}`);
        
        try {
          // Verificar se content-type existe
          const contentType = strapi.contentType(`api::${collection.singular}.${collection.singular}`);
          console.log(`   ? Content-type encontrado no sistema`);
          
          // Criar permissões find e findOne
          const actions = ["find", "findOne"];
          let createdCount = 0;
          
          for (const action of actions) {
            const actionName = `api::${collection.singular}.${collection.singular}.${action}`;
            
            // Verificar se já existe
            const exists = await strapi.db.query("plugin::users-permissions.permission").findOne({
              where: {
                role: publicRole.id,
                action: actionName
              }
            });
            
            if (!exists) {
              console.log(`   ? Criando permissão: ${action}`);
              await strapi.db.query("plugin::users-permissions.permission").create({
                data: {
                  action: actionName,
                  role: publicRole.id
                }
              });
              createdCount++;
              console.log(`   ? Permissão ${action} criada!`);
            } else {
              console.log(`   ?? Permissão ${action} já existe`);
            }
          }
          
          if (createdCount > 0) {
            console.log(`   ?? ${createdCount} permissões criadas para ${collection.singular}`);
          }
          
        } catch (error) {
          console.log(`   ? Erro com ${collection.singular}:`, error.message);
        }
      }
      
      console.log("\n?????? PERMISSÕES CONFIGURADAS COM SUCESSO! ??????");
      console.log("?????? Agora as APIs DEVEM funcionar!");
      console.log("\n?????? URLs para teste:");
      console.log("   • https://strapi-final-funcional.onrender.com/api/noticias");
      console.log("   • https://strapi-final-funcional.onrender.com/api/eventos");
      console.log("   • https://strapi-final-funcional.onrender.com/api/cursos");
      console.log("\n?????? Dica: Aguarde 30 segundos após este log aparecer.");
      
    } catch (error) {
      console.error("??? ERRO NO BOOTSTRAP:", error.message);
      console.error("Stack:", error.stack);
    }
  };
  
  // IMPORTANTE: Executar quando o ADMIN estiver pronto
  strapi.app.on("adminReady", () => {
    console.log("?????? Admin pronto! Executando bootstrap em 5 segundos...");
    
    setTimeout(() => {
      console.log("?????? Executando configuração de permissões AGORA...");
      setupPermissions();
    }, 5000);
  });
  
  // Backup: também executar após 60 segundos
  setTimeout(() => {
    console.log("??? Execução de backup após 60 segundos...");
    setupPermissions();
  }, 60000);
};
