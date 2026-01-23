"use strict";

module.exports = ({ strapi }) => {
  console.log("?????? ADMIN BOOTSTRAP DEFINITIVO INICIANDO ??????");
  console.log("??", new Date().toISOString());
  console.log("?? Ambiente:", process.env.NODE_ENV || "development");

  // Função PRINCIPAL que configura TUDO
  const setupEverything = async () => {
    console.log("\n?????? INICIANDO CONFIGURAÇÃO COMPLETA...");

    try {
      // 1. Encontrar ou criar role Public
      console.log("1??  Buscando role Public...");
      let publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
        where: { type: "public" }
      });

      if (!publicRole) {
        console.log("   ??  Role Public não encontrado, tentando criar...");
        try {
          publicRole = await strapi.db.query("plugin::users-permissions.role").create({
            data: {
              name: "Public",
              description: "Default role for unauthenticated users",
              type: "public"
            }
          });
          console.log("   ? Role Public criado! ID:", publicRole.id);
        } catch (createError) {
          console.error("   ? Não foi possível criar role:", createError.message);
          return;
        }
      } else {
        console.log("   ? Role Public encontrado! ID:", publicRole.id);
      }

      // 2. Lista das SUAS coleções (CONFIRMADAS)
      const yourCollections = [
        { singular: "noticia", plural: "noticias", display: "Notícias" },
        { singular: "evento", plural: "eventos", display: "Eventos" },
        { singular: "curso", plural: "cursos", display: "Cursos" }
      ];

      console.log(`\n2??  Configurando ${yourCollections.length} coleções...`);
      console.log("   ?? Coleções:", yourCollections.map(c => c.display).join(", "));
      
      let totalPermissionsCreated = 0;
      let totalPermissionsExist = 0;

      // 3. Para CADA coleção, garantir permissões
      for (const collection of yourCollections) {
        console.log(`\n   ?? ${collection.display} (${collection.singular}):`);
        console.log(`      API: /api/${collection.plural}`);

        try {
          // Verificar se content-type existe no sistema
          let contentType;
          try {
            contentType = strapi.contentType(`api::${collection.singular}.${collection.singular}`);
            console.log(`      ? Content-type registrado no Strapi`);
          } catch (ctError) {
            console.log(`      ? Content-type não encontrado:`, ctError.message);
            continue; // Pular para próxima coleção
          }

          // Ações necessárias para API pública
          const requiredActions = ["find", "findOne"];

          for (const action of requiredActions) {
            const actionName = `api::${collection.singular}.${collection.singular}.${action}`;
            
            // Verificar se permissão já existe
            const existingPermission = await strapi.db.query("plugin::users-permissions.permission").findOne({
              where: {
                role: publicRole.id,
                action: actionName
              }
            });

            if (!existingPermission) {
              // CRIAR permissão
              await strapi.db.query("plugin::users-permissions.permission").create({
                data: {
                  action: actionName,
                  role: publicRole.id
                }
              });
              console.log(`      ? ${action} ? CRIADA`);
              totalPermissionsCreated++;
            } else {
              console.log(`      ? ${action} ? JÁ EXISTE`);
              totalPermissionsExist++;
            }
          }

        } catch (error) {
          console.log(`      ? Erro com ${collection.singular}:`, error.message);
        }
      }

      // 4. RESUMO FINAL
      console.log("\n" + "=" .repeat(50));
      console.log("?????? RESUMO DA CONFIGURAÇÃO ??????");
      console.log("=" .repeat(50));
      console.log(`   ???  Role Public: ID ${publicRole.id}`);
      console.log(`   ?? Coleções processadas: ${yourCollections.length}`);
      console.log(`   ? Permissões existentes: ${totalPermissionsExist}`);
      console.log(`   ? Novas permissões criadas: ${totalPermissionsCreated}`);
      console.log(`   ?? Total permissões: ${totalPermissionsExist + totalPermissionsCreated}`);
      
      const expectedTotal = yourCollections.length * 2; // 2 ações por coleção
      const currentTotal = totalPermissionsExist + totalPermissionsCreated;
      
      if (currentTotal >= expectedTotal) {
        console.log("\n?????? CONFIGURAÇÃO COMPLETA COM SUCESSO! ??????");
        console.log("?????? Todas APIs DEVEM funcionar agora!");
      } else {
        console.log(`\n??  Permissões incompletas: ${currentTotal}/${expectedTotal}`);
        console.log("?? Execute este bootstrap novamente após alguns segundos");
      }
      
      console.log("\n?? URLs para teste (aguarde 30 segundos):");
      console.log(`   • https://strapi-final-funcional.onrender.com/api/noticias`);
      console.log(`   • https://strapi-final-funcional.onrender.com/api/eventos`);
      console.log(`   • https://strapi-final-funcional.onrender.com/api/cursos`);
      console.log(`   • https://strapi-final-funcional.onrender.com/admin`);

    } catch (error) {
      console.error("\n??? ERRO CRÍTICO NO BOOTSTRAP:", error.message);
      console.error("Stack:", error.stack);
    }
  };

  // ESTRATÉGIA DE EXECUÇÃO INTELIGENTE
  console.log("\n??  Estratégia de execução configurada:");
  
  // 1. Execução IMEDIATA (3 segundos)
  console.log("1??  Execução imediata em 3 segundos...");
  setTimeout(() => {
    console.log("   ?? Executando configuração AGORA...");
    setupEverything();
  }, 3000);

  // 2. Backup (30 segundos) - caso a primeira falhe
  setTimeout(() => {
    console.log("2??  Execução de backup em 30 segundos...");
    setupEverything();
  }, 30000);
  
  // 3. Periódico (2 minutos) - para garantir
  setInterval(() => {
    console.log("3??  Verificação periódica (2 minutos)...");
    setupEverything();
  }, 120000);
  
  console.log("\n? Bootstrap DEFINITIVO configurado com sucesso!");
};
