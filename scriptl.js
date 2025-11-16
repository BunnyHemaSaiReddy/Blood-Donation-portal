// Form validation for login
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://bunny-blooddonation.onrender.com/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                alert('No account found with this email. Please sign up.');
                window.location.href = 'signup.html'; // Redirect to signup page
            } else {
                alert(data.message || 'Login failed. Please try again.');
            }
            return;
        }

        // Store email in sessionStorage for client-side reference
        sessionStorage.setItem('loggedInEmail', email);
        alert('Login successful! Redirecting to the portal.');
        window.location.href = 'portal.html'; // Redirect to the main portal page
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
});


