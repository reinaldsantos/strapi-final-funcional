"use strict";

module.exports = ({ strapi }) => {
  console.log("?????? DEVELOPMENT BOOTSTRAP INICIANDO ??????");
  console.log("??", new Date().toISOString());
  console.log("?? Ambiente:", process.env.NODE_ENV);
  
  // Função PRINCIPAL que configura tudo
  const setupDevelopment = async () => {
    console.log("\n?????? INICIANDO CONFIGURAÇÃO COMPLETA...");
    
    try {
      // 1. Encontrar role Public
      console.log("1??  Buscando role Public...");
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });
      
      if (!publicRole) {
        console.error("? Role Public não encontrado!");
        // Tentar criar se não existir
        try {
          const newRole = await strapi.db.query("plugin::users-permissions.role").create({
            data: {
              name: "Public",
              description: "Default role for unauthenticated users",
              type: "public"
            }
          });
          console.log("? Role Public criado! ID:", newRole.id);
        } catch (createError) {
          console.error("? Não foi possível criar role:", createError.message);
        }
        return;
      }
      
      console.log("? Role Public encontrado! ID:", publicRole.id);
      
      // 2. Lista de coleções
      const collections = [
        { singular: "noticia", plural: "noticias", display: "Notícias" },
        { singular: "evento", plural: "eventos", display: "Eventos" },
        { singular: "curso", plural: "cursos", display: "Cursos" }
      ];
      
      console.log("\n2??  Configurando", collections.length, "coleções...");
      
      let totalPermissions = 0;
      
      // 3. Para cada coleção
      for (const collection of collections) {
        console.log(`\n   ?? ${collection.display} (${collection.singular}):`);
        
        try {
          // Verificar se content-type existe
          const contentType = strapi.contentType(`api::${collection.singular}.${collection.singular}`);
          console.log(`      ? Content-type registrado`);
          
          // Ações necessárias
          const actions = ["find", "findOne"];
          
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
              // Criar permissão
              await strapi.db.query("plugin::users-permissions.permission").create({
                data: {
                  action: actionName,
                  role: publicRole.id,
                  created_at: new Date(),
                  updated_at: new Date()
                }
              });
              console.log(`      ? ${action} criada`);
              totalPermissions++;
            } else {
              console.log(`      ? ${action} já existe`);
            }
          }
          
          // Registrar rota (opcional)
          try {
            const routeService = strapi.plugin("content-api").service("route");
            if (routeService) {
              const routePath = `/${collection.plural}`;
              console.log(`      ?? Rota: ${routePath}`);
            }
          } catch (routeError) {
            // Ignorar erro de rota
          }
          
        } catch (error) {
          console.log(`      ? ${collection.singular}:`, error.message);
        }
      }
      
      // 4. Resumo final
      console.log("\n3??  RESUMO DA CONFIGURAÇÃO:");
      console.log("   ===========================");
      console.log(`   ?? Coleções processadas: ${collections.length}`);
      console.log(`   ?? Permissões criadas: ${totalPermissions}`);
      console.log(`   ?? Role Public: ID ${publicRole.id}`);
      
      if (totalPermissions > 0) {
        console.log("\n?????? CONFIGURAÇÃO COMPLETA COM SUCESSO! ??????");
      } else {
        console.log("\n??  Nenhuma nova permissão criada (já existiam)");
      }
      
      console.log("\n?? URLs para teste (após restart):");
      console.log(`   • https://strapi-final-funcional.onrender.com/api/noticias`);
      console.log(`   • https://strapi-final-funcional.onrender.com/admin`);
      
    } catch (error) {
      console.error("\n??? ERRO NO BOOTSTRAP:", error.message);
      console.error("Stack:", error.stack);
    }
  };
  
  // ESTRATÉGIA DE EXECUÇÃO PARA DEVELOPMENT
  console.log("\n??  Estratégia de execução:");
  
  // 1. Executar IMEDIATAMENTE (development)
  console.log("1. Execução imediata...");
  setTimeout(() => {
    console.log("   ? Executando agora...");
    setupDevelopment();
  }, 3000);
  
  // 2. Backup após 30 segundos
  setTimeout(() => {
    console.log("2. Execução de backup (30s)...");
    setupDevelopment();
  }, 30000);
  
  // 3. Periódico a cada 2 minutos
  setInterval(() => {
    console.log("3. Verificação periódica (2min)...");
    setupDevelopment();
  }, 120000);
  
  console.log("\n? Bootstrap development configurado!");
};
