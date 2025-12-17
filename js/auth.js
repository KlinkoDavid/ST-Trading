const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showLoginBtn = document.getElementById('showLogin');
const showRegisterBtn = document.getElementById('showRegister');

// --- 1. VIZUÁLIS FUNKCIÓK (Értesítések és váltás) ---

function showNotice(message, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-notice-overlay';
  overlay.innerHTML = `
    <div class="custom-notice-box">
      <p>${message}</p>
      <button class="btn primary full-width" id="noticeOkBtn">Értem</button>
      <div class="timer-container">
        <div class="timer-bar" id="noticeTimer"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const bar = document.getElementById('noticeTimer');
  const duration = 3000;
  let elapsed = 0;

  const timerInterval = setInterval(() => {
    elapsed += 10;
    if (bar) bar.style.width = (100 - (elapsed / duration * 100)) + '%';
    if (elapsed >= duration) {
      clearInterval(timerInterval);
      overlay.remove();
      if (callback) callback();
    }
  }, 10);

  document.getElementById('noticeOkBtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    overlay.remove();
    if (callback) callback();
  });
}

function switchForm(type) {
  if (type === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
    document.title = 'Stranger Trading — Belépés';
  } else {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    showRegisterBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
    document.title = 'Stranger Trading — Regisztráció';
  }
}

showLoginBtn.addEventListener('click', () => switchForm('login'));
showRegisterBtn.addEventListener('click', () => switchForm('register'));

// REGISZTRÁCIÓ
registerForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('regUser').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value.trim();

  if (!username || !email || !password) return;

  sessionStorage.setItem('pendingUser', username);
  

  fetch('./php/api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', username, email, password })
  });

  // 3. Azonnali ugrás
  window.location.href = 'verification.html';
});

// BELÉPÉS
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();

  try {
    const response = await fetch('./php/api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    
    const result = await response.json();

    if (result.success) {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('user', username);
      showNotice(`Üdv újra, ${username}!`, () => {
        window.location.href = 'index.html';
      });
    } else if (result.unverified) {
      // Ha nincs aktiválva, akkor is átküldjük a verification oldalra
      sessionStorage.setItem('pendingUser', username);
      showNotice('A fiókod még nincs aktiválva!', () => {
        window.location.href = 'verification.html';
      });
    } else {
      showNotice(result.message || 'Hibás felhasználónév vagy jelszó!');
    }
  } catch (err) {
    showNotice('Hiba a belépés során!');
  }
});