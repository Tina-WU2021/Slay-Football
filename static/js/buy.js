document.addEventListener('DOMContentLoaded', async function() {
    // 检查用户是否登录
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/auth-login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    
    if (!eventId) {
        alert('Invalid event');
        window.location.href = '/index.html';
        return;
    }

    // 加载事件详情
    try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
            throw new Error('Event not found');
        }

        const event = await response.json();
        updateEventDetails(event);
        setupAreaSelection(event.areas);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load event details');
        window.location.href = '/index.html';
    }
});

// 更新事件详情
function updateEventDetails(event) {
    // 更新标题
    document.querySelector('h2').textContent = event.title;
    
    // 格式化日期和时间
    const eventDate = new Date(event.eventTime);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'CET'
    });

    // 更新比赛详情
    const matchDetails = document.querySelector('.col-md-5');
    const paragraphs = matchDetails.querySelectorAll('p');
    paragraphs[0].textContent = `Date: ${formattedDate}`;
    paragraphs[1].textContent = `Venue: ${event.venue}`;
    paragraphs[2].textContent = `Kick-off: ${formattedTime} CET`;

    // 更新页面标题
    document.title = `Ticket Booking - ${event.title}`;
    
    // 更新比赛图片（如果有）
    const matchImage = matchDetails.querySelector('img');
    if (event.image) {
        matchImage.src = event.image;
        matchImage.alt = event.title;
    }
}

// 设置区域选择
function setupAreaSelection(areas) {
    const ticketType = document.getElementById('ticket-type');
    const seatingAreas = document.querySelector('.seating-areas');
    
    // 清空现有选项
    ticketType.innerHTML = '<option value="default" selected>---Please Select---</option>';
    seatingAreas.innerHTML = '';

    // 添加区域选项
    areas.forEach(area => {
        // 添加下拉选项
        const option = document.createElement('option');
        option.value = area.price;
        option.textContent = `${area.name} - $${area.price} (${area.available} seats available)`;
        ticketType.appendChild(option);

        // 添加区域显示框
        const areaBox = document.createElement('div');
        areaBox.className = 'area-box';
        areaBox.dataset.areaId = area.id;
        areaBox.dataset.price = area.price;
        areaBox.style.backgroundColor = getAreaColor(area.id);
        
        areaBox.innerHTML = `
            <div class="area-label">${area.name}</div>
            <div class="price-label">$${area.price}</div>
            <div class="available-label">${area.available} seats</div>
        `;

        // 如果没有可用座位，禁用选择
        if (area.available <= 0) {
            areaBox.classList.add('disabled');
            areaBox.style.opacity = '0.5';
        } else {
            areaBox.addEventListener('click', () => selectArea(areaBox, area));
        }

        seatingAreas.appendChild(areaBox);
    });
}

// 区域颜色映射
function getAreaColor(areaId) {
    const colors = {
        'A': '#4CAF50',
        'B': '#2196F3',
        'C': '#9C27B0',
        'D': '#FFC107'
    };
    return colors[areaId] || '#999999';
}

// 选择区域
function selectArea(areaBox, area) {
    // 移除其他区域的选中状态
    document.querySelectorAll('.area-box').forEach(box => box.classList.remove('selected'));
    
    // 选中当前区域
    areaBox.classList.add('selected');
    
    // 更新选择框和显示
    document.getElementById('ticket-type').value = area.price;
    document.getElementById('selected-area').textContent = `Selected Area: ${area.name}`;
    
    // 更新数量限制（VIP区域限制为1张票）
    const quantity = document.getElementById('ticket-quantity');
    if (area.id === 'D') { // VIP区域
        quantity.value = '1';
        quantity.setAttribute('readonly', true);
    } else {
        quantity.removeAttribute('readonly');
    }
    
    updateTotalPrice();
}

// 更新总价
function updateTotalPrice() {
    const quantity = parseInt(document.getElementById('ticket-quantity').value);
    const price = parseFloat(document.getElementById('ticket-type').value) || 0;
    document.getElementById('total-price').textContent = `$${(quantity * price).toFixed(2)}`;
}

// 首先在 buy.html 中添加模态框 HTML
document.body.insertAdjacentHTML('beforeend', `
<div class="modal fade" id="paymentModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Payment Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="payment-form">
          <div class="mb-3">
            <label class="form-label">Card Number</label>
            <input type="text" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19">
          </div>
          <div class="row mb-3">
            <div class="col">
              <label class="form-label">Expiry Date</label>
              <input type="text" class="form-control" placeholder="MM/YY" maxlength="5">
            </div>
            <div class="col">
              <label class="form-label">CVV</label>
              <input type="text" class="form-control" placeholder="123" maxlength="3">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Cardholder Name</label>
            <input type="text" class="form-control" placeholder="JOHN DOE">
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary" id="confirm-payment">Confirm Payment</button>
      </div>
    </div>
  </div>
</div>
`);

// 修改购票处理函数
document.getElementById('book-tickets').addEventListener('click', async () => {
    const selectedArea = document.querySelector('.area-box.selected');
    if (!selectedArea) {
        alert('Please select a seating area');
        return;
    }

    // 获取用户信息
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    if (!username || !userRole) {
        alert('Please login first');
        window.location.href = '/auth-login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const quantity = parseInt(document.getElementById('ticket-quantity').value);
    const ticketType = selectedArea.querySelector('.area-label').textContent;
    const totalPrice = parseFloat(document.getElementById('total-price').textContent.replace('$', ''));

    try {
        // 首先检查座位是否还可用
        const checkResponse = await fetch(`/api/events/${eventId}`);
        if (!checkResponse.ok) {
            throw new Error('Failed to check seat availability');
        }
        const event = await checkResponse.json();
        const selectedAreaInfo = event.areas.find(a => a.name === ticketType);

        if (!selectedAreaInfo || selectedAreaInfo.available < quantity) {
            alert('Sorry, not enough seats available in this area');
            return;
        }

        // 显示支付模态框
        const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
        paymentModal.show();

        // 处理支付确认
        document.getElementById('confirm-payment').onclick = async () => {
            paymentModal.hide();
            
            // 显示加载状态
            const loadingModal = showLoadingModal('Processing payment...');

            try {
                // 创建票务记录
                const response = await fetch('/api/tickets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        eventId,
                        username,
                        userRole,
                        quantity,
                        ticketType,
                        totalPrice,
                        seatNumbers: []
                    })
                });

                if (!response.ok) {
                    throw new Error((await response.json()).message || 'Failed to book tickets');
                }

                // 更新区域可用座位数
                const updateResponse = await fetch(`/api/events/${eventId}/areas/${selectedAreaInfo.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        available: selectedAreaInfo.available - quantity
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update seat availability');
                }

                loadingModal.hide();
                alert('Payment successful! Tickets booked.');
                window.location.href = '/ticketHistory.html';
            } catch (error) {
                loadingModal.hide();
                console.error('Error:', error);
                alert(error.message || 'Failed to process payment. Please try again.');
            }
        };
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to book tickets. Please try again.');
    }
});

// 辅助函数：显示加载状态模态框
function showLoadingModal(message) {
    const modalHtml = `
        <div class="modal fade" id="loadingModal" data-bs-backdrop="static" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mb-0">${message}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
    modal.show();
    return modal;
} 