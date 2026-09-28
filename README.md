# 📚 LibraSphere – Library Management System

LibraSphere is a full-stack web application designed for academic libraries to manage book inventories, student checkouts, hold reservations, and overdue tracking.

Built with **Vue 3**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MySQL**.

---

## 🌟 Key Features

- **Authentication & Security**: Role-based access control (Admin & Student) powered by JWT tokens and bcrypt password hashing.
- **Interactive Dashboard**: Real-time statistical metrics, monthly activity charts, category distribution, and overdue alert notices.
- **Book Catalog Management**: Search books by title, author, ISBN, or rack location; filter by category and availability; toggle between Grid and Table views.
- **Issue & Return System**: Process physical checkouts, specify due dates, and calculate overdue fines automatically upon return.
- **Reservation Queue**: Hold request queue system with queue position tracking and approval workflows.
- **User Directory**: Manage student academic profiles and view historical checkout logs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API `<script setup>`)
- **Build Tool**: Vite
- **Router**: Vue Router 4
- **Styling**: Tailwind CSS
- **Icons & Charts**: Lucide Icons & Chart.js (`vue-chartjs`)

### Backend
- **Server**: Node.js + Express.js
- **Database**: MySQL (Dual fallback interface)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*(The API server will run on `http://localhost:5000`)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(The Vue app will run on `http://localhost:3000`)*

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@librasphere.com` | `admin123` |
| **Student** | `student@librasphere.com` | `student123` |
