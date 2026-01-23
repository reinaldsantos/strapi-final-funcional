// Deploy: 2026-01-23 10:27:44

// Último deploy: 2026-01-23 10:26:57

// Último deploy: 2026-01-23 10:17:57
"use strict";

module.exports = ({ strapi }) => {
  console.log("🚀 BOOTSTRAP ULTIMATE - Free Render Solution");

  const setupPermissions = async () => {
    try {
      console.log("⏳ Iniciando em 15 segundos...");
      // Esperar MAIS tempo para free tier
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      console.log("🔍 Procurando role Public...");
      
      // Método DIRETO - não depende da API de permissions
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });

      if (!publicRole) {
        console.error("❌ Role Public não encontrado!");
        // Tentar criar se não existir
        try {
          const newRole = await strapi.db.query("plugin::users-permissions.role").create({
            data: {
              name: "Public",
              description: "Default role for unauthenticated users",
              type: "public",
              permissions: []
            }
          });
          console.log("✅ Role Public criado!");
          return await setupForRole(newRole.id);
        } catch (e) {
          console.error("❌ Não pôde criar role:", e.message);
          return;
        }
      }

      console.log(`✅ Role Public ID: ${publicRole.id}`);
      await setupForRole(publicRole.id);
      
    } catch (error) {
      console.error("❌ Erro no setup:", error.message);
    }
  };

  const setupForRole = async (roleId) => {
    console.log("🎯 Configurando permissões...");
    
    const collections = [
      { name: "noticia", plural: "noticias" },
      { name: "evento", plural: "eventos" },
      { name: "curso", plural: "cursos" }
    ];
    
    let totalConfigured = 0;
    
    for (const col of collections) {
      console.log(`\n📝 ${col.name}:`);
      
      // Ações básicas para API pública
      const actions = [
        { action: `api::${col.name}.${col.name}.find`, method: "GET", path: `/api/${col.plural}` },
        { action: `api::${col.name}.${col.name}.findOne`, method: "GET", path: `/api/${col.plural}/:id` }
      ];
      
      for (const perm of actions) {
        try {
          // Verificar se já existe
          const existing = await strapi.db.query("plugin::users-permissions.permission").findOne({
            where: {
              action: perm.action,
              role: roleId
            }
          });
          
          if (!existing) {
            // Usar query RAW como fallback
            try {
              await strapi.db.query("plugin::users-permissions.permission").create({
                data: {
                  action: perm.action,
                  role: roleId
                }
              });
              console.log(`   ✅ ${perm.method} ${perm.path}`);
              totalConfigured++;
            } catch (createError) {
              console.log(`   ⚠️  ${perm.method} ${perm.path} - Erro na criação: ${createError.message}`);
              // Tentar método alternativo
              await forceCreatePermission(perm.action, roleId);
              totalConfigured++;
            }
          } else {
            console.log(`   ⏩ ${perm.method} ${perm.path} - Já existe`);
          }
        } catch (error) {
          console.log(`   ❌ ${perm.method} ${perm.path} - ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 RESULTADO: ${totalConfigured} permissões configuradas`);
    
    if (totalConfigured > 0) {
      console.log("\n🎉 🎉 🎉 SUCESSO TOTAL! 🎉 🎉 🎉");
      console.log("=================================");
      console.log("✅ APIs PÚBLICAS CONFIGURADAS:");
      console.log("   • https://strapi-escola-final.onrender.com/api/noticias");
      console.log("   • https://strapi-escola-final.onrender.com/api/eventos");
      console.log("   • https://strapi-escola-final.onrender.com/api/cursos");
      console.log("\n🔗 Teste AGORA no navegador!");
    } else {
      console.log("\n⚠️  AVISO: Nenhuma permissão configurada.");
      console.log("💡 O Strapi Free pode ter limitações.");
      console.log("📞 Considere usar SQL direto se possível.");
    }
  };

  const forceCreatePermission = async (action, roleId) => {
    // Método de emergência
    try {
      // Tentar inserção direta
      const result = await strapi.db.connection.raw(`
        INSERT INTO up_permissions (action, role_id, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [action, roleId]);
      
      console.log(`   🔧 Forçada criação via SQL`);
      return true;
    } catch (sqlError) {
      console.log(`   💥 Falha até no SQL: ${sqlError.message}`);
      return false;
    }
  };

  // Dar MAIS tempo para free tier
  console.log("⏰ Configuração automática em 20 segundos...");
  setTimeout(setupPermissions, 20000);
};



