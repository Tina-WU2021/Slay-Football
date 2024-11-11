document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/auth/me');

  if (!response.ok) {
    alert('Please login');
    window.open('/login.html', '_self');
    return;
  }

  const userData = await response.json();
  const usernameDisplay = document.getElementById('loginUsername');
  console.log('usernameDisplay', userData);
  usernameDisplay.textContent = userData.user.username + '(' + userData.user.role + ')';

  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', async () => {
    const confirmLogout = confirm('Confirm to logout?');
    if (confirmLogout) {
      const logoutResponse = await fetch('/auth/logout', {
        method: 'POST',
      });

      if (logoutResponse.ok) {
        window.location.href = '/login.html';
      } else {
        alert('Logout failed. Please try again.');
      }
    }
  });
});
