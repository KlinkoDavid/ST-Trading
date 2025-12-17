const cards = [
  { id: 1, title: 'Eleven (Red Eyes)', series: 'Series A', owner: 'Zsófi', image: 'img/6pack.png' },
  { id: 2, title: 'Demogorgon Foil', series: 'Series B', owner: 'Bence', image: null },
  { id: 3, title: 'Hopper — Special', series: 'Series A', owner: 'Anna', image: null },
  { id: 4, title: 'Will Byers (Glow)', series: 'Series C', owner: 'Máté', image: null },
  { id: 5, title: 'Max — Skate', series: 'Series B', owner: 'Dóra', image: null },
  { id: 6, title: 'Dustin — Cap', series: 'Series A', owner: 'Gergő', image: null },
  { id: 7, title: 'Lucas — Slingshot', series: 'Series C', owner: 'Lilla', image: null },
  { id: 8, title: 'Mike — Walkie Talkie', series: 'Series B', owner: 'Áron', image: null }
];

let cardsEl, searchEl, modal, modalCardInfo, tradeForm, modalClose, modalCancel, authLink, activeCard;
let viewModal, viewModalBody, viewModalClose, viewModalOk;
let observer;

function isLoggedIn() { return sessionStorage.getItem('isLoggedIn') === 'true'; }

function logout(e) {
  if (e) e.preventDefault();
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('user');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', function () {
  cardsEl = document.getElementById('cardsGrid');
  searchEl = document.getElementById('search');
  modal = document.getElementById('tradeModal');
  modalCardInfo = document.getElementById('modalCardInfo');
  tradeForm = document.getElementById('tradeForm');
  modalClose = document.getElementById('modalClose');
  modalCancel = document.getElementById('modalCancel');
  authLink = document.getElementById('authLink');

  viewModal = document.getElementById('viewModal');
  viewModalBody = document.getElementById('viewModalBody');
  viewModalClose = document.getElementById('viewModalClose');
  viewModalOk = document.getElementById('viewModalOk');

  // Menü kezelése bejelentkezés alapján
  const navLinksContainer = document.querySelector('.nav-links');
  if (isLoggedIn() && authLink && navLinksContainer) {
    authLink.textContent = 'Kijelentkezés';
    authLink.href = '#';
    authLink.addEventListener('click', logout);

    const currentLinks = Array.from(navLinksContainer.querySelectorAll('a'));
    const hasCardsLink = currentLinks.some(link => link.getAttribute('href') === 'cards.html');

    if (!hasCardsLink) {
      const cardsLink = document.createElement('a');
      cardsLink.href = 'cards.html';
      cardsLink.textContent = 'Kártyák';
      navLinksContainer.insertBefore(cardsLink, authLink);
    }
  }

  // Megjelenési animációk (Scroll reveal)
  const observerOptions = { threshold: 0.15 };
  observer = new IntersectionObserver((entries) => {
    // Collect elements that just became visible and are not already active
    const visible = entries
      .filter(e => e.isIntersecting && !e.target.classList.contains('active'))
      // sort by vertical position so reveal happens top-to-bottom
      .sort((a, b) => a.boundingClientRect.y - b.boundingClientRect.y);

    if (visible.length === 0) return;

    visible.forEach((entry, i) => {
      // stagger delay per item (80ms step), cap at 800ms
      const delay = Math.min(i * 80, 800);
      setTimeout(() => {
        entry.target.classList.add('active');
        if (observer) observer.unobserve(entry.target);
      }, delay);
    });
  }, observerOptions);

  // Kártyák renderelése
  if (cardsEl) renderCards(cards);
  // Observe any existing reveal elements (including cards just rendered)
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  if (searchEl) {
    searchEl.addEventListener('input', function () {
      const q = this.value.trim().toLowerCase();
      const filtered = cards.filter(c => (c.title + ' ' + c.series + ' ' + c.owner).toLowerCase().includes(q));
      renderCards(filtered);
    });
  }

  // Modal bezárók
  const closeAllModals = () => {
    if (viewModal) viewModal.setAttribute('aria-hidden', 'true');
    if (modal) modal.setAttribute('aria-hidden', 'true');
  };

  if (viewModalClose) viewModalClose.addEventListener('click', closeAllModals);
  if (viewModalOk) viewModalOk.addEventListener('click', closeAllModals);
  if (modalClose) modalClose.addEventListener('click', closeAllModals);
  if (modalCancel) modalCancel.addEventListener('click', closeAllModals);

  window.addEventListener('click', (e) => {
    if (e.target === viewModal || e.target === modal) closeAllModals();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") closeAllModals();
  });

  if (tradeForm) {
    tradeForm.addEventListener('submit', function (evt) {
      evt.preventDefault();
      alert('Kérés elküldve!');
      closeAllModals();
    });
  }
});

function renderCards(list) {
  if (!cardsEl) return;
  cardsEl.innerHTML = '';
  list.forEach((c) => {
    const el = document.createElement('article');
    el.className = 'card reveal';
    el.style.cursor = 'pointer';
    el.onclick = () => viewCard(c.id);

    const thumbHtml = c.image
      ? `<div class="thumb"><img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title)}"></div>`
      : `<div class="thumb">${escapeHtml(c.title)}</div>`;

    el.innerHTML = `
      <div class="card-inner">
        ${thumbHtml}
        <h3>${escapeHtml(c.title)}</h3>
        <div class="meta">${escapeHtml(c.series)}</div>
      </div>
    `;
    cardsEl.appendChild(el);
    if (observer) observer.observe(el);
  });
}

window.viewCard = function (id) {
  const c = cards.find(x => x.id === id);
  if (!c || !viewModalBody) return;
  activeCard = c;

  const imgHtml = c.image
    ? `<div class="modal-view-img"><img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title)}"></div>`
    : `<div class="modal-view-placeholder">Nincs kép elérhető</div>`;

  viewModalBody.innerHTML = `
    <h2 data-text="${escapeHtml(c.title)}">${escapeHtml(c.title)}</h2>
    ${imgHtml}
    <div class="modal-view-details">
      <p><strong>Sorozat:</strong> ${escapeHtml(c.series)}</p>
      <p><strong>Tulajdonos:</strong> ${escapeHtml(c.owner)}</p>
    </div>
  `;
  viewModal.setAttribute('aria-hidden', 'false');
};

window.openTradeFromView = function () {
  viewModal.setAttribute('aria-hidden', 'true');
  modalCardInfo.innerHTML = `<strong>${escapeHtml(activeCard.title)}</strong><br><small>${escapeHtml(activeCard.series)}</small>`;
  modal.setAttribute('aria-hidden', 'false');
};

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[m])); }