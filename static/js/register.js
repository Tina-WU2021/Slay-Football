document.addEventListener('DOMContentLoaded', () => {
  const registerButton = document.getElementById('registerButton');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const repasswordInput = document.getElementById('repassword');
  const roleOptionInput = document.getElementById('roleOption');

  registerButton.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const repassword = repasswordInput.value.trim();
    const roleOption = roleOptionInput.value.trim();

    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }
    if (password !== repassword) {
      alert('Password mismatch!');
      return;
    }
    if (roleOption!=='student' && roleOption!=='user' ) {
      alert('Please select your role');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('roleOption', roleOption);

    
      const response = await fetch('/auth/register', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Welcome, \`${result.user.username}\`! \n You can login your account now!`);
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
