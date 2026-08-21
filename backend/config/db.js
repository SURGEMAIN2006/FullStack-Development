const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbType = 'mysql';
let mysqlPool = null;
let memoryStore = null;

const getHashedPassword = (plain) => bcrypt.hashSync(plain, 10);

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'librasphere';
  const port = process.env.DB_PORT || 3306;

  try {
    // 1. Create MySQL Database if not existing
    const tempConn = await mysql.createConnection({ host, port, user, password });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();

    // 2. Initialize Pool
    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await mysqlPool.getConnection();
    conn.release();
    console.log(`[DB Engine] Connected to MySQL Database: "${database}"`);
    dbType = 'mysql';

    await setupTables();
    return;
  } catch (err) {
    console.warn(`[DB Engine Warning] MySQL connection failed (${err.message}).`);
    if (process.env.ALLOW_SQLITE_FALLBACK !== 'false') {
      console.log(`[DB Engine] Initializing resilient in-memory database fallback...`);
      dbType = 'memory';
      initMemoryStore();
      return;
    } else {
      throw err;
    }
  }
}

// Unified Query Execution Wrapper
async function query(sql, params = []) {
  if (dbType === 'mysql') {
    const [rows] = await mysqlPool.execute(sql, params);
    if (rows && typeof rows.insertId !== 'undefined') {
      return { rows, insertId: rows.insertId, affectedRows: rows.affectedRows };
    }
    return Array.isArray(rows) ? rows : [rows];
  } else {
    return runMemoryQuery(sql, params);
  }
}

async function setupTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
      phone VARCHAR(20) DEFAULT NULL,
      student_id VARCHAR(50) DEFAULT NULL,
      department VARCHAR(100) DEFAULT NULL,
      avatar_url VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      icon VARCHAR(50) DEFAULT 'BookOpen',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      book_code VARCHAR(20) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(150) NOT NULL,
      isbn VARCHAR(30) NOT NULL UNIQUE,
      category_id INT NOT NULL,
      publisher VARCHAR(150) DEFAULT NULL,
      publication_year INT DEFAULT NULL,
      description TEXT DEFAULT NULL,
      total_copies INT NOT NULL DEFAULT 1,
      available_copies INT NOT NULL DEFAULT 1,
      cover_image VARCHAR(500) DEFAULT NULL,
      location_rack VARCHAR(50) DEFAULT 'Rack A-1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS book_issues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      issue_code VARCHAR(20) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      book_id INT NOT NULL,
      issue_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE DEFAULT NULL,
      status ENUM('Issued', 'Returned', 'Overdue') NOT NULL DEFAULT 'Issued',
      fine_amount DECIMAL(8,2) DEFAULT 0.00,
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_code VARCHAR(20) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      book_id INT NOT NULL,
      booking_date DATE NOT NULL,
      status ENUM('Pending', 'Approved', 'Reserved', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Pending',
      queue_position INT NOT NULL DEFAULT 1,
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info', 'success', 'warning', 'danger') NOT NULL DEFAULT 'info',
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await seedDefaultDataIfEmpty();
}

async function seedDefaultDataIfEmpty() {
  const users = await query(`SELECT COUNT(*) as count FROM users`);
  const userCount = users[0]?.count || users[0]?.['COUNT(*)'] || 0;

  if (parseInt(userCount) === 0) {
    console.log('[DB Engine] Seeding dataset into database...');

    const adminPass = getHashedPassword('admin123');
    const studentPass = getHashedPassword('student123');

    await query(`
      INSERT INTO users (user_code, name, email, password_hash, role, phone, student_id, department, avatar_url)
      VALUES 
      ('USR-001', 'Admin Librarian', 'admin@librasphere.com', ?, 'admin', '+1 (555) 019-2834', 'ADM-001', 'Library Operations', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
      ('USR-002', 'Alex Mercer', 'student@librasphere.com', ?, 'student', '+1 (555) 234-5678', 'STU-2024-001', 'Computer Science', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
      ('USR-003', 'Sophia Chen', 'sophia.c@university.edu', ?, 'student', '+1 (555) 345-6789', 'STU-2024-042', 'Data Science', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
      ('USR-004', 'Marcus Vance', 'marcus.v@university.edu', ?, 'student', '+1 (555) 456-7890', 'STU-2024-088', 'Electrical Engineering', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
      ('USR-005', 'Emma Watson', 'emma.w@university.edu', ?, 'student', '+1 (555) 567-8901', 'STU-2024-105', 'Literature & Arts', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150');
    `, [adminPass, studentPass, studentPass, studentPass, studentPass]);

    await query(`
      INSERT INTO categories (name, description, icon) VALUES
      ('Computer Science', 'Algorithms, Software Engineering, AI & Database Systems', 'Cpu'),
      ('Mathematics', 'Calculus, Linear Algebra, Statistics & Discrete Math', 'Binary'),
      ('Physics & Chemistry', 'Quantum Mechanics, Thermodynamics & Chemistry', 'Atom'),
      ('Business & Economics', 'Finance, Management, Leadership & Microeconomics', 'TrendingUp'),
      ('Literature & Fiction', 'Classic & Modern Novels, Poetry & Drama', 'BookOpen'),
      ('History & Philosophy', 'World History, Political Thought & Ethics', 'Globe');
    `);

    await query(`
      INSERT INTO books (book_code, title, author, isbn, category_id, publisher, publication_year, description, total_copies, available_copies, cover_image, location_rack) VALUES
      ('BK-1001', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 1, 'Prentice Hall', 2008, 'Even bad code can function. But if code isn''t clean, it can bring a development organization to its knees.', 5, 2, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 'Rack CS-01'),
      ('BK-1002', 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1491903063', 1, 'O''Reilly Media', 2017, 'The definitive guide to data architecture, scalability, consistency, and distributed systems design.', 4, 1, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 'Rack CS-02'),
      ('BK-1003', 'Introduction to Algorithms (4th Edition)', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', 1, 'MIT Press', 2022, 'Comprehensive reference work on modern algorithms covering graph theory, dynamic programming, and complexity.', 6, 4, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'Rack CS-03'),
      ('BK-1004', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0134610993', 1, 'Pearson', 2020, 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence.', 3, 0, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', 'Rack CS-04'),
      ('BK-1005', 'Linear Algebra and Its Applications', 'Gilbert Strang', '978-0030105678', 2, 'Cengage Learning', 2016, 'Renowned textbook introducing linear equations, vector spaces, and eigenvalues with real-world applications.', 5, 3, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', 'Rack MA-01'),
      ('BK-1006', 'Principles of Mathematical Analysis', 'Walter Rudin', '978-0070542358', 2, 'McGraw Hill', 1976, 'Classic rigorous text covering real and complex analysis for advanced mathematics scholars.', 2, 2, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', 'Rack MA-02'),
      ('BK-1007', 'The Feynman Lectures on Physics', 'Richard P. Feynman', '978-0465023820', 3, 'Basic Books', 2011, 'Iconic three-volume lectures covering mechanics, radiation, quantum electrodynamics, and matter.', 4, 3, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', 'Rack PH-01'),
      ('BK-1008', 'The Intelligent Investor', 'Benjamin Graham', '978-0060555665', 4, 'Harper Business', 2006, 'The classic text on value investing, risk management, and long-term financial portfolio strategy.', 5, 2, 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', 'Rack BU-01'),
      ('BK-1009', '1984', 'George Orwell', '978-0451524935', 5, 'Signet Classic', 1950, 'A terrifying dystopian masterpiece exploring surveillance, total totalitarian control, and individual freedom.', 6, 5, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400', 'Rack LI-01'),
      ('BK-1010', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 6, 'Harper', 2015, 'Explores how Homo sapiens conquered Earth through cognitive revolutions, agriculture, and shared myths.', 4, 1, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', 'Rack HI-01');
    `);

    await query(`
      INSERT INTO book_issues (issue_code, user_id, book_id, issue_date, due_date, return_date, status, fine_amount, notes) VALUES
      ('ISS-1001', 2, 1, '2026-08-01', '2026-08-15', NULL, 'Overdue', 15.00, 'Student was notified via email.'),
      ('ISS-1002', 3, 2, '2026-08-10', '2026-08-24', NULL, 'Issued', 0.00, 'Standard 14-day borrowing.'),
      ('ISS-1003', 4, 4, '2026-08-05', '2026-08-19', NULL, 'Overdue', 10.00, 'Second overdue notice dispatched.'),
      ('ISS-1004', 5, 8, '2026-08-12', '2026-08-26', NULL, 'Issued', 0.00, 'Reserved copy pickup.'),
      ('ISS-1005', 2, 3, '2026-07-15', '2026-07-29', '2026-07-28', 'Returned', 0.00, 'Returned in excellent condition.'),
      ('ISS-1006', 3, 10, '2026-08-14', '2026-08-28', NULL, 'Issued', 0.00, 'Course reading assignment.');
    `);

    await query(`
      INSERT INTO bookings (booking_code, user_id, book_id, booking_date, status, queue_position, notes) VALUES
      ('RES-1001', 2, 4, '2026-08-16', 'Approved', 1, 'Awaiting book return by Marcus Vance.'),
      ('RES-1002', 3, 4, '2026-08-17', 'Pending', 2, 'Second in queue for AI textbook.'),
      ('RES-1003', 5, 2, '2026-08-18', 'Reserved', 1, 'Copy held at front desk for pickup.'),
      ('RES-1004', 4, 1, '2026-08-20', 'Pending', 1, 'Requested notification upon return.');
    `);

    await query(`
      INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
      (2, 'Overdue Book Warning', 'Your issued book "Clean Code" was due on Aug 15, 2026. Please return it immediately.', 'danger', 0, '2026-08-16 09:00:00'),
      (2, 'Reservation Approved', 'Your reservation request for "Artificial Intelligence: A Modern Approach" has been approved.', 'success', 1, '2026-08-16 11:30:00'),
      (4, 'Overdue Notice', 'Your issued book "Artificial Intelligence: A Modern Approach" is past due date.', 'warning', 0, '2026-08-20 14:15:00'),
      (3, 'Book Available Soon', 'You are #2 in line for "Artificial Intelligence: A Modern Approach".', 'info', 0, '2026-08-17 16:45:00');
    `);

    console.log('[DB Engine] Default dataset successfully seeded.');
  }
}

// Resilient memory mock store for instant zero-dependency execution
function initMemoryStore() {
  const adminPass = getHashedPassword('admin123');
  const studentPass = getHashedPassword('student123');

  memoryStore = {
    users: [
      { id: 1, user_code: 'USR-001', name: 'Admin Librarian', email: 'admin@librasphere.com', password_hash: adminPass, role: 'admin', phone: '+1 (555) 019-2834', student_id: 'ADM-001', department: 'Library Operations', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', created_at: new Date() },
      { id: 2, user_code: 'USR-002', name: 'Alex Mercer', email: 'student@librasphere.com', password_hash: studentPass, role: 'student', phone: '+1 (555) 234-5678', student_id: 'STU-2024-001', department: 'Computer Science', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', created_at: new Date() },
      { id: 3, user_code: 'USR-003', name: 'Sophia Chen', email: 'sophia.c@university.edu', password_hash: studentPass, role: 'student', phone: '+1 (555) 345-6789', student_id: 'STU-2024-042', department: 'Data Science', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', created_at: new Date() },
      { id: 4, user_code: 'USR-004', name: 'Marcus Vance', email: 'marcus.v@university.edu', password_hash: studentPass, role: 'student', phone: '+1 (555) 456-7890', student_id: 'STU-2024-088', department: 'Electrical Engineering', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', created_at: new Date() },
      { id: 5, user_code: 'USR-005', name: 'Emma Watson', email: 'emma.w@university.edu', password_hash: studentPass, role: 'student', phone: '+1 (555) 567-8901', student_id: 'STU-2024-105', department: 'Literature & Arts', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', created_at: new Date() }
    ],
    categories: [
      { id: 1, name: 'Computer Science', description: 'Algorithms, Software Engineering, AI & Database Systems', icon: 'Cpu' },
      { id: 2, name: 'Mathematics', description: 'Calculus, Linear Algebra, Statistics & Discrete Math', icon: 'Binary' },
      { id: 3, name: 'Physics & Chemistry', description: 'Quantum Mechanics, Thermodynamics & Chemistry', icon: 'Atom' },
      { id: 4, name: 'Business & Economics', description: 'Finance, Management, Leadership & Microeconomics', icon: 'TrendingUp' },
      { id: 5, name: 'Literature & Fiction', description: 'Classic & Modern Novels, Poetry & Drama', icon: 'BookOpen' },
      { id: 6, name: 'History & Philosophy', description: 'World History, Political Thought & Ethics', icon: 'Globe' }
    ],
    books: [
      { id: 1, book_code: 'BK-1001', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', isbn: '978-0132350884', category_id: 1, publisher: 'Prentice Hall', publication_year: 2008, description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.', total_copies: 5, available_copies: 2, cover_image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', location_rack: 'Rack CS-01', created_at: new Date() },
      { id: 2, book_code: 'BK-1002', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1491903063', category_id: 1, publisher: 'O\'Reilly Media', publication_year: 2017, description: 'The definitive guide to data architecture, scalability, consistency, and distributed systems design.', total_copies: 4, available_copies: 1, cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', location_rack: 'Rack CS-02', created_at: new Date() },
      { id: 3, book_code: 'BK-1003', title: 'Introduction to Algorithms (4th Edition)', author: 'Thomas H. Cormen, Charles E. Leiserson', isbn: '978-0262046305', category_id: 1, publisher: 'MIT Press', publication_year: 2022, description: 'Comprehensive reference work on modern algorithms covering graph theory, dynamic programming, and complexity.', total_copies: 6, available_copies: 4, cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', location_rack: 'Rack CS-03', created_at: new Date() },
      { id: 4, book_code: 'BK-1004', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', isbn: '978-0134610993', category_id: 1, publisher: 'Pearson', publication_year: 2020, description: 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence.', total_copies: 3, available_copies: 0, cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', location_rack: 'Rack CS-04', created_at: new Date() },
      { id: 5, book_code: 'BK-1005', title: 'Linear Algebra and Its Applications', author: 'Gilbert Strang', isbn: '978-0030105678', category_id: 2, publisher: 'Cengage Learning', publication_year: 2016, description: 'Renowned textbook introducing linear equations, vector spaces, and eigenvalues with real-world applications.', total_copies: 5, available_copies: 3, cover_image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', location_rack: 'Rack MA-01', created_at: new Date() },
      { id: 6, book_code: 'BK-1006', title: 'Principles of Mathematical Analysis', author: 'Walter Rudin', isbn: '978-0070542358', category_id: 2, publisher: 'McGraw Hill', publication_year: 1976, description: 'Classic rigorous text covering real and complex analysis for advanced mathematics scholars.', total_copies: 2, available_copies: 2, cover_image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', location_rack: 'Rack MA-02', created_at: new Date() },
      { id: 7, book_code: 'BK-1007', title: 'The Feynman Lectures on Physics', author: 'Richard P. Feynman', isbn: '978-0465023820', category_id: 3, publisher: 'Basic Books', publication_year: 2011, description: 'Iconic three-volume lectures covering mechanics, radiation, quantum electrodynamics, and matter.', total_copies: 4, available_copies: 3, cover_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', location_rack: 'Rack PH-01', created_at: new Date() },
      { id: 8, book_code: 'BK-1008', title: 'The Intelligent Investor', author: 'Benjamin Graham', isbn: '978-0060555665', category_id: 4, publisher: 'Harper Business', publication_year: 2006, description: 'The classic text on value investing, risk management, and long-term financial portfolio strategy.', total_copies: 5, available_copies: 2, cover_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', location_rack: 'Rack BU-01', created_at: new Date() },
      { id: 9, book_code: 'BK-1009', title: '1984', author: 'George Orwell', isbn: '978-0451524935', category_id: 5, publisher: 'Signet Classic', publication_year: 1950, description: 'A terrifying dystopian masterpiece exploring surveillance, total totalitarian control, and individual freedom.', total_copies: 6, available_copies: 5, cover_image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400', location_rack: 'Rack LI-01', created_at: new Date() },
      { id: 10, book_code: 'BK-1010', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '978-0062316097', category_id: 6, publisher: 'Harper', publication_year: 2015, description: 'Explores how Homo sapiens conquered Earth through cognitive revolutions, agriculture, and shared myths.', total_copies: 4, available_copies: 1, cover_image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', location_rack: 'Rack HI-01', created_at: new Date() }
    ],
    book_issues: [
      { id: 1, issue_code: 'ISS-1001', user_id: 2, book_id: 1, issue_date: '2026-08-01', due_date: '2026-08-15', return_date: null, status: 'Overdue', fine_amount: 15.00, notes: 'Student notified via email.', created_at: new Date() },
      { id: 2, issue_code: 'ISS-1002', user_id: 3, book_id: 2, issue_date: '2026-08-10', due_date: '2026-08-24', return_date: null, status: 'Issued', fine_amount: 0.00, notes: 'Standard 14-day borrowing.', created_at: new Date() },
      { id: 3, issue_code: 'ISS-1003', user_id: 4, book_id: 4, issue_date: '2026-08-05', due_date: '2026-08-19', return_date: null, status: 'Overdue', fine_amount: 10.00, notes: 'Overdue notice dispatched.', created_at: new Date() },
      { id: 4, issue_code: 'ISS-1004', user_id: 5, book_id: 8, issue_date: '2026-08-12', due_date: '2026-08-26', return_date: null, status: 'Issued', fine_amount: 0.00, notes: 'Reserved pickup.', created_at: new Date() },
      { id: 5, issue_code: 'ISS-1005', user_id: 2, book_id: 3, issue_date: '2026-07-15', due_date: '2026-07-29', return_date: '2026-07-28', status: 'Returned', fine_amount: 0.00, notes: 'Returned in good condition.', created_at: new Date() },
      { id: 6, issue_code: 'ISS-1006', user_id: 3, book_id: 10, issue_date: '2026-08-14', due_date: '2026-08-28', return_date: null, status: 'Issued', fine_amount: 0.00, notes: 'Course assignment.', created_at: new Date() }
    ],
    bookings: [
      { id: 1, booking_code: 'RES-1001', user_id: 2, book_id: 4, booking_date: '2026-08-16', status: 'Approved', queue_position: 1, notes: 'Awaiting return', created_at: new Date() },
      { id: 2, booking_code: 'RES-1002', user_id: 3, book_id: 4, booking_date: '2026-08-17', status: 'Pending', queue_position: 2, notes: 'Second in queue', created_at: new Date() },
      { id: 3, booking_code: 'RES-1003', user_id: 5, book_id: 2, booking_date: '2026-08-18', status: 'Reserved', queue_position: 1, notes: 'Held at desk', created_at: new Date() },
      { id: 4, booking_code: 'RES-1004', user_id: 4, book_id: 1, booking_date: '2026-08-20', status: 'Pending', queue_position: 1, notes: 'Requested hold', created_at: new Date() }
    ],
    notifications: [
      { id: 1, user_id: 2, title: 'Overdue Book Warning', message: 'Your issued book "Clean Code" was due on Aug 15, 2026. Please return it immediately.', type: 'danger', is_read: 0, created_at: new Date() },
      { id: 2, user_id: 2, title: 'Reservation Approved', message: 'Your reservation request for "Artificial Intelligence: A Modern Approach" has been approved.', type: 'success', is_read: 1, created_at: new Date() },
      { id: 3, user_id: 4, title: 'Overdue Notice', message: 'Your issued book "Artificial Intelligence: A Modern Approach" is past due date.', type: 'warning', is_read: 0, created_at: new Date() },
      { id: 4, user_id: 3, title: 'Book Available Soon', message: 'You are #2 in line for "Artificial Intelligence: A Modern Approach".', type: 'info', is_read: 0, created_at: new Date() }
    ]
  };
}

function runMemoryQuery(sql, params) {
  const trimmed = sql.trim().toLowerCase();
  
  if (trimmed.startsWith('select count(*)')) {
    if (trimmed.includes('from users')) return [{ count: memoryStore.users.length }];
    if (trimmed.includes('from books')) return [{ count: memoryStore.books.length, total_copies: memoryStore.books.reduce((s,b)=>s+b.total_copies,0), available_copies: memoryStore.books.reduce((s,b)=>s+b.available_copies,0) }];
    if (trimmed.includes('from book_issues')) return [{ count: memoryStore.book_issues.length }];
    if (trimmed.includes('from bookings')) return [{ count: memoryStore.bookings.length }];
  }

  if (trimmed.startsWith('select')) {
    if (trimmed.includes('from users')) {
      let res = memoryStore.users.map(u => ({ ...u }));
      if (params.length === 1 && typeof params[0] === 'string' && params[0].includes('@')) {
        res = res.filter(u => u.email === params[0]);
      } else if (params.length === 1 && typeof params[0] === 'number') {
        res = res.filter(u => u.id === params[0]);
      }
      return res;
    }
    if (trimmed.includes('from categories')) {
      return memoryStore.categories.map(c => ({
        ...c,
        book_count: memoryStore.books.filter(b => b.category_id === c.id).length
      }));
    }
    if (trimmed.includes('from books')) {
      let res = memoryStore.books.map(b => {
        const cat = memoryStore.categories.find(c => c.id === b.category_id);
        return { ...b, category_name: cat?.name || 'General', category_icon: cat?.icon || 'BookOpen' };
      });
      if (params.length === 1 && typeof params[0] === 'number') {
        res = res.filter(b => b.id === params[0]);
      }
      return res;
    }
    if (trimmed.includes('from book_issues')) {
      return memoryStore.book_issues.map(bi => {
        const u = memoryStore.users.find(x => x.id === bi.user_id);
        const b = memoryStore.books.find(x => x.id === bi.book_id);
        return {
          ...bi,
          student_name: u?.name || 'Student',
          student_email: u?.email || '',
          student_id: u?.student_id || u?.user_code || '',
          department: u?.department || '',
          student_phone: u?.phone || '',
          book_title: b?.title || 'Book',
          book_author: b?.author || '',
          isbn: b?.isbn || '',
          cover_image: b?.cover_image || '',
          book_code: b?.book_code || ''
        };
      });
    }
    if (trimmed.includes('from bookings')) {
      return memoryStore.bookings.map(bk => {
        const u = memoryStore.users.find(x => x.id === bk.user_id);
        const b = memoryStore.books.find(x => x.id === bk.book_id);
        return {
          ...bk,
          student_name: u?.name || 'Student',
          student_email: u?.email || '',
          student_id: u?.student_id || u?.user_code || '',
          department: u?.department || '',
          book_title: b?.title || 'Book',
          book_author: b?.author || '',
          isbn: b?.isbn || '',
          cover_image: b?.cover_image || '',
          available_copies: b?.available_copies || 0
        };
      });
    }
    if (trimmed.includes('from notifications')) {
      return memoryStore.notifications.map(n => {
        const u = memoryStore.users.find(x => x.id === n.user_id);
        return { ...n, user_name: u?.name || 'User' };
      });
    }
  }

  // Insert fallback
  if (trimmed.startsWith('insert into users')) {
    const id = memoryStore.users.length + 1;
    const newUser = { id, user_code: params[0], name: params[1], email: params[2], password_hash: params[3], role: params[4], phone: params[5], student_id: params[6], department: params[7], avatar_url: params[8], created_at: new Date() };
    memoryStore.users.push(newUser);
    return { insertId: id, affectedRows: 1 };
  }
  if (trimmed.startsWith('insert into books')) {
    const id = memoryStore.books.length + 1;
    const newBook = { id, book_code: params[0], title: params[1], author: params[2], isbn: params[3], category_id: parseInt(params[4]), publisher: params[5], publication_year: params[6], description: params[7], total_copies: params[8], available_copies: params[9], cover_image: params[10], location_rack: params[11], created_at: new Date() };
    memoryStore.books.push(newBook);
    return { insertId: id, affectedRows: 1 };
  }
  if (trimmed.startsWith('insert into book_issues')) {
    const id = memoryStore.book_issues.length + 1;
    const newIssue = { id, issue_code: params[0], user_id: parseInt(params[1]), book_id: parseInt(params[2]), issue_date: params[3], due_date: params[4], return_date: null, status: 'Issued', fine_amount: 0.0, notes: params[5], created_at: new Date() };
    memoryStore.book_issues.push(newIssue);
    return { insertId: id, affectedRows: 1 };
  }
  if (trimmed.startsWith('insert into bookings')) {
    const id = memoryStore.bookings.length + 1;
    const newBooking = { id, booking_code: params[0], user_id: parseInt(params[1]), book_id: parseInt(params[2]), booking_date: params[3], status: 'Pending', queue_position: params[4], notes: params[5], created_at: new Date() };
    memoryStore.bookings.push(newBooking);
    return { insertId: id, affectedRows: 1 };
  }
  if (trimmed.startsWith('insert into notifications')) {
    const id = memoryStore.notifications.length + 1;
    const newNotif = { id, user_id: parseInt(params[0]), title: params[1], message: params[2], type: params[3], is_read: 0, created_at: new Date() };
    memoryStore.notifications.push(newNotif);
    return { insertId: id, affectedRows: 1 };
  }

  // Update / Delete Fallbacks
  return { insertId: 1, affectedRows: 1, rows: [] };
}

module.exports = {
  initDatabase,
  query,
  getDbType: () => dbType
};
