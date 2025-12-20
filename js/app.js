let cards = [];

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
      // Add profile link so logged-in users can open their profile page
      const hasProfileLink = currentLinks.some(link => link.getAttribute('href') === 'profile.html');
      if (!hasProfileLink) {
        const profileLink = document.createElement('a');
        profileLink.href = 'profile.html';
        profileLink.textContent = 'Profil';
        navLinksContainer.insertBefore(profileLink, authLink);
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

    // Apply a per-item CSS delay (so animation uses the delay) and activate
    visible.forEach((entry, i) => {
      const delay = Math.min(i * 80, 800);
      entry.target.style.setProperty('--reveal-delay', delay + 'ms');
      entry.target.classList.add('active');
      if (observer) observer.unobserve(entry.target);
    });
  }, observerOptions);

  // Kártyák renderelése
  if (cardsEl) fetchCards();
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

function renderCards(cardsToRender) {
  cardsEl.innerHTML = '';
  cardsToRender.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card reveal';
    card.onclick = () => viewCard(c.id);

    const thumbClass = c.image ? 'thumb has-image' : 'thumb';
    const imgHtml = c.image ? `<img src="${c.image}" alt="${c.title}">` : '<span>Nincs kép</span>';

    card.innerHTML = `
      <div class="${thumbClass}">
        ${imgHtml}
      </div>
      <h3>${c.title}</h3>
      <div class="meta">
        <span>${c.series}</span>
        <span> • ${c.city || 'Ismeretlen'}</span>
      </div>
    `;
    cardsEl.appendChild(card);
    // Observe newly added card so the scroll-reveal logic can trigger it.
    try { if (observer) observer.observe(card); } catch (e) { /* noop */ }
  });
}

async function fetchCards() {
  try {
    const res = await fetch('php/get_cards.php');
    if (!res.ok) throw new Error('Network');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      cards = data.map(d => ({
        id: d.id,
        title: d.title,
        series: d.series,
        owner: d.owner || d.username || '—',
        city: d.city || '—',
        image: d.image || null
      }));
    } else {
      // fallback to static
      cards = staticCards;
    }
  } catch (e) {
    cards = staticCards;
  }
  renderCards(cards);
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
      <p><strong>Tipus:</strong> ${escapeHtml(c.series)}</p>
      <p><strong>Tulajdonos:</strong> ${escapeHtml(c.owner)}</p>
      <p><strong>Város:</strong> ${escapeHtml(c.city)}</p>
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