document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch('/api/user');
        if (!res.ok) throw new Error('Not logged in');

        const user = await res.json();

        //Replacing placeholer username with actual username
        document.querySelectorAll('.username').forEach(el => {
            el.textContent = user.username;
        });
    } catch(err) {
        console.error(err);
        window.location.href = '../login.html';
    }
});