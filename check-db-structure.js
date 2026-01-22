// check-db-structure.js - Verifica estrutura REAL do banco
const { Client } = require('pg');

async function checkStructure() {
  console.log('?????? VERIFICANDO ESTRUTURA REAL DO BANCO ??????\n');
  
  const client = new Client({
    connectionString: 'postgresql://meu_admin:QUm94o4oPL9x6bhGCX4B4zIGxwZeRRIF@dpg-d5kgas94tr6s73au58pg-a.frankfurt-postgres.render.com:5432/strapi_5cj5',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('? Conectado ao banco!');
    
    // 1. Verificar tabelas de permissões
    console.log('\n?? TABELAS DE PERMISSÕES E ROLES:');
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%permission%' OR table_name LIKE '%role%'
      ORDER BY table_name
    `);
    
    tables.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });
    
    // 2. Verificar estrutura da tabela up_permissions
    console.log('\n?? ESTRUTURA DA TABELA up_permissions:');
    const permColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'up_permissions'
      ORDER BY ordinal_position
    `);
    
    if (permColumns.rows.length === 0) {
      console.log('   ? Tabela up_permissions não existe ou não tem colunas!');
    } else {
      permColumns.rows.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
      });
    }
    
    // 3. Verificar estrutura da tabela up_roles
    console.log('\n?? ESTRUTURA DA TABELA up_roles:');
    const roleColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'up_roles'
      ORDER BY ordinal_position
    `);
    
    roleColumns.rows.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // 4. Verificar relação entre tabelas
    console.log('\n?? TABELAS DE RELAÇÃO (links):');
    const linkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name LIKE '%links'
      ORDER BY table_name
    `);
    
    linkTables.rows.forEach(row => {
      console.log(`   • ${row.table_name}`);
    });
    
    // 5. Verificar up_permissions_role_links se existir
    if (linkTables.rows.some(t => t.table_name === 'up_permissions_role_links')) {
      console.log('\n?? ESTRUTURA up_permissions_role_links:');
      const linkColumns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'up_permissions_role_links'
        ORDER BY ordinal_position
      `);
      
      linkColumns.rows.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // 6. Ver dados atuais
    console.log('\n?? DADOS ATUAIS:');
    
    // Roles
    const roles = await client.query('SELECT id, name, type FROM up_roles ORDER BY id');
    console.log(`   Roles: ${roles.rows.length} registros`);
    roles.rows.forEach(role => {
      console.log(`     ID ${role.id}: ${role.name} (${role.type})`);
    });
    
    // Permissions
    const perms = await client.query('SELECT id, action FROM up_permissions LIMIT 5');
    console.log(`   Permissions: ${perms.rowCount} registros (mostrando 5 primeiros)`);
    perms.rows.forEach(perm => {
      console.log(`     ID ${perm.id}: ${perm.action}`);
    });
    
  } catch (error) {
    console.error('? Erro:', error.message);
  } finally {
    await client.end();
    console.log('\n?? Conexão encerrada');
  }
}

checkStructure();
