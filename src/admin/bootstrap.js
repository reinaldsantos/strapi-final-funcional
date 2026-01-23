"use strict";

module.exports = ({ strapi }) => {
  console.log("🚀 BOOTSTRAP DO RENDER - Strapi v4");

  const setupPermissions = async () => {
    try {
      console.log("🔧 Configurando permissões públicas...");

      // 1. Encontrar role Public
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });

      if (!publicRole) {
        console.error("❌ Role Public não encontrado!");
        return;
      }

      console.log(`✅ Role Public encontrado (ID: ${publicRole.id})`);

      // 2. Listar TODOS os conteúdos disponíveis
      const contentTypes = strapi.contentTypes;
      console.log("\n📋 Todos os Content Types disponíveis:");
      
      const apiContentTypes = [];
      
      for (const contentType in contentTypes) {
        if (contentType.startsWith("api::")) {
          console.log(`   • ${contentType}`);
          apiContentTypes.push(contentType);
        }
      }

      // 3. Coleções específicas que você quer configurar
      const yourCollections = [
        "noticia",
        "evento", 
        "curso"
      ];

      console.log("\n🎯 Configurando suas coleções:");

      for (const collectionName of yourCollections) {
        const contentType = `api::${collectionName}.${collectionName}`;
        
        if (!apiContentTypes.includes(contentType)) {
          console.log(`❌ ${collectionName}: Content Type não encontrado!`);
          continue;
        }

        console.log(`\n🔧 ${collectionName}:`);
        
        // Permissões básicas para API pública
        const permissions = [
          {
            action: `${contentType}.find`,
            enabled: true
          },
          {
            action: `${contentType}.findOne`,
            enabled: true
          }
        ];

        // Verificar e criar permissões
        for (const perm of permissions) {
          try {
            // Verificar se já existe
            const existing = await strapi.db.query("plugin::users-permissions.permission").findOne({
              where: {
                role: publicRole.id,
                action: perm.action
              }
            });

            if (!existing) {
              await strapi.db.query("plugin::users-permissions.permission").create({
                data: {
                  action: perm.action,
                  role: publicRole.id
                }
              });
              console.log(`   ✅ ${perm.action.split(".").pop()} - CRIADA`);
            } else {
              console.log(`   ⏭️ ${perm.action.split(".").pop()} - Já existe`);
            }
          } catch (error) {
            console.log(`   ❌ ${perm.action.split(".").pop()} - Erro: ${error.message}`);
          }
        }
      }

      console.log("\n🎉 CONFIGURAÇÃO COMPLETA!");
      console.log("\n📡 APIs públicas disponíveis:");
      console.log("   • GET /api/noticias");
      console.log("   • GET /api/noticias/:id");
      console.log("   • GET /api/eventos");
      console.log("   • GET /api/eventos/:id");
      console.log("   • GET /api/cursos");
      console.log("   • GET /api/cursos/:id");

    } catch (error) {
      console.error("❌ Erro crítico:", error);
    }
  };

  // Executar quando o Strapi estiver pronto
  setTimeout(() => {
    console.log("⏳ Iniciando configuração automática...");
    setupPermissions();
  }, 5000);
};
