import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';

import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Books from '../views/Books.vue';
import Categories from '../views/Categories.vue';
import IssuedBooks from '../views/IssuedBooks.vue';
import Bookings from '../views/Bookings.vue';
import Students from '../views/Students.vue';
import BorrowingHistory from '../views/BorrowingHistory.vue';
import Overdue from '../views/Overdue.vue';
import Notifications from '../views/Notifications.vue';
import Settings from '../views/Settings.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/register', name: 'Register', component: Register, meta: { public: true } },
  { path: '/', name: 'Home', component: Dashboard },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/books', name: 'Books', component: Books },
  { path: '/categories', name: 'Categories', component: Categories },
  { path: '/issues', name: 'IssuedBooks', component: IssuedBooks },
  { path: '/bookings', name: 'Bookings', component: Bookings },
  { path: '/students', name: 'Students', component: Students },
  { path: '/history', name: 'BorrowingHistory', component: BorrowingHistory },
  { path: '/overdue', name: 'Overdue', component: Overdue },
  { path: '/notifications', name: 'Notifications', component: Notifications },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const { user, token, checkAuth, loading } = useAuth();

  if (loading.value) {
    await checkAuth();
  }

  const isPublic = to.meta.public;

  if (!token.value && !isPublic) {
    next('/login');
  } else if (token.value && isPublic) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
