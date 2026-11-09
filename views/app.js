const API_BASE = 'http://localhost:5000/api/auth';

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const messageEl = document.getElementById('message');
const profileEl = document.getElementById('profile');
const profileInfoEl = document.getElementById('profile-info');
const logoutBtn = document.getElementById('logout-btn');

function showTab(tab) {
  const isLogin = tab === 'login';
  tabLogin.classList.toggle('active', isLogin);
  tabRegister.classList.toggle('active', !isLogin);
  loginForm.classList.toggle('active', isLogin);
  registerForm.classList.toggle('active', !isLogin);
  messageEl.textContent = '';
}

tabLogin.addEventListener('click', () => showTab('login'));
tabRegister.addEventListener('click', () => showTab('register'));

function setMessage(text, isError = true) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#ff6b6b' : '#4fd18c';
}

// Wraps fetch + res.json() so a non-JSON or network failure never throws
// an unhandled error into the UI — always resolves to a predictable shape.
async function apiRequest(path, options) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    return { ok: false, data: { message: 'Network error — is the server running?' } };
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { message: 'Unexpected server response' };
  }

  return { ok: res.ok, data };
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function showProfile(user) {
  loginForm.classList.remove('active');
  registerForm.classList.remove('active');
  tabLogin.classList.add('hidden');
  tabRegister.classList.add('hidden');
  profileEl.classList.remove('hidden');
  profileInfoEl.textContent = `${user.name} (${user.email})`;
  messageEl.textContent = '';
}

function showAuthForms() {
  profileEl.classList.add('hidden');
  tabLogin.classList.remove('hidden');
  tabRegister.classList.remove('hidden');
  showTab('login');
}

// --- Register ---
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  const { ok, data } = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (!ok) {
    setMessage(data.message || 'Registration failed');
    return;
  }

  saveSession(data.token, data.user);
  showProfile(data.user);
});

// --- Login ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const { ok, data } = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!ok) {
    setMessage(data.message || 'Login failed');
    return;
  }

  saveSession(data.token, data.user);
  showProfile(data.user);
});

// --- Logout ---
logoutBtn.addEventListener('click', () => {
  clearSession();
  showAuthForms();
});

// --- On load: check if already logged in via stored token ---
(async function init() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const { ok, data } = await apiRequest('/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (ok) {
    showProfile(data.user);
  } else {
    clearSession();
  }
})();
