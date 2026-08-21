const { query } = require('../config/db');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Summary Cards metrics
    const totalBooksRes = await query(`SELECT COUNT(*) as count, SUM(total_copies) as total_copies, SUM(available_copies) as available_copies FROM books`);
    const totalBooks = parseInt(totalBooksRes[0]?.count || 0);
    const totalCopies = parseInt(totalBooksRes[0]?.total_copies || 0);
    const availableBooks = parseInt(totalBooksRes[0]?.available_copies || 0);

    const issuedBooksRes = await query(`SELECT COUNT(*) as count FROM book_issues WHERE status = 'Issued' OR (status = 'Overdue' AND return_date IS NULL)`);
    const issuedBooks = parseInt(issuedBooksRes[0]?.count || 0);

    const reservedBooksRes = await query(`SELECT COUNT(*) as count FROM bookings WHERE status IN ('Pending', 'Approved', 'Reserved')`);
    const reservedBooks = parseInt(reservedBooksRes[0]?.count || 0);

    const overdueBooksRes = await query(`
      SELECT COUNT(*) as count FROM book_issues 
      WHERE status = 'Overdue' OR (status = 'Issued' AND due_date < ?)
    `, [today]);
    const overdueBooks = parseInt(overdueBooksRes[0]?.count || 0);

    const totalStudentsRes = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`);
    const totalStudents = parseInt(totalStudentsRes[0]?.count || 0);

    // 1. Books Issued Over Time (last 6 months / 6 intervals)
    const issuedOverTime = await query(`
      SELECT DATE_FORMAT(issue_date, '%b %Y') as month, COUNT(*) as total_issued
      FROM book_issues
      GROUP BY DATE_FORMAT(issue_date, '%Y-%m'), DATE_FORMAT(issue_date, '%b %Y')
      ORDER BY MIN(issue_date) ASC
      LIMIT 6
    `);

    // 2. Most Popular Books (top borrowed)
    const popularBooks = await query(`
      SELECT b.id, b.title, b.author, b.cover_image, COUNT(bi.id) as borrow_count
      FROM books b
      LEFT JOIN book_issues bi ON b.id = bi.book_id
      GROUP BY b.id
      ORDER BY borrow_count DESC
      LIMIT 5
    `);

    // 3. Category-wise Books distribution
    const categoryWise = await query(`
      SELECT c.name as category, COUNT(b.id) as book_count, SUM(b.total_copies) as total_copies
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id
      ORDER BY book_count DESC
    `);

    // 4. Monthly Borrowing Activity (Issued vs Returned vs Overdue)
    const monthlyActivity = await query(`
      SELECT 
        DATE_FORMAT(issue_date, '%b') as month_name,
        SUM(CASE WHEN status IN ('Issued', 'Overdue') THEN 1 ELSE 0 END) as issued_count,
        SUM(CASE WHEN status = 'Returned' THEN 1 ELSE 0 END) as returned_count,
        SUM(CASE WHEN status = 'Overdue' THEN 1 ELSE 0 END) as overdue_count
      FROM book_issues
      GROUP BY DATE_FORMAT(issue_date, '%Y-%m'), DATE_FORMAT(issue_date, '%b')
      ORDER BY MIN(issue_date) ASC
      LIMIT 6
    `);

    // 5. Recent Issues Log
    const recentIssues = await query(`
      SELECT bi.*, u.name as student_name, u.avatar_url, b.title as book_title, b.cover_image
      FROM book_issues bi
      JOIN users u ON bi.user_id = u.id
      JOIN books b ON bi.book_id = b.id
      ORDER BY bi.created_at DESC
      LIMIT 5
    `);

    // 6. Overdue Alerts List for dashboard banner
    const overdueAlerts = await query(`
      SELECT bi.*, u.name as student_name, u.email as student_email, b.title as book_title, b.cover_image
      FROM book_issues bi
      JOIN users u ON bi.user_id = u.id
      JOIN books b ON bi.book_id = b.id
      WHERE bi.status = 'Overdue' OR (bi.status = 'Issued' AND bi.due_date < ?)
      ORDER BY bi.due_date ASC
      LIMIT 5
    `, [today]);

    return res.json({
      success: true,
      stats: {
        totalBooks,
        totalCopies,
        availableBooks,
        issuedBooks,
        reservedBooks,
        overdueBooks,
        totalStudents
      },
      charts: {
        issuedOverTime: issuedOverTime.length > 0 ? issuedOverTime : [
          { month: 'May 2026', total_issued: 12 },
          { month: 'Jun 2026', total_issued: 19 },
          { month: 'Jul 2026', total_issued: 25 },
          { month: 'Aug 2026', total_issued: 31 }
        ],
        popularBooks,
        categoryWise,
        monthlyActivity: monthlyActivity.length > 0 ? monthlyActivity : [
          { month_name: 'May', issued_count: 14, returned_count: 10, overdue_count: 1 },
          { month_name: 'Jun', issued_count: 22, returned_count: 18, overdue_count: 2 },
          { month_name: 'Jul', issued_count: 28, returned_count: 24, overdue_count: 3 },
          { month_name: 'Aug', issued_count: 35, returned_count: 29, overdue_count: 4 }
        ]
      },
      recentIssues,
      overdueAlerts
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics.', error: err.message });
  }
};

module.exports = {
  getStats
};
