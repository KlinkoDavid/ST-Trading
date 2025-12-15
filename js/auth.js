const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showLoginBtn = document.getElementById('showLogin');
const showRegisterBtn = document.getElementById('showRegister');

// A form váltását kezelő funkció
function switchForm(view) {
  if (view === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
    document.title = 'Stranger Trading — Belépés';
  } else if (view === 'register') {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    showLoginBtn.classList.remove('active');
    showRegisterBtn.classList.add('active');
    document.title = 'Stranger Trading — Regisztráció';
  }
}

// Eseményfigyelők a gombokhoz
showLoginBtn.addEventListener('click', () => switchForm('login'));
showRegisterBtn.addEventListener('click', () => switchForm('register'));

// Form kezelés

// Belépés
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  
  if (username && password) {
      // DEMO: Sikeres bejelentkezést szimulálunk
      sessionStorage.setItem('isLoggedIn', 'true'); 
      console.log(`Bejelentkezés szimulálva: ${username}`);
      alert(`Üdv, ${username}! Sikeres bejelentkezés (demo).`);
      window.location.href = 'index.html'; 
  } else {
      alert('Kérlek, töltsd ki mindkét mezőt a belépéshez.');
  }
});

// Regisztráció
registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const regUser = document.getElementById('regUser').value.trim();
  const regPass = document.getElementById('regPass').value.trim();
  
  if (regUser && regPass) {
      // DEMO: Regisztráció szimulálása
      alert(`Regisztráció sikeres (demo)! Fiók: ${regUser}. Most jelentkezhetsz be.`);
      switchForm('login');
      // Töröljük a regisztrációs formot, hogy üres legyen a következő alkalomra
      registerForm.reset(); 
  } else {
      alert('Kérlek, töltsd ki mindkét mezőt a regisztrációhoz.');
  }
});

// Kezdeti állapot beállítása betöltéskor
document.addEventListener('DOMContentLoaded', () => {
    switchForm('login'); 
});