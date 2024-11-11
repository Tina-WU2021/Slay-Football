document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  loginButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Logged as \`${result.user.username}\` (${result.user.role})`);
        window.location.href = '/index.html';
      } else {
        alert(result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Unknown error');
    }
  });
});
