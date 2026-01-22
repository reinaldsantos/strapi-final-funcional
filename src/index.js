"use strict";

module.exports = ({ strapi }) => {
  console.log("?? BOOTSTRAP: Forçando registro de coleções nas permissões...");
  
  const forceContentTypeRegistration = async () => {
    try {
      console.log("?? Iniciando registro forçado...");
      
      // 1. Encontrar role Public
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });
      
      if (!publicRole) {
        console.error("? Role Public não encontrado!");
        return;
      }
      
      console.log("? Role Public encontrado (ID:", publicRole.id, ")");
      
      // 2. Lista das SUAS coleções (usando os nomes SINGULARES)
      const yourCollections = [
        { singular: "noticia", plural: "noticias" },
        { singular: "evento", plural: "eventos" },
        { singular: "curso", plural: "cursos" }
      ];
      
      console.log("?? Suas coleções:", yourCollections.map(c => c.singular).join(", "));
      
      // 3. Para CADA coleção, garantir que está registrada
      for (const collection of yourCollections) {
        console.log(`\n?? Processando: ${collection.singular} (API: /api/${collection.plural})`);
        
        // Verificar se o content-type existe no Strapi
        let contentType;
        try {
          contentType = strapi.contentType(`api::${collection.singular}.${collection.singular}`);
          console.log(`   ? Content-type encontrado no Strapi`);
        } catch (error) {
          console.log(`   ? Content-type NÃO encontrado: ${error.message}`);
          continue;
        }
        
        // Verificar se já tem permissões
        const existingPermissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
          where: {
            role: publicRole.id,
            action: { $contains: `api::${collection.singular}.${collection.singular}` }
          }
        });
        
        console.log(`   ?? Permissões existentes: ${existingPermissions.length}`);
        
        // Se não tem permissões, CRIAR
        if (existingPermissions.length === 0) {
          console.log(`   ?? Criando permissões para ${collection.singular}...`);
          
          // Criar permissões find e findOne
          const actions = ["find", "findOne"];
          
          for (const action of actions) {
            try {
              await strapi.db.query("plugin::users-permissions.permission").create({
                data: {
                  action: `api::${collection.singular}.${collection.singular}.${action}`,
                  role: publicRole.id
                }
              });
              console.log(`      ? ${action} criada`);
            } catch (error) {
              console.log(`      ? Erro criando ${action}:`, error.message);
            }
          }
        } else {
          console.log(`   ??  Permissões já existem, pulando...`);
        }
        
        // 4. Forçar registro na rota (truque do Strapi)
        try {
          // Isso força o Strapi a reconhecer a rota
          const routeService = strapi.plugin("content-api").service("route");
          if (routeService && routeService.registerRoute) {
            await routeService.registerRoute({
              method: "GET",
              path: `/${collection.plural}`,
              handler: `api::${collection.singular}.${collection.singular}.find`,
              config: { auth: false }
            });
            console.log(`   ?? Rota /api/${collection.plural} registrada`);
          }
        } catch (error) {
          console.log(`   ??  Não foi possível registrar rota:`, error.message);
        }
      }
      
      console.log("\n? REGISTRO FORÇADO COMPLETO!");
      console.log("?? Agora as coleções DEVEM aparecer nas permissões!");
      console.log("?? APIs disponíveis:");
      console.log("   • /api/noticias");
      console.log("   • /api/eventos");
      console.log("   • /api/cursos");
      
    } catch (error) {
      console.error("? ERRO no registro forçado:", error.message);
      console.error("Stack:", error.stack);
    }
  };
  
  // Executar quando o Strapi estiver pronto
  strapi.server.on("listening", () => {
    console.log("?? Strapi pronto, iniciando registro forçado em 5 segundos...");
    setTimeout(forceContentTypeRegistration, 5000);
  });
  
  // Também executar periodicamente (a cada 2 minutos) para garantir
  setInterval(() => {
    console.log("? Verificação periódica de permissões...");
    forceContentTypeRegistration();
  }, 2 * 60 * 1000);
};
