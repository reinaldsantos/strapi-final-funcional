// test-connection.js
const { Client } = require('pg');

async function test() {
  console.log('?? Testando conexão com o banco...');
  
  // TENTAR DIFERENTES FORMATOS
  const configs = [
    {
      name: 'URL Completa',
      connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com:5432/strapi_5cj5',
      ssl: true
    },
    {
      name: 'Host direto',
      connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com/strapi_5cj5',
      ssl: true
    },
    {
      name: 'Parâmetros separados',
      host: 'dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com',
      port: 5432,
      database: 'strapi_5cj5',
      user: 'meu_admin',
      password: 'QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF',
      ssl: true
    }
  ];
  
  for (const config of configs) {
    console.log(`\n?? Tentando: ${config.name}`);
    
    try {
      const client = new Client(config);
      await client.connect();
      console.log('? CONEXÃO BEM-SUCEDIDA!');
      
      // Testar query simples
      const result = await client.query('SELECT 1 as test');
      console.log(`   Query test: ${result.rows[0].test}`);
      
      await client.end();
      return config; // Retorna a configuração que funcionou
      
    } catch (error) {
      console.log(`? Falhou: ${error.message}`);
    }
  }
  
  console.log('\n? Nenhuma conexão funcionou!');
  return null;
}

test().then(config => {
  if (config) {
    console.log('\n?? Use esta configuração:');
    console.log(JSON.stringify(config, null, 2));
  }
});
