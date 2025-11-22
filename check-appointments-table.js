// Script para verificar a estrutura da tabela appointments
import mysql from 'mysql2/promise';

async function checkAppointmentsTable() {
  let connection;

  try {
    // Conectar ao banco de dados
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'cortei123',
      database: process.env.DB_NAME || 'cortei'
    });

    console.log('✅ Conectado ao banco de dados');

    // Verificar a estrutura da tabela
    const [columns] = await connection.query('DESCRIBE appointments');
    console.log('\n📋 Estrutura da tabela appointments:');
    console.table(columns);

    // Verificar se há registros
    const [count] = await connection.query('SELECT COUNT(*) as total FROM appointments');
    console.log(`\n📊 Total de agendamentos: ${count[0].total}`);

    // Mostrar os últimos 5 agendamentos
    const [recent] = await connection.query(`
      SELECT id, company_id, professional_id, service_id, client_name,
             appointment_date, appointment_time, status, created_at
      FROM appointments
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (recent.length > 0) {
      console.log('\n🕐 Últimos 5 agendamentos:');
      console.table(recent);
    }

    // Verificar a definição do reminder_sent
    const [tableInfo] = await connection.query(`
      SHOW CREATE TABLE appointments
    `);
    console.log('\n🔧 Definição completa da tabela:');
    console.log(tableInfo[0]['Create Table']);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Conexão fechada');
    }
  }
}

checkAppointmentsTable();
