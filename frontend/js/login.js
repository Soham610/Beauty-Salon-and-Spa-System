document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    window.clearMessage('loginMessage');

    try {
      const payload = window.formToObject(form);
      const response = await window.apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      window.showMessage('loginMessage', response.message);
      window.location.href = '/dashboard.html';
    } catch (error) {
      window.showMessage('loginMessage', error.message, 'error');
    }
  });
});
