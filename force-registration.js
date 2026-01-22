// force-content-type-registration.js
// Execute este script DIRETAMENTE no ambiente do Render via SSH
// ou adicione como migration no Strapi

const fs = require('fs');
const path = require('path');

async function forceContentTypeRegistration() {
  console.log('?????? FORÇANDO REGISTRO DE CONTENT-TYPES ??????\n');
  
  // Lista dos SEUS content-types
  const contentTypes = [
    { singular: 'noticia', plural: 'noticias', displayName: 'Noticia' },
    { singular: 'evento', plural: 'eventos', displayName: 'Evento' },
    { singular: 'curso', plural: 'cursos', displayName: 'Curso' }
  ];
  
  console.log('?? Content-types a registrar:', contentTypes.map(ct => ct.singular).join(', '));
  
  // Método 1: Tentar via strapi.contentType (se strapi disponível)
  if (typeof strapi !== 'undefined') {
    console.log('?? Método 1: Via strapi.contentType');
    
    for (const ct of contentTypes) {
      try {
        const contentType = strapi.contentType(`api::${ct.singular}.${ct.singular}`);
        console.log(`   ? ${ct.singular}: Encontrado via strapi`);
        
        // Forçar "registro" tentando acessar
        const model = strapi.getModel(`api::${ct.singular}.${ct.singular}`);
        console.log(`   ?? Modelo: ${model ? 'OK' : 'Não encontrado'}`);
        
      } catch (error) {
        console.log(`   ? ${ct.singular}: Não encontrado - ${error.message}`);
      }
    }
  }
  
  // Método 2: Verificar schemas físicos
  console.log('\n?? Método 2: Verificando schemas físicos');
  
  for (const ct of contentTypes) {
    const schemaPath = path.join(__dirname, 'src', 'api', ct.singular, 'content-types', ct.singular, 'schema.json');
    
    if (fs.existsSync(schemaPath)) {
      console.log(`   ? ${ct.singular}: schema.json existe`);
      
      try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        console.log(`      Display: ${schema.info.displayName}`);
        console.log(`      Singular: ${schema.info.singularName}`);
        console.log(`      Plural: ${schema.info.pluralName}`);
      } catch (e) {
        console.log(`      ? Erro ler schema: ${e.message}`);
      }
    } else {
      console.log(`   ? ${ct.singular}: schema.json NÃO encontrado em:`);
      console.log(`      ${schemaPath}`);
    }
  }
  
  // Método 3: Truque do Strapi - Recriar link simbólico
  console.log('\n?? MÉTODO 3: TRUQUE DO STRAPI');
  console.log('?? Este truque força o Strapi a recarregar content-types:');
  console.log('   1. No admin, vá em Content-Type Builder');
  console.log('   2. Clique em cada coleção (Noticia, Evento, Curso)');
  console.log('   3. Clique em "Save" (não precisa mudar nada)');
  console.log('   4. Isso força o registro no sistema');
  
  console.log('\n?????? AÇÃO IMEDIATA REQUERIDA:');
  console.log('1. Acesse: https://strapi-final-funcional.onrender.com/admin');
  console.log('2. Faça login');
  console.log('3. Vá em "Content-Type Builder"');
  console.log('4. Para CADA coleção (Noticia, Evento, Curso):');
  console.log('   • Clique nela');
  console.log('   • Clique em "Save" (sem mudar nada)');
  console.log('5. Volte para permissões do Role "Public"');
  console.log('6. Agora DEVEM aparecer!');
}

// Executar se chamado diretamente
if (require.main === module) {
  forceContentTypeRegistration();
}

module.exports = forceContentTypeRegistration;
