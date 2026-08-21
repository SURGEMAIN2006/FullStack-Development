const { initDatabase, query } = require('../backend/config/db');

async function seed() {
  try {
    console.log('Initializing database connection for seeding...');
    await initDatabase();
    console.log('Seeding process complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
