# 📚 LibraSphere – Full-Stack Library Management System

LibraSphere is a complete, modern, full-stack Library Management System with a premium, classy, and highly organized admin dashboard. Built with **React**, **Vite**, **Tailwind CSS**, **Node.js/Express**, **MySQL**, **JWT**, and **bcrypt**.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT Authentication** with persistent HTTP bearer headers.
- **bcrypt Password Hashing** (10 salt rounds).
- **Role-Based Access Control**:
  - **Admin**: Full catalog CRUD, checkouts, returns, user management, reservation approvals, overdue alerts.
  - **Student / User**: View available catalog, place hold reservations, check personal active checkouts & borrowing history.

### 📊 Classy Admin Dashboard
- **6 Summary Metric Cards**: Total Books, Available Copies, Issued Books, Reserved Books, Overdue Books, Total Students.
- **Interactive Visual Statistics**:
  - Books Issued Over Time (Line Chart)
  - Monthly Borrowing Activity (Bar Chart)
  - Category-wise Distribution (Doughnut Chart)
  - Most Popular Books Leaderboard
- **Overdue Compliance Alerts Banner** and Quick Action shortcuts.

### 📖 Book Catalog & Search Engine
- **Dynamic Real-Time Search** by Book Title, Author, ISBN, Category, and Publisher.
- Filter by **Category** and **Availability** (Available vs Fully Reserved).
- **Dual View Modes**: Switch between Grid Cards and Compact Data Tables.
- Comprehensive book metadata: Title, Author, ISBN, Category, Publisher, Publication Year, Description, Total Copies, Available Copies, Cover Image URL, and Rack/Shelf Location.

### 🔄 Issue & Return Management
- **Automated Copy Counter**: Automatically decrements available count on checkout and increments on check-in.
- **Issue Modal**: Select Student, Book, Issue Date, Due Date, and custom notes.
- **Return Processor**: Calculates overdue days and automatic late fine ($2.00/day).
- **Queue Movement**: Automatically notifies the next queued student upon book check-in.

### 🔖 Booking / Reservation System
- Place holds on books currently out of stock or reserved.
- Queue position tracking (`#1 in line`, `#2 in line`).
- Admin approval pipeline: `Pending` ➔ `Approved` ➔ `Reserved (Held at Desk)` ➔ `Completed`.

### 👥 Student & User Directory
- Student Directory with Department sorting, Student ID, Email, Phone, and Active Checkout counters.
- Individual Student Profile Drawer with complete borrowing history.

### 🔔 Real-Time Notification System
- Bell icon dropdown in Navbar with unread counter badge.
- Triggers for: Book Checkout, Return Confirmation, Overdue Notices, Reservation Approvals, and Queue availability.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js (`react-chartjs-2`), React Router v6.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), bcryptjs, CORS, dotenv.
- **Database**: MySQL (`mysql2/promise`) with automatic SQLite zero-config fallback.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm (v10+ recommended)
- MySQL Server (Optional — an automated SQLite database fallback is built-in for instant zero-setup execution if MySQL is offline!)

---

### Step 1: Install Dependencies

#### Backend Dependencies:
```bash
cd backend
npm install
```

#### Frontend Dependencies:
```bash
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` in `backend/`:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your MySQL credentials:
```env
PORT=5000
JWT_SECRET=librasphere_secret_jwt_token_key_2026_super_secure
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=librasphere
ALLOW_SQLITE_FALLBACK=true
```

---

### Step 3: Seed Database (Optional / Automatic)

The server automatically initializes database tables and seeds rich sample data (books, users, issues, overdues, notifications) on first run.

To manually run the MySQL schema script:
```sql
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Or run via Node:
```bash
cd backend
npm run seed
```

---

### Step 4: Start Development Servers

#### Terminal 1 — Start Backend Server (Port 5000):
```bash
cd backend
npm start
```

#### Terminal 2 — Start Frontend Application (Port 3000):
```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:3000`

---

## 🔑 Default Login Credentials

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@librasphere.com` | `admin123` | Full Admin Dashboard, Book CRUD, Issue, Return, User Management |
| **Student** | `student@librasphere.com` | `student123` | Browse Catalog, Reserve Books, View Active Checkouts & History |

---

## 📂 Folder Structure

```
librasphere/
├── database/
│   ├── schema.sql           # MySQL database creation & table schemas
│   ├── seed.sql             # SQL seed dataset
│   └── seed.js              # Programmatic seed runner
├── backend/
│   ├── config/
│   │   └── db.js            # Unified DB interface (MySQL & SQLite fallback)
│   ├── controllers/         # REST API business logic
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── bookingController.js
│   │   ├── categoryController.js
│   │   ├── dashboardController.js
│   │   ├── issueController.js
│   │   ├── notificationController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js          # JWT & Role authorization guards
│   ├── routes/              # Express API endpoints
│   ├── server.js            # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, BookCard, Modals, Badges
│   │   ├── context/         # AuthContext state provider
│   │   ├── pages/           # Dashboard, Books, Issues, Bookings, Students, Overdue...
│   │   ├── services/        # Fetch API HTTP client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

---

## 📄 License
Licensed under the MIT License. Built for LibraSphere Library Systems.
