function handleLogin(event) {
    // 1. Stop the page from refreshing
    event.preventDefault(); 
    
    // 2. Grab what the user typed into the inputs
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 3. Check if it is the Admin
    if (email === 'admin@eventura.com' && password === 'admin123') {
        
        // Give them the secret "admin" key in their browser storage
        localStorage.setItem('currentUser', JSON.stringify({
            firstName: 'Eventura',
            lastName: 'Admin',
            email: 'admin@eventura.com',
            role: 'admin' // <-- The Admin Panel looks for this exactly!
        }));
        
        // Send them to the Admin Panel
        window.location.href = 'admin.html';
        return;
    } 
    // 4. (Optional) Check for normal users here later
    else {
        alert("Invalid email or password. Please try again.");
    }
}