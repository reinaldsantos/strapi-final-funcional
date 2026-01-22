// fix-permissions-registration.js
const axios = require('axios');
const qs = require('qs');

async function fixPermissions() {
  const baseURL = 'https://strapi-final-funcional.onrender.com';
  const adminEmail = 'seu-email@admin.com'; // ? SUBSTITUA pelo seu email admin
  const adminPassword = 'sua-senha'; // ? SUBSTITUA pela sua senha admin
  
  console.log('?? FORÇANDO REGISTRO DE PERMISSÕES...\n');
  
  try {
    // 1. Login no admin para obter token
    console.log('?? Fazendo login...');
    const loginResponse = await axios.post(baseURL + '/admin/login', {
      email: adminEmail,
      password: adminPassword
    });
    
    const token = loginResponse.data.data.token;
    console.log('? Login bem-sucedido');
    
    // 2. Obter ID do role "Public"
    console.log('\n?? Buscando role Public...');
    const rolesResponse = await axios.get(baseURL + '/admin/roles', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const publicRole = rolesResponse.data.data.find(role => role.code === 'strapi-author');
    if (!publicRole) {
      console.log('? Role Public não encontrado!');
      return;
    }
    
    console.log(`? Role Public encontrado: ID ${publicRole.id}`);
    
    // 3. Obter ações disponíveis para cada content-type
    console.log('\n?? Buscando ações disponíveis...');
    const contentTypes = ['noticia', 'evento', 'curso'];
    
    for (const contentType of contentTypes) {
      console.log(`\n?? Processando: ${contentType}`);
      
      // Verificar se o content-type existe
      try {
        const actionsResponse = await axios.get(
          `${baseURL}/admin/content-api/permissions/actions`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
              subject: `api::${contentType}.${contentType}`
            },
            paramsSerializer: params => qs.stringify(params, { encode: false })
          }
        );
        
        const actions = actionsResponse.data.data || [];
        console.log(`   Ações encontradas: ${actions.length}`);
        
        if (actions.length === 0) {
          console.log(`   ??  Nenhuma ação para ${contentType}. Tentando criar...`);
          
          // Tentar criar permissões manualmente
          const manualActions = [
            {
              action: `api::${contentType}.${contentType}.find`,
              role: publicRole.id,
              subject: `api::${contentType}.${contentType}`
            },
            {
              action: `api::${contentType}.${contentType}.findOne`,
              role: publicRole.id,
              subject: `api::${contentType}.${contentType}`
            }
          ];
          
          for (const actionData of manualActions) {
            try {
              await axios.post(
                `${baseURL}/admin/content-api/permissions`,
                actionData,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              console.log(`   ? Criada permissão: ${actionData.action}`);
            } catch (error) {
              console.log(`   ? Erro criando ${actionData.action}: ${error.response?.data?.error?.message || error.message}`);
            }
          }
        } else {
          console.log(`   ??  Ações já existem para ${contentType}`);
        }
        
      } catch (error) {
        console.log(`   ? Erro buscando ações para ${contentType}: ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    // 4. Atualizar permissões do role Public
    console.log('\n?? Atualizando permissões do role Public...');
    
    const permissionsData = {
      permissions: [
        // Noticia
        { action: 'api::noticia.noticia.find' },
        { action: 'api::noticia.noticia.findOne' },
        // Evento
        { action: 'api::evento.evento.find' },
        { action: 'api::evento.evento.findOne' },
        // Curso
        { action: 'api::curso.curso.find' },
        { action: 'api::curso.curso.findOne' }
      ]
    };
    
    try {
      await axios.put(
        `${baseURL}/admin/roles/${publicRole.id}/permissions`,
        permissionsData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('? Permissões atualizadas com sucesso!');
      
    } catch (error) {
      console.log('? Erro atualizando permissões:', error.response?.data?.error?.message || error.message);
    }
    
    console.log('\n?? PROCESSO COMPLETO!');
    console.log('?? Agora verifique no admin se as coleções aparecem nas permissões.');
    
  } catch (error) {
    console.error('? ERRO GERAL:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.response?.status === 401) {
      console.log('\n?? Dica: Credenciais admin incorretas. Use seu email e senha do Strapi.');
    }
  }
}

// Executar
fixPermissions();
