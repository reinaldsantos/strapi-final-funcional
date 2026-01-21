// src/utils/sistema-seguro.js
module.exports = async ({ strapi }) => {
    console.log("SISTEMA SEGURO ativado");
    
    try {
        const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
            where: { type: 'public' }
        });
        
        if (publicRole) {
            const tipos = [
                'api::noticia.noticia',
                'api::evento.evento', 
                'api::curso.curso'
            ];
            
            for (const uid of tipos) {
                // Permissões FIND
                await strapi.db.query('plugin::users-permissions.permission').create({
                    data: { action: `${uid}.find`, role: publicRole.id }
                }).catch(() => {});
                
                // Permissões FINDONE
                await strapi.db.query('plugin::users-permissions.permission').create({
                    data: { action: `${uid}.findOne`, role: publicRole.id }
                }).catch(() => {});
            }
            console.log("PERMISSOES configuradas");
        }
    } catch (error) {
        console.log("ERRO (nao critico):", error.message);
    }
};
