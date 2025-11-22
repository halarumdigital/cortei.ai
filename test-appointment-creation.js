// Script de teste para criar um agendamento
import mysql from 'mysql2/promise';

async function testAppointmentCreation() {
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

    // Buscar uma empresa, profissional e serviço para teste
    const [companies] = await connection.query('SELECT id FROM companies LIMIT 1');
    if (companies.length === 0) {
      console.log('❌ Nenhuma empresa encontrada');
      return;
    }
    const companyId = companies[0].id;
    console.log('🏢 Company ID:', companyId);

    const [professionals] = await connection.query('SELECT id FROM professionals WHERE company_id = ? LIMIT 1', [companyId]);
    if (professionals.length === 0) {
      console.log('❌ Nenhum profissional encontrado para esta empresa');
      return;
    }
    const professionalId = professionals[0].id;
    console.log('👤 Professional ID:', professionalId);

    const [services] = await connection.query('SELECT id, duration, price FROM services WHERE company_id = ? LIMIT 1', [companyId]);
    if (services.length === 0) {
      console.log('❌ Nenhum serviço encontrado para esta empresa');
      return;
    }
    const service = services[0];
    console.log('💈 Service ID:', service.id, '- Duration:', service.duration, '- Price:', service.price);

    // Contar agendamentos antes
    const [countBefore] = await connection.query('SELECT COUNT(*) as total FROM appointments');
    console.log('\n📊 Total de agendamentos ANTES:', countBefore[0].total);

    // Criar um agendamento de teste
    const testData = {
      company_id: companyId,
      professional_id: professionalId,
      service_id: service.id,
      client_name: 'Cliente Teste API',
      client_phone: '49999999999',
      client_email: 'teste@teste.com',
      appointment_date: new Date('2025-12-25'),
      appointment_time: '14:00',
      status: 'agendado',
      duration: service.duration || 60,
      total_price: service.price || 0,
      notes: 'Agendamento de teste criado via script',
      reminder_sent: 0
    };

    console.log('\n📋 Criando agendamento de teste:', testData);

    const [result] = await connection.execute(
      `INSERT INTO appointments (
        company_id, professional_id, service_id, client_name, client_phone, client_email,
        appointment_date, appointment_time, status, duration, total_price, notes, reminder_sent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testData.company_id,
        testData.professional_id,
        testData.service_id,
        testData.client_name,
        testData.client_phone,
        testData.client_email,
        testData.appointment_date,
        testData.appointment_time,
        testData.status,
        testData.duration,
        testData.total_price,
        testData.notes,
        testData.reminder_sent
      ]
    );

    console.log('✅ Agendamento criado com sucesso! ID:', result.insertId);

    // Contar agendamentos depois
    const [countAfter] = await connection.query('SELECT COUNT(*) as total FROM appointments');
    console.log('📊 Total de agendamentos DEPOIS:', countAfter[0].total);

    // Buscar o agendamento criado
    const [created] = await connection.query('SELECT * FROM appointments WHERE id = ?', [result.insertId]);
    console.log('\n✅ Agendamento criado:');
    console.table(created);

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

testAppointmentCreation();
