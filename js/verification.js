    // Automatikus ellenőrzés futtatása
    const checkStatus = async () => {
      const username = sessionStorage.getItem('pendingUser');
      
      // Ha nincs elmentve felhasználó, visszadobjuk a loginra
      if (!username) {
        window.location.href = './login.html';
        return;
      }

      try {
        const response = await fetch('./php/api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check_status', username: username })
        });
        
        const result = await response.json();

        if (result.is_verified) {
          // Ha sikeres az aktiválás
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('user', username);
          sessionStorage.removeItem('pendingUser');
          
          // Kis várakozás a vizuális élményért
          setTimeout(() => {
            window.location.href = './cards.html';
          }, 1500);
        }
      } catch (err) {
        console.error("Hiba az ellenőrzés során:", err);
      }
    };

    const interval = setInterval(checkStatus, 3000);