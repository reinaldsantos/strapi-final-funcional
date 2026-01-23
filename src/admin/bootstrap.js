"use strict";

module.exports = ({ strapi }) => {
  console.log("🚀 BOOTSTRAP DO RENDER - Configuração automática");

  const setupPermissions = async () => {
    try {
      console.log("⏳ Aguardando Strapi carregar completamente...");
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log("🔍 Buscando role Public...");
      const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });

      if (!publicRole) {
        console.error("❌ Role Public não encontrado!");
        return;
      }

      console.log(`✅ Role Public encontrado (ID: ${publicRole.id})`);
      
      // Lista de coleções
      const collections = ["noticia", "evento", "curso"];
      
      console.log("🎯 Configurando permissões para:", collections.join(", "));
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const collectionName of collections) {
        console.log(`\n📝 ${collectionName}:`);
        
        const actions = ["find", "findOne"];
        
        for (const action of actions) {
          const actionName = `api::${collectionName}.${collectionName}.${action}`;
          
          try {
            // Método DIRETO no banco (funciona sempre)
            await strapi.db.connection.raw(`
              INSERT INTO up_permissions (action, role_id, created_at, updated_at)
              VALUES (?, ?, NOW(), NOW())
              ON CONFLICT (action, role_id) DO NOTHING
            `, [actionName, publicRole.id]);
            
            console.log(`   ✅ ${action} - Configurada`);
            successCount++;
          } catch (error) {
            console.log(`   ❌ ${action} - ${error.message}`);
            errorCount++;
          }
        }
      }
      
      console.log(`\n📊 RESULTADO: ${successCount} ok, ${errorCount} erros`);
      
      if (successCount > 0) {
        console.log("🎉 PERMISSÕES CONFIGURADAS COM SUCESSO!");
        console.log("\n🌐 APIs públicas agora disponíveis:");
        console.log("   • GET https://strapi-escola-final.onrender.com/api/noticias");
        console.log("   • GET https://strapi-escola-final.onrender.com/api/eventos");
        console.log("   • GET https://strapi-escola-final.onrender.com/api/cursos");
      } else {
        console.log("⚠️  Nenhuma permissão pôde ser configurada.");
        console.log("💡 Tente criar uma entrada em cada coleção no Admin.");
      }
      
    } catch (error) {
      console.error("❌ Erro crítico:", error.message);
    }
  };

  // Executar após o Strapi iniciar
  setTimeout(setupPermissions, 15000);
};
