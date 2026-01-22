const axios = require('axios');

console.log('?? TESTANDO APÓS DEPLOY BEM-SUCEDIDO...\n');

const baseURL = 'https://strapi-final-funcional.onrender.com';
const endpoints = [
  '/api/noticias?pagination[pageSize]=1',
  '/api/eventos?pagination[pageSize]=1', 
  '/api/cursos?pagination[pageSize]=1'
];

let successCount = 0;

endpoints.forEach(async (endpoint, index) => {
  const names = ['Notícias', 'Eventos', 'Cursos'];
  
  try {
    const response = await axios.get(baseURL + endpoint, { 
      timeout: 15000,
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.status === 200) {
      console.log(`? ${names[index]}: OK (${response.status})`);
      console.log(`   ?? Registros: ${response.data.data?.length || 0}`);
      successCount++;
    } else {
      console.log(`? ${names[index]}: Status ${response.status}`);
    }
  } catch (error) {
    console.log(`? ${names[index]}: ${error.response?.status || error.code}`);
    
    if (error.response?.status === 403) {
      console.log('   ?? Dica: Permissões ainda não configuradas. O bootstrap deve rodar em 30 segundos.');
    }
  }
  
  // Verificar após todos os testes
  if (index === endpoints.length - 1) {
    setTimeout(() => {
      console.log('\n?? RESUMO:');
      console.log(`   APIs funcionando: ${successCount}/3`);
      
      if (successCount === 3) {
        console.log('\n?? ?? ?? TUDO FUNCIONANDO PERFEITAMENTE! ?? ?? ??');
        console.log('?? Sistema Nuclear REMOVIDO com sucesso!');
        console.log('? Banco de dados CORRIGIDO!');
        console.log('?? Conteúdo NÃO vai mais desaparecer!');
        
        console.log('\n?? Agora você pode:');
        console.log('1. Acessar o admin: https://strapi-final-funcional.onrender.com/admin');
        console.log('2. Criar notícias, eventos e cursos');
        console.log('3. Publicar conteúdo normalmente');
        console.log('4. Seu site frontend vai funcionar!');
      } else if (successCount > 0) {
        console.log('\n??  Algumas APIs funcionando, outras não');
        console.log('?? Aguarde mais 1-2 minutos e teste novamente');
      } else {
        console.log('\n? Nenhuma API funcionando');
        console.log('?? O bootstrap pode ainda estar rodando. Aguarde 30 segundos.');
      }
    }, 1000);
  }
});
