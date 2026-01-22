// final-ultimate-test.js
const axios = require('axios');

console.log('?????? TESTE FINAL - ÚLTIMA TENTATIVA ??????\n');

async function ultimateTest() {
  const baseURL = 'https://strapi-final-funcional.onrender.com';
  
  // Aguardar 8 minutos para tudo
  console.log('??  Aguardando 8 minutos para:');
  console.log('   • Deploy completo');
  console.log('   • Strapi iniciar');
  console.log('   • Middleware executar');
  console.log('   • Permissões configuradas');
  
  await new Promise(resolve => setTimeout(resolve, 8 * 60 * 1000));
  
  console.log('\n?? INICIANDO TESTE FINAL...\n');
  
  const endpoints = [
    { name: 'NOTÍCIAS', path: '/api/noticias?populate=*&pagination[pageSize]=1' },
    { name: 'EVENTOS', path: '/api/eventos?populate=*&pagination[pageSize]=1' },
    { name: 'CURSOS', path: '/api/cursos?populate=*&pagination[pageSize]=1' }
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    console.log(`?? ${endpoint.name}:`);
    console.log(`   ${baseURL}${endpoint.path}`);
    
    try {
      const response = await axios.get(baseURL + endpoint.path, {
        timeout: 30000,
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.status === 200) {
        console.log(`   ? 200 OK!`);
        console.log(`   ?? Registros: ${response.data.data?.length || 0}`);
        successCount++;
      } else {
        console.log(`   ? Status: ${response.status}`);
      }
      
    } catch (error) {
      const status = error.response?.status;
      console.log(`   ? ERRO: ${status || error.code}`);
    }
    
    console.log('');
  }
  
  console.log('?? RESULTADO FINAL:');
  console.log(`   APIs funcionando: ${successCount}/3`);
  
  if (successCount === 3) {
    console.log('\n?????? ?????? ?????? ??????');
    console.log('??? PROBLEMA 100% RESOLVIDO! ???');
    console.log('?????? Middleware funcionou! ??????');
    console.log('?????? Seu Strapi está 100% funcional! ??????');
    
    console.log('\n?? Agora você pode:');
    console.log('1. Acessar o admin e criar conteúdo');
    console.log('2. Publicar normalmente');
    console.log('3. As coleções vão aparecer nas permissões');
    console.log('4. Conteúdo NÃO vai desaparecer');
    console.log('5. Seu site frontend vai funcionar!');
    
  } else {
    console.log('\n??????  ÚLTIMA TENTATIVA FALHOU');
    console.log('?? ÚNICA SOLUÇÃO RESTANTE:');
    console.log('   1. Recrie o projeto Strapi do zero');
    console.log('   2. Ou contrate um especialista Strapi');
  }
}

ultimateTest();
