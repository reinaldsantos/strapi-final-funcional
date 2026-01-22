// check-bootstrap-executed.js
const axios = require('axios');

async function checkBootstrap() {
  console.log('?? VERIFICANDO SE BOOTSTRAP EXECUTOU...\n');
  
  const baseURL = 'https://strapi-final-funcional.onrender.com';
  
  // Tentar acessar as APIs
  const endpoints = [
    { name: 'Notícias', path: '/api/noticias?pagination[pageSize]=1' },
    { name: 'Eventos', path: '/api/eventos?pagination[pageSize]=1' },
    { name: 'Cursos', path: '/api/cursos?pagination[pageSize]=1' }
  ];
  
  let bootstrapEvidence = false;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(baseURL + endpoint.path, {
        timeout: 15000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.status === 200) {
        console.log(`? ${endpoint.name}: API FUNCIONANDO!`);
        console.log(`   ?? Status: ${response.status}`);
        console.log(`   ?? URL: ${baseURL}${endpoint.path}`);
        
        if (response.data.data !== undefined) {
          console.log(`   ?? Registros: ${response.data.data?.length || 0}`);
          bootstrapEvidence = true;
        }
      }
      
    } catch (error) {
      const status = error.response?.status;
      console.log(`? ${endpoint.name}: ${status || error.code}`);
      
      if (status === 404) {
        console.log(`   ?? API não encontrada. Bootstrap pode não ter rodado ainda.`);
      } else if (status === 403) {
        console.log(`   ?? Acesso negado. Permissões não configuradas.`);
      }
    }
    console.log('');
  }
  
  if (bootstrapEvidence) {
    console.log('?? EVIDÊNCIA DE BOOTSTRAP: APIs funcionando!');
    console.log('?? Seu problema de coleções não aparecerem está RESOLVIDO!');
    console.log('\n?? AGORA VOCÊ PODE:');
    console.log('1. Acessar o admin e publicar conteúdo');
    console.log('2. As coleções DEVEM aparecer nas permissões');
    console.log('3. Seu site frontend vai receber os dados');
  } else {
    console.log('??  Bootstrap pode não ter executado ou ainda está rodando.');
    console.log('\n?? SOLUÇÃO:');
    console.log('1. Aguarde mais 2 minutos');
    console.log('2. Reinicie o serviço no Render');
    console.log('3. Execute este teste novamente');
  }
}

checkBootstrap();
