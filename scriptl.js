// Form validation for login
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Retrieve stored data from local storage
    const storedData = localStorage.getItem(email);

    if (storedData) {
        const userDetails = JSON.parse(storedData);
        // Check if the password matches
        if (userDetails.password === password) {
            localStorage.setItem('loggedInEmail', email); // Save email for future reference
            alert('Login successful! Redirecting to the portal.');
            window.location.href = 'portal.html'; // Redirect to the main portal page
        } else {
            alert('Incorrect password. Please try again.');
        }
    } else {
        alert('No account found with this email. Please sign up.');
        window.location.href = 'signup.html'; // Redirect to signup page
    }
});
