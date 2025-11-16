document.addEventListener('DOMContentLoaded', async () => {
    // Get the logged-in user's email from session storage
    const loggedInEmail = sessionStorage.getItem('loggedInEmail');

    if (!loggedInEmail) {
        alert('Please log in to view your profile.');
        window.top.location.href = 'index.html'; // Redirect to the login page in the content frame if not logged in
    } else {
        try {
            // Retrieve user data from database
            const response = await fetch(`https://bunny-blooddonation.onrender.com/api/user/${loggedInEmail}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userDetails = await response.json();
            
            // Populate the profile details
            document.getElementById('userEmail').textContent = loggedInEmail;

            // Load profile picture if available, otherwise use a default
            const profilePicElement = document.querySelector('.profile-pic');
            if (userDetails.profilePic) {
                profilePicElement.style.backgroundImage = `url(${userDetails.profilePic})`;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('No profile found. Please update your profile.');
        }
    }

    // Show the form for editing profile when clicking the profile picture or name
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
        profileSection.addEventListener('click', () => {
            window.parent.contentFrame.location.href = 'update-profile.html'; // Navigate to the profile page in the content frame
        });
    }

    // Handle logout functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', async () => {
        const loggedInEmail = sessionStorage.getItem('loggedInEmail');
        
        if (loggedInEmail) {
            try {
                await fetch('https://bunny-blooddonation.onrender.com/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: loggedInEmail }),
                });
            } catch (error) {
                console.error('Error during logout:', error);
            }
        }

        sessionStorage.removeItem('loggedInEmail'); // Remove user's email from session storage
        alert('You have been logged out.');

        // Redirect to index.html
        window.top.location.href = 'index.html'; // Redirect the top-level window to index.html
    });
});

