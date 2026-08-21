-- LibraSphere Sample Seed Data (MySQL)

USE `librasphere`;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `book_issues`;
TRUNCATE TABLE `books`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- Users (bcrypt hash for 'admin123' & 'student123': $2a$10$Zf8.6gU2tI8vT1fS6W0AzeB.bJ1w6U3A2B1C0D9E8F7G6H5I4J3K2)
INSERT INTO `users` (`id`, `user_code`, `name`, `email`, `password_hash`, `role`, `phone`, `student_id`, `department`, `avatar_url`) VALUES
(1, 'USR-001', 'Admin Librarian', 'admin@librasphere.com', '$2a$10$m6N9V/v9wGzHn9F4h1s6veS7hJ0H3zV5Q8R2E1W4Y7Z0A9B8C7D6E', 'admin', '+1 (555) 019-2834', 'ADM-001', 'Library Operations', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'USR-002', 'Alex Mercer', 'student@librasphere.com', '$2a$10$m6N9V/v9wGzHn9F4h1s6veS7hJ0H3zV5Q8R2E1W4Y7Z0A9B8C7D6E', 'student', '+1 (555) 234-5678', 'STU-2024-001', 'Computer Science', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
(3, 'USR-003', 'Sophia Chen', 'sophia.c@university.edu', '$2a$10$m6N9V/v9wGzHn9F4h1s6veS7hJ0H3zV5Q8R2E1W4Y7Z0A9B8C7D6E', 'student', '+1 (555) 345-6789', 'STU-2024-042', 'Data Science', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(4, 'USR-004', 'Marcus Vance', 'marcus.v@university.edu', '$2a$10$m6N9V/v9wGzHn9F4h1s6veS7hJ0H3zV5Q8R2E1W4Y7Z0A9B8C7D6E', 'student', '+1 (555) 456-7890', 'STU-2024-088', 'Electrical Engineering', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(5, 'USR-005', 'Emma Watson', 'emma.w@university.edu', '$2a$10$m6N9V/v9wGzHn9F4h1s6veS7hJ0H3zV5Q8R2E1W4Y7Z0A9B8C7D6E', 'student', '+1 (555) 567-8901', 'STU-2024-105', 'Literature & Arts', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150');

-- Categories
INSERT INTO `categories` (`id`, `name`, `description`, `icon`) VALUES
(1, 'Computer Science', 'Algorithms, Software Engineering, AI & Database Systems', 'Cpu'),
(2, 'Mathematics', 'Calculus, Linear Algebra, Statistics & Discrete Math', 'Binary'),
(3, 'Physics & Chemistry', 'Quantum Mechanics, Thermodynamics & Chemistry', 'Atom'),
(4, 'Business & Economics', 'Finance, Management, Leadership & Microeconomics', 'TrendingUp'),
(5, 'Literature & Fiction', 'Classic & Modern Novels, Poetry & Drama', 'BookOpen'),
(6, 'History & Philosophy', 'World History, Political Thought & Ethics', 'Globe');

-- Books
INSERT INTO `books` (`id`, `book_code`, `title`, `author`, `isbn`, `category_id`, `publisher`, `publication_year`, `description`, `total_copies`, `available_copies`, `cover_image`, `location_rack`) VALUES
(1, 'BK-1001', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 1, 'Prentice Hall', 2008, 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.', 5, 2, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 'Rack CS-01'),
(2, 'BK-1002', 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1491903063', 1, 'O\'Reilly Media', 2017, 'The definitive guide to data architecture, scalability, consistency, and distributed systems design.', 4, 1, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 'Rack CS-02'),
(3, 'BK-1003', 'Introduction to Algorithms (4th Edition)', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262046305', 1, 'MIT Press', 2022, 'Comprehensive reference work on modern algorithms covering graph theory, dynamic programming, and complexity.', 6, 4, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'Rack CS-03'),
(4, 'BK-1004', 'Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0134610993', 1, 'Pearson', 2020, 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence.', 3, 0, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', 'Rack CS-04'),
(5, 'BK-1005', 'Linear Algebra and Its Applications', 'Gilbert Strang', '978-0030105678', 2, 'Cengage Learning', 2016, 'Renowned textbook introducing linear equations, vector spaces, and eigenvalues with real-world applications.', 5, 3, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', 'Rack MA-01'),
(6, 'BK-1006', 'Principles of Mathematical Analysis', 'Walter Rudin', '978-0070542358', 2, 'McGraw Hill', 1976, 'Classic rigorous text covering real and complex analysis for advanced mathematics scholars.', 2, 2, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', 'Rack MA-02'),
(7, 'BK-1007', 'The Feynman Lectures on Physics', 'Richard P. Feynman', '978-0465023820', 3, 'Basic Books', 2011, 'Iconic three-volume lectures covering mechanics, radiation, quantum electrodynamics, and matter.', 4, 3, 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', 'Rack PH-01'),
(8, 'BK-1008', 'The Intelligent Investor', 'Benjamin Graham', '978-0060555665', 4, 'Harper Business', 2006, 'The classic text on value investing, risk management, and long-term financial portfolio strategy.', 5, 2, 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', 'Rack BU-01'),
(9, 'BK-1009', '1984', 'George Orwell', '978-0451524935', 5, 'Signet Classic', 1950, 'A terrifying dystopian masterpiece exploring surveillance, total totalitarian control, and individual freedom.', 6, 5, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400', 'Rack LI-01'),
(10, 'BK-1010', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 6, 'Harper', 2015, 'Explores how Homo sapiens conquered Earth through cognitive revolutions, agriculture, and shared myths.', 4, 1, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', 'Rack HI-01');

-- Book Issues
INSERT INTO `book_issues` (`id`, `issue_code`, `user_id`, `book_id`, `issue_date`, `due_date`, `return_date`, `status`, `fine_amount`, `notes`) VALUES
(1, 'ISS-1001', 2, 1, '2026-08-01', '2026-08-15', NULL, 'Overdue', 15.00, 'Student was notified via email.'),
(2, 'ISS-1002', 3, 2, '2026-08-10', '2026-08-24', NULL, 'Issued', 0.00, 'Standard 14-day borrowing.'),
(3, 'ISS-1003', 4, 4, '2026-08-05', '2026-08-19', NULL, 'Overdue', 10.00, 'Second overdue notice dispatched.'),
(4, 'ISS-1004', 5, 8, '2026-08-12', '2026-08-26', NULL, 'Issued', 0.00, 'Reserved copy pickup.'),
(5, 'ISS-1005', 2, 3, '2026-07-15', '2026-07-29', '2026-07-28', 'Returned', 0.00, 'Returned in excellent condition.'),
(6, 'ISS-1006', 3, 10, '2026-08-14', '2026-08-28', NULL, 'Issued', 0.00, 'Course reading assignment.');

-- Bookings / Reservations
INSERT INTO `bookings` (`id`, `booking_code`, `user_id`, `book_id`, `booking_date`, `status`, `queue_position`, `notes`) VALUES
(1, 'RES-1001', 2, 4, '2026-08-16', 'Approved', 1, 'Awaiting book return by Marcus Vance.'),
(2, 'RES-1002', 3, 4, '2026-08-17', 'Pending', 2, 'Second in queue for AI textbook.'),
(3, 'RES-1003', 5, 2, '2026-08-18', 'Reserved', 1, 'Copy held at front desk for pickup.'),
(4, 'RES-1004', 4, 1, '2026-08-20', 'Pending', 1, 'Requested notification upon return.');

-- Notifications
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 2, 'Overdue Book Warning', 'Your issued book "Clean Code" was due on Aug 15, 2026. Please return it immediately.', 'danger', 0, '2026-08-16 09:00:00'),
(2, 2, 'Reservation Approved', 'Your reservation request for "Artificial Intelligence: A Modern Approach" has been approved.', 'success', 1, '2026-08-16 11:30:00'),
(3, 4, 'Overdue Notice', 'Your issued book "Artificial Intelligence: A Modern Approach" is past due date.', 'warning', 0, '2026-08-20 14:15:00'),
(4, 3, 'Book Available Soon', 'You are #2 in line for "Artificial Intelligence: A Modern Approach".', 'info', 0, '2026-08-17 16:45:00');
