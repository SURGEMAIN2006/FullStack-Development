import { ref, computed } from 'vue';
import { api, getAuthToken, setAuthToken } from '../services/api';

const user = ref(null);
const token = ref(getAuthToken());
const loading = ref(true);
const toast = ref(null);

export function useAuth() {
  const showToast = (message, type = 'info') => {
    toast.value = { id: Date.now(), message, type };
    setTimeout(() => {
      toast.value = null;
    }, 4000);
  };

  const dismissToast = () => {
    toast.value = null;
  };

  const checkAuth = async () => {
    const storedToken = getAuthToken();
    if (storedToken) {
      try {
        const res = await api.getMe();
        user.value = res.user;
      } catch (err) {
        console.error('Auth check error:', err);
        setAuthToken(null);
        token.value = null;
        user.value = null;
      }
    }
    loading.value = false;
  };

  const login = async (email, password) => {
    loading.value = true;
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.token);
      token.value = res.token;
      user.value = res.user;
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      return res.user;
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    loading.value = true;
    try {
      const res = await api.register(userData);
      setAuthToken(res.token);
      token.value = res.token;
      user.value = res.user;
      showToast('Account registered successfully!', 'success');
      return res.user;
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    token.value = null;
    user.value = null;
    showToast('Logged out successfully.', 'info');
  };

  return {
    user,
    token,
    loading,
    toast,
    isAdmin: computed(() => user.value?.role === 'admin'),
    isStudent: computed(() => user.value?.role === 'student'),
    checkAuth,
    login,
    register,
    logout,
    showToast,
    dismissToast
  };
}
