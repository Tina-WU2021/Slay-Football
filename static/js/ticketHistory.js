async function fetchTicketHistory() {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            throw new Error('请先登录');
        }

        const response = await fetch(`/api/tickets/user/${username}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('获取票务记录失败');
        }

        const tickets = await response.json();
        displayTickets(tickets);
    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.list-group').innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${error.message || '无法加载票务历史记录'}
            </div>
        `;
    }
}

function displayTickets(tickets) {
    const listGroup = document.querySelector('.list-group');
    if (!tickets || tickets.length === 0) {
        listGroup.innerHTML = `
            <div class="list-group-item">
                <p class="mb-1">暂无购票记录</p>
            </div>
        `;
        return;
    }

    listGroup.innerHTML = tickets.map(ticket => `
        <div class="list-group-item">
            <h5 class="mb-1">比赛: ${ticket.matchName || '未知比赛'}</h5>
            <p class="mb-1">购买日期: ${new Date(ticket.purchaseDate).toLocaleDateString()}</p>
            <p class="mb-1">比赛日期: ${new Date(ticket.matchDate).toLocaleDateString()}</p>
            <p class="mb-1">场馆: ${ticket.stadium || '未知场馆'}</p>
            <p class="mb-1">购票数量: ${ticket.quantity}</p>
            <p class="mb-1">总价: $${ticket.totalPrice.toFixed(2)}</p>
            <p class="mb-1">区域: ${ticket.area}</p>
        </div>
    `).join('');
}

// 检查登录状态并加载票务历史
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
    } else {
        fetchTicketHistory();
    }
}); 