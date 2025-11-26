const { pool } = require('./src/config/database');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a PostgreSQL...\n');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Test 1: Conexión exitosa');
    console.log('   Hora del servidor:', result.rows[0].now);
    
    const dbCheck = await pool.query("SELECT current_database();");
    console.log('\n✅ Test 2: Base de datos actual:', dbCheck.rows[0].current_database);
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n✅ Test 3: Tablas existentes:');
    if (tables.rows.length === 0) {
      console.log('   ⚠️  No hay tablas. Ejecuta el script database/setup.sql');
    } else {
      tables.rows.forEach(row => {
        console.log('   -', row.table_name);
      });
    }
    
    console.log('\n🎉 Todos los tests pasaron!\n');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();