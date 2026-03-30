document.addEventListener('DOMContentLoaded', async () => {
  const currentPage = document.body.dataset.page;

  if (currentPage) {
    const activeLink = document.querySelector(`[data-nav="${currentPage}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await window.apiRequest('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error(error);
      } finally {
        window.location.href = '/index.html';
      }
    });
  });

  if (document.body.dataset.protected !== 'true') {
    return;
  }

  try {
    const response = await window.apiRequest('/api/auth/session');
    document.querySelectorAll('[data-admin-name]').forEach((element) => {
      element.textContent = `${response.data.name} (${response.data.type.replace('_', ' ')})`;
    });
  } catch (error) {
    console.error(error);
  }
});
