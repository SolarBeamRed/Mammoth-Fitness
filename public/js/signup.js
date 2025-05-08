const showNotification = (message, isSuccess) => {

    const existingNotifications = document.querySelectorAll('.notification-card');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification-card ${isSuccess ? 'success' : 'error'}`;
    notification.innerHTML = `
        <div class="notification-content">
            <img src="images/dumbbell-solid.svg" class="notification-icon">
            <p class="notification-text">${message}</p>
        </div>
        <div class="notification-progress"></div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.6s forwards';
        setTimeout(() => notification.remove(), 600);
    }, 3000);
};

// Show loader on page load
window.addEventListener('load', () => {
    document.querySelector('.loader').style.display = 'none';
});

// Sending req to backend
document.getElementById('signUpForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.querySelector('.loader').style.display = 'flex';
    
    try {
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        const res = await fetch('/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await res.text();
        showNotification(result, res.ok);
        
        if (res.ok) {
            showNotification("Signup successful! Redirecting...", true);
            document.getElementById('signUpForm').reset();
            // Add redirect after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
    }
    
    } catch (error) {
        showNotification('Connection Error', false);
    } finally {
        document.querySelector('.loader').style.display = 'none';
    }
});