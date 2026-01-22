// quick-test-fix.js
const axios = require('axios');

console.log('?? TESTANDO APÓS FIX DIRETO NO BANCO...\n');

const baseURL = 'https://strapi-final-funcional.onrender.com';

async function test() {
  // Aguardar 30 segundos
  console.log('??  Aguardando 30 segundos para Strapi detectar mudanças...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log('\n?? TESTANDO APIs...\n');
  
  const endpoints = [
    { name: 'NOTÍCIAS', path: '/api/noticias?pagination[pageSize]=1' },
    { name: 'EVENTOS', path: '/api/eventos?pagination[pageSize]=1' },
    { name: 'CURSOS', path: '/api/cursos?pagination[pageSize]=1' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`?? ${endpoint.name}:`);
    
    try {
      const response = await axios.get(baseURL + endpoint.path, {
        timeout: 20000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.status === 200) {
        console.log(`   ? 200 OK!`);
        console.log(`   ?? Registros: ${response.data.data?.length || 0}`);
      } else {
        console.log(`   ??  Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ? ${error.response?.status || error.code}`);
    }
    console.log('');
  }
  
  console.log('?? Teste manual no navegador:');
  console.log('   ' + baseURL + '/api/noticias');
}

test();
