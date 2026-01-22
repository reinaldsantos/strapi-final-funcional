// Script para verificar permissões após o Strapi iniciar
const checkPermissions = async () => {
  const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
    where: { type: "public" }
  });
  
  console.log("\n=== VERIFICAÇÃO DE PERMISSÕES ===");
  
  const contentTypes = ["noticia", "evento", "curso"];
  
  for (const ct of contentTypes) {
    const permissions = await strapi.db.query("plugin::users-permissions.permission").findMany({
      where: {
        role: publicRole.id,
        action: { $contains: `api::${ct}.${ct}` }
      }
    });
    
    const actions = permissions.map(p => {
      const parts = p.action.split('.');
      return parts[parts.length - 1];
    });
    
    console.log(`?? ${ct}: ${actions.join(', ') || 'SEM PERMISSÕES ?'}`);
  }
  
  console.log("=== FIM DA VERIFICAÇÃO ===\n");
};

// Exportar para usar no console do Strapi
if (typeof module !== 'undefined') {
  module.exports = checkPermissions;
}
