// emergency-fix.js - Execute SE após o deploy ainda não funcionar
console.log('?? SCRIPT DE EMERGÊNCIA PARA REGISTRAR COLEÇÕES');
console.log('\n?? ETAPAS MANUAIS (último recurso):');
console.log('===================================');
console.log('\n1. No Render, vá em "Environment"');
console.log('2. ADICIONE estas variáveis:');
console.log('   • AUTO_RELOAD=false');
console.log('   • STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE=false');
console.log('3. Salve e REINICIE o serviço');
console.log('\n4. Após reiniciar, acesse o admin:');
console.log('   https://strapi-final-funcional.onrender.com/admin');
console.log('\n5. Tente criar UM NOVO content-type (qualquer um)');
console.log('6. Depois delete ele');
console.log('\n?? Este "truque" força o Strapi a recarregar TODOS os content-types');
console.log('   incluindo os que já existem mas não aparecem nas permissões.');
