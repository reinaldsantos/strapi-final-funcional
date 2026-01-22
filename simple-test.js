// simple-test-after-deploy.js
const axios = require('axios');

async function simpleTest() {
  console.log('?? TESTE SIMPLES APÓS DEPLOY\n');
  
  const url = 'https://strapi-final-funcional.onrender.com/api/noticias?pagination[pageSize]=1';
  console.log(`URL: ${url}\n`);
  
  try {
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: { 'Accept': 'application/json' }
    });
    
    console.log(`? RESPOSTA: ${response.status}`);
    console.log(`?? Dados: ${response.data.data?.length || 0} registro(s)`);
    
    if (response.status === 200) {
      console.log('\n?? ?? ?? API FUNCIONANDO! ?? ?? ??');
      console.log('?? Seu problema está RESOLVIDO!');
      console.log('\n?? Teste também:');
      console.log('   • /api/eventos');
      console.log('   • /api/cursos');
    }
    
  } catch (error) {
    console.log(`? ERRO: ${error.response?.status || error.code}`);
    
    if (error.response?.status === 404) {
      console.log('?? Ainda 404. Aguarde mais 1-2 minutos.');
    }
  }
}

// Aguardar 7 minutos (420 segundos) para tudo ficar pronto
console.log('??  Aguardando 7 minutos para deploy + bootstrap...');
setTimeout(simpleTest, 7 * 60 * 1000);
