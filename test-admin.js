const axios = require('axios');

async function test() {
  console.log('?? TESTANDO SE ADMIN ESTÁ RESPONDENDO...\n');
  
  const baseURL = 'https://strapi-final-funcional.onrender.com';
  
  try {
    // Testar admin
    console.log('?? Testando admin...');
    const adminResponse = await axios.get(baseURL + '/admin', { timeout: 10000 });
    console.log(`   Admin: ${adminResponse.status === 200 ? '? Online' : 'Status ' + adminResponse.status}`);
    
    // Testar APIs
    console.log('\n?? Testando APIs...');
    const endpoints = ['/api/noticias', '/api/eventos', '/api/cursos'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(baseURL + endpoint, { 
          timeout: 15000,
          params: { 'pagination[pageSize]': 1 }
        });
        console.log(`   ${endpoint}: ${response.status === 200 ? '? 200 OK' : 'Status ' + response.status}`);
      } catch (error) {
        console.log(`   ${endpoint}: ? ${error.response?.status || error.code}`);
      }
    }
    
  } catch (error) {
    console.log('? Erro geral:', error.message);
  }
}

test();
