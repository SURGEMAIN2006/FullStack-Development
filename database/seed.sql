-- LibraSphere - Seed Data File (Harry Potter Collection)

USE librasphere;

-- Disable Foreign Key checks for clean seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE bookings;
TRUNCATE TABLE book_issues;
TRUNCATE TABLE books;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Initial Users
INSERT INTO users (user_code, name, email, password_hash, role, phone, student_id, department, avatar_url)
VALUES 
('USR-001', 'Admin Librarian', 'admin@librasphere.com', '$2a$10$wT0dG2M5/oO5o3G3.13w8e1S5f0qR5u3n0t1.1.1.1.1.1.1.1', 'admin', '+1 (555) 019-2834', 'ADM-001', 'Library Operations', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('USR-002', 'Alex Mercer', 'student@librasphere.com', '$2a$10$wT0dG2M5/oO5o3G3.13w8e1S5f0qR5u3n0t1.1.1.1.1.1.1.1', 'student', '+1 (555) 234-5678', 'STU-2024-001', 'Computer Science', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
('USR-003', 'Sophia Chen', 'sophia.c@university.edu', '$2a$10$wT0dG2M5/oO5o3G3.13w8e1S5f0qR5u3n0t1.1.1.1.1.1.1.1', 'student', '+1 (555) 345-6789', 'STU-2024-042', 'Data Science', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('USR-004', 'Marcus Vance', 'marcus.v@university.edu', '$2a$10$wT0dG2M5/oO5o3G3.13w8e1S5f0qR5u3n0t1.1.1.1.1.1.1.1', 'student', '+1 (555) 456-7890', 'STU-2024-088', 'Electrical Engineering', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('USR-005', 'Emma Watson', 'emma.w@university.edu', '$2a$10$wT0dG2M5/oO5o3G3.13w8e1S5f0qR5u3n0t1.1.1.1.1.1.1.1', 'student', '+1 (555) 567-8901', 'STU-2024-105', 'Literature & Arts', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150');

-- 2. Insert Categories
INSERT INTO categories (name, description, icon) VALUES
('Fantasy & Fiction', 'Iconic epic fantasy, wizarding adventures, and world literature', 'Sparkles'),
('Magical Arts & Folklore', 'Spells, magical creatures, legendary lore, and wizarding history', 'BookOpen'),
('Hogwarts Library Collections', 'Restricted section and archived Hogwarts educational titles', 'FolderTree'),
('Young Adult & Literature', 'Classic and contemporary young adult fiction novels', 'BookMarked'),
('History of Magic', 'Chronicles of ancient magical events and wizarding history', 'Globe'),
('Wizarding World Chronicles', 'Companion guides, fairy tales, and magical sport lore', 'Award');

-- 3. Insert Books (Harry Potter Series)
INSERT INTO books (book_code, title, author, isbn, category_id, publisher, publication_year, description, total_copies, available_copies, cover_image, location_rack) VALUES
('HP-1001', 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '978-0590353427', 1, 'Scholastic', 1997, 'Rescued from the outrageous neglect of his aunt and uncle, a young boy with a great destiny proves his worth at Hogwarts School of Witchcraft and Wizardry.', 6, 4, 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=400', 'Rack HP-01'),
('HP-1002', 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', '978-0439064873', 1, 'Scholastic', 1998, 'The Dursleys were so mean that all Harry wanted was to get back to Hogwarts. But a mysterious house-elf warns of deadly dangers awaiting him.', 5, 2, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', 'Rack HP-01'),
('HP-1003', 'Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', '978-0439136358', 1, 'Scholastic', 1999, 'For twelve long years, the dread fortress of Azkaban held the infamous prisoner Sirius Black. Now he has escaped, leaving dark clues.', 5, 3, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', 'Rack HP-02'),
('HP-1004', 'Harry Potter and the Goblet of Fire', 'J.K. Rowling', '978-0439139601', 1, 'Scholastic', 2000, 'Harry Potter wants to get away from the Dursleys and attend the Quidditch World Cup. Then mysterious events pull him into the Triwizard Tournament.', 4, 1, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 'Rack HP-02'),
('HP-1005', 'Harry Potter and the Order of the Phoenix', 'J.K. Rowling', '978-0439358071', 1, 'Scholastic', 2003, 'Dark times have come to Hogwarts. After a Dementor attack in Little Whinging, Harry prepares for the gathering storm.', 4, 0, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', 'Rack HP-03'),
('HP-1006', 'Harry Potter and the Half-Blood Prince', 'J.K. Rowling', '978-0439785969', 1, 'Scholastic', 2005, 'Dumbledore guides Harry through the memories of Voldemort''s past to uncover the secret of the Horcruxes.', 5, 3, 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400', 'Rack HP-03'),
('HP-1007', 'Harry Potter and the Deathly Hallows', 'J.K. Rowling', '978-0545010221', 1, 'Scholastic', 2007, 'The final adventure in the saga. Harry, Ron, and Hermione set out on a perilous mission to locate and destroy Voldemort''s Horcruxes.', 6, 4, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', 'Rack HP-04'),
('HP-1008', 'The Tales of Beedle the Bard', 'J.K. Rowling', '978-0545128285', 2, 'Children''s High-Level Group', 2008, 'A collection of five wizarding fairy tales written by J.K. Rowling, including The Tale of the Three Brothers.', 3, 2, 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', 'Rack HP-04'),
('HP-1009', 'Fantastic Beasts and Where to Find Them', 'J.K. Rowling', '978-0439321600', 2, 'Scholastic', 2001, 'Approved textbook at Hogwarts School of Witchcraft and Wizardry detailing magizoology and magical creatures.', 4, 2, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', 'Rack HP-05'),
('HP-1010', 'Quidditch Through the Ages', 'J.K. Rowling', '978-0439321624', 6, 'Scholastic', 2001, 'A comprehensive guide to the history, tactics, and famous teams of Quidditch, the sport of the wizarding world.', 3, 1, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400', 'Rack HP-05');

-- 4. Insert Active Book Checkouts & Issues
INSERT INTO book_issues (issue_code, user_id, book_id, issue_date, due_date, return_date, status, fine_amount, notes) VALUES
('ISS-1001', 2, 1, '2026-08-01', '2026-08-15', NULL, 'Overdue', 15.00, 'Student was notified via email.'),
('ISS-1002', 3, 2, '2026-08-10', '2026-08-24', NULL, 'Issued', 0.00, 'Standard 14-day borrowing.'),
('ISS-1003', 4, 5, '2026-08-05', '2026-08-19', NULL, 'Overdue', 10.00, 'Second overdue notice dispatched.'),
('ISS-1004', 5, 4, '2026-08-12', '2026-08-26', NULL, 'Issued', 0.00, 'Reserved copy pickup.'),
('ISS-1005', 2, 3, '2026-07-15', '2026-07-29', '2026-07-28', 'Returned', 0.00, 'Returned in excellent condition.'),
('ISS-1006', 3, 7, '2026-08-14', '2026-08-28', NULL, 'Issued', 0.00, 'Course reading assignment.');

-- 5. Insert Bookings & Reservations
INSERT INTO bookings (booking_code, user_id, book_id, booking_date, status, queue_position, notes) VALUES
('RES-1001', 2, 5, '2026-08-16', 'Approved', 1, 'Awaiting book return by Marcus Vance.'),
('RES-1002', 3, 5, '2026-08-17', 'Pending', 2, 'Second in queue for Order of the Phoenix.'),
('RES-1003', 5, 2, '2026-08-18', 'Reserved', 1, 'Copy held at front desk for pickup.'),
('RES-1004', 4, 1, '2026-08-20', 'Pending', 1, 'Requested notification upon return.');

-- 6. Insert System Notifications
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(2, 'Overdue Book Warning', 'Your issued book "Harry Potter and the Sorcerer''s Stone" was due on Aug 15. Please return it to the library.', 'danger', 0, '2026-08-16 09:00:00'),
(2, 'Reservation Approved', 'Your reservation request for "Harry Potter and the Order of the Phoenix" has been approved.', 'success', 1, '2026-08-16 11:30:00'),
(4, 'Overdue Notice', 'Your issued book "Harry Potter and the Order of the Phoenix" is past due date.', 'warning', 0, '2026-08-20 14:15:00'),
(3, 'Book Available Soon', 'You are #2 in line for "Harry Potter and the Order of the Phoenix".', 'info', 0, '2026-08-17 16:45:00');
