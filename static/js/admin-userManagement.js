document.addEventListener('DOMContentLoaded', async () => {
  let userData = [];

  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users from database');
    }
    userData = await response.json();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load user data. Please try again.');
  }
  console.log('userData', userData);
  RenderUserList(userData);
});

function RenderUserList(users) {
  const userContainer = document.getElementById('userContainer'); // Ensure this element exists in your HTML
  console.log('entered renderUserList', users);
  users.forEach((user) => {
    const userDiv = document.createElement('div');

                Object.assign(userDiv.style, {
                    width: '400px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    padding: '10px',
                    margin: '10px',
                    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column'
                });

                // Create user information elements
                userDiv.innerHTML = `
                    <h3>Username: ${user.username}</h3>
                    <p>Password: ${user.password}</p>
                    <p>Email: ${user.email}</p>
                    <p>Role: ${user.role}</p>
                    <img src="${user.userProfileImage}" alt="${user.username}'s profile image" style="max-width: 100%; height: auto;">
                `;

                userContainer.appendChild(userDiv);
  });
}
