const cards = [
  {id:1,title:'Eleven (Red Eyes)',series:'Series A',owner:'Zsófi',image:null},
  {id:2,title:'Demogorgon Foil',series:'Series B',owner:'Bence',image:null},
  {id:3,title:'Hopper — Special',series:'Series A',owner:'Anna',image:null},
  {id:4,title:'Will Byers (Glow)',series:'Series C',owner:'Máté',image:null},
  {id:5,title:'Max — Skate',series:'Series B',owner:'Dóra',image:null},
  {id:6,title:'Dustin — Cap',series:'Series A',owner:'Gergő',image:null},
  {id:7,title:'Lucas — Slingshot',series:'Series C',owner:'Lilla',image:null},
  {id:8,title:'Mike — Walkie Talkie',series:'Series B',owner:'Áron',image:null}
];

const cardsEl = document.getElementById('cardsGrid');
const searchEl = document.getElementById('search');
const modal = document.getElementById('tradeModal');
const modalCardInfo = document.getElementById('modalCardInfo');
const tradeForm = document.getElementById('tradeForm');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');

// ÚJ ELEMEK A FELDOLGOZÁSHOZ
const cardsSection = document.getElementById('cards');
const navLinksEl = document.getElementById('navLinks');
const authLink = document.getElementById('authLink');

let activeCard = null;

// --- BEJELENTKEZÉS KEZELÉSE ---
// Ezt a sessionStorge-ot egy igazi backend rendszernél session cookie vagy token helyettesítené
const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'; 

function updateUIForAuth() {
    if (isLoggedIn) {
        // Bejelentkezve: Kártyák megjelenítése
        cardsSection.classList.remove('hidden');

        // Navigáció frissítése: Hozzáadjuk a Kártyák linket, és Kijelentkezésre cseréljük a gombot
        // Ellenőrizzük, hogy a Kártyák link nincs-e már ott
        if (!document.querySelector('#navLinks a[href="#cards"]')) {
            const cardsLink = document.createElement('a');
            cardsLink.href = '#cards';
            cardsLink.textContent = 'Kártyák';
            
            // Hozzáadjuk a Rólunk link után, a bejelentkezési link elé
            const aboutLink = document.querySelector('#navLinks a[href="#about"]');
            if (aboutLink) {
                navLinksEl.insertBefore(cardsLink, authLink);
            } else {
                 navLinksEl.insertBefore(cardsLink, authLink);
            }
        }
        
        authLink.textContent = 'Kijelentkezés';
        authLink.href = '#';
        // Eltávolítjuk a bejelentkezés oldali átirányítást (ha volt) és hozzáadjuk a kijelentkezést
        authLink.removeEventListener('click', redirectToLogin); 
        authLink.addEventListener('click', logout); 
        
        // Rendereljük a kártyákat
        renderCards(cards);
    } else {
        // Nincs bejelentkezve: Kártyák elrejtése
        cardsSection.classList.add('hidden');
        
        // Kártyák link eltávolítása (ha létezik)
        const existingCardsLink = document.querySelector('#navLinks a[href="#cards"]');
        if (existingCardsLink) {
            existingCardsLink.remove();
        }

        // Visszaállítjuk a Bejelentkezés linket
        authLink.textContent = 'Bejelentkezés';
        authLink.href = 'login.html';
        authLink.removeEventListener('click', logout); 
    }
}

function redirectToLogin(e) {
    // Ezt a funkciót csak azért kell, hogy ne ugorjon fel az 'undefined' hiba, 
    // mivel az index.html már tartalmazza a login.html linket
}

function logout(e) {
    e.preventDefault();
    sessionStorage.removeItem('isLoggedIn');
    alert('Sikeresen kijelentkeztél. Visszairányítás a főoldalra.');
    window.location.href = 'index.html'; // Oldal frissítése az állapotváltozás miatt
}

// Futás a DOM betöltése után
document.addEventListener('DOMContentLoaded', updateUIForAuth);
// -----------------------------


// Scroll reveal animation
const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight - 100;
    if (isVisible) el.classList.add('active');
  });
};
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);


function renderCards(list){
  cardsEl.innerHTML = '';
  // Csak akkor renderelünk kártyákat, ha be van jelentkezve
  if (!isLoggedIn) return; 
  
  list.forEach(c=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="thumb">${escapeHtml(c.title)}</div>
      <h3>${escapeHtml(c.title)}</h3>
      <div class="meta">${escapeHtml(c.series)} • Tulaj: ${escapeHtml(c.owner)}</div>
      <div class="actions">
        <button class="btn" onclick="viewCard(${c.id})">Megnéz</button>
        <button class="btn primary" onclick="openTrade(${c.id})">Kérés küldése</button>
      </div>
    `;
    cardsEl.appendChild(el);
  });
}

function escapeHtml(s){return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}

window.viewCard = function(id){
  const c = cards.find(x=>x.id===id);
  alert(`${c.title} — ${c.series} (Tulaj: ${c.owner})`);
}

window.openTrade = function(id){
  activeCard = cards.find(x=>x.id===id);
  modalCardInfo.innerHTML = `<strong>${escapeHtml(activeCard.title)}</strong><div class="meta">${escapeHtml(activeCard.series)} • Tulaj: ${escapeHtml(activeCard.owner)}</div>`;
  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  modal.setAttribute('aria-hidden','true');
  tradeForm.reset();
}

tradeForm.addEventListener('submit', function(evt){
  evt.preventDefault();
  const yourCard = document.getElementById('yourCard').value.trim();
  const message = document.getElementById('message').value.trim();
  // Simulate sending: store locally in localStorage as demo
  const requests = JSON.parse(localStorage.getItem('tradeRequests')||'[]')||[];
  requests.push({to:activeCard.owner,card:activeCard.title,yourCard,message,when:new Date().toISOString()});
  localStorage.setItem('tradeRequests',JSON.stringify(requests));
  alert('Kérés elküldve (demo): a tulajdonos értesítése szimulálva.');
  closeModal();
});

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);

searchEl.addEventListener('input', function(){
  const q = this.value.trim().toLowerCase();
  
  // Csak akkor keressünk, ha be van jelentkezve 
  if(!isLoggedIn) return;

  if(!q) return renderCards(cards);
  
  const filtered = cards.filter(c=> (c.title+ ' '+c.series+' '+c.owner).toLowerCase().includes(q));
  renderCards(filtered);
});