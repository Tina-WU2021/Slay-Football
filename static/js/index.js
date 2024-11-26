document.addEventListener('DOMContentLoaded', function() {
    // 获取用户信息
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    // 如果未登录，直接跳转到登录页面
    if (!username || !userRole) {
        window.location.href = '/auth-login.html';
        return;
    }

    // 更新登录按钮
    updateLoginButton(username);

    // 控制菜单显示
    handleMenuVisibility(userRole);
    
    // 添加获取事件列表的功能
    fetchEvents();
});

// 获取事件列表
async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const events = await response.json();
        displayEvents(events);
        updateStadiumFilter(events);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load events. Please try again.');
    }
}

// 显示事件列表
function displayEvents(events) {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = ''; // 清空现有内容

    events.forEach(event => {
        const eventDate = new Date(event.eventTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const eventItem = `
            <div class="list-group-item stadium-${event.venue.replace(/\s+/g, '')}">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="mb-1">${event.title}</h5>
                        <p class="mb-1">Date: ${eventDate}</p>
                        <p class="mb-1">Stadium: ${event.venue}</p>
                        <p class="mb-1">${event.description}</p>
                        <a href="buy.html?eventId=${event._id}" class="btn btn-primary">Buy Tickets</a>
                    </div>
                    <div class="col-md-4">
                        <img src="assets/football match1.png" alt="match" class="img-fluid rounded-4">
                    </div>
                </div>
            </div>
        `;
        eventList.innerHTML += eventItem;
    });
}

// 更新场馆筛选器
function updateStadiumFilter(events) {
    const stadiumFilter = document.getElementById('stadiumFilter');
    const venues = new Set(events.map(event => event.venue));
    
    // 清空现有选项（保留 All Stadiums）
    stadiumFilter.innerHTML = '<option value="all" selected>All Stadiums</option>';
    
    // 添加从后端获取的场馆
    venues.forEach(venue => {
        stadiumFilter.innerHTML += `<option value="${venue}">${venue}</option>`;
    });
}

// 场馆筛选功能
document.getElementById('stadiumFilter').addEventListener('change', function() {
    const selectedStadium = this.value;
    const events = document.getElementsByClassName('list-group-item');

    Array.from(events).forEach(event => {
        const venueText = event.querySelector('p:nth-child(3)').textContent;
        if (selectedStadium === 'all' || venueText.includes(selectedStadium)) {
            event.classList.remove('hidden');
        } else {
            event.classList.add('hidden');
        }
    });
});

function updateLoginButton(username) {
    const loginButton = document.querySelector('.btn-success');
    const iconText = document.getElementById('iconText');
    
    // 更新登录按钮显示用户名
    loginButton.href = '#';
    iconText.textContent = username;
    
    // 添加登出功能
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            window.location.href = '/auth-login.html';
        }
    });
}

function handleMenuVisibility(userRole) {
    // 使用更可靠的选择器
    const adminSection = document.querySelector('.admin-section');
    const userSection = document.querySelector('.user-section');
    const eventSection = document.querySelector('.event-section');

    // 默认隐藏所有区域
    adminSection.style.display = 'none';
    userSection.style.display = 'none';
    eventSection.style.display = 'none';

    if (userRole === 'user') {
        // 普通用户只显示用户和活动区域
        userSection.style.display = 'block';
        eventSection.style.display = 'block';
    } else if (userRole === 'admin') {
        // 管理员显示所有区域
        adminSection.style.display = 'block';
        userSection.style.display = 'block';
        eventSection.style.display = 'block';
    }
}

// 添加路由保护功能
function checkAccess() {
    const userRole = localStorage.getItem('userRole');
    const currentPath = window.location.pathname;

    // 检查管理员页面访问权限
    if (currentPath.includes('admin-') && userRole !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/index.html';
        return false;
    }

    return true;
}

// 在页面加载时检查访问权限
if (!checkAccess()) {
    window.location.href = '/index.html';
}
