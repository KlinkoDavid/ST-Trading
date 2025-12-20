document.addEventListener('DOMContentLoaded', async function () {
  const profileNameEl = document.getElementById('profileName');
  const profileEmailEl = document.getElementById('profileEmail');
  const logoutBtn = document.getElementById('logoutBtn');
  const cardsGrid = document.getElementById('profileCardsGrid');

  function isLoggedIn() { return sessionStorage.getItem('isLoggedIn') === 'true'; }

  if (!isLoggedIn()) {
    // If not logged in, redirect to login page
    window.location.href = 'login.html';
    return;
  }

  const username = sessionStorage.getItem('user') || '—';
  profileNameEl.textContent = username;
  profileEmailEl.textContent = ''; // email is not stored in sessionStorage by default

  if (logoutBtn) logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (window.logout) {
      window.logout();
    } else {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('user');
      window.location.href = 'index.html';
    }
  });

  // Fetch all cards and filter by owner === username
  try {
    const res = await fetch('php/get_cards.php');
    if (res.ok) {
      const data = await res.json();
      const myCards = (Array.isArray(data) ? data : []).filter(c => (c.owner || '').toLowerCase() === username.toLowerCase());
      renderCards(myCards);
    }
  } catch (e) {
    // ignore
  }

  function renderCards(list) {
    if (!cardsGrid) return;
    cardsGrid.innerHTML = '';
    if (!list || list.length === 0) {
      cardsGrid.innerHTML = '<p class="muted">Nincsenek kártyáid.</p>';
      return;
    }

    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card reveal';
      card.onclick = () => window.viewCard && window.viewCard(c.id);

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

      cardsGrid.appendChild(card);
      // If the global observer exists (from app.js), observe for reveal
      try { if (window.observer) window.observer.observe(card); } catch (e) { }
    });
  }
});
