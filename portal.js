document.addEventListener('DOMContentLoaded', () => {
    // Get the logged-in user's email from local storage
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    if (!loggedInEmail) {
        alert('Please log in to view your profile.');
        window.top.location.href = 'index.html'; // Redirect to the login page in the content frame if not logged in
    } else {
        // Retrieve stored data from local storage using the email as the key
        const storedData = localStorage.getItem(loggedInEmail);

        if (storedData) {
            const userDetails = JSON.parse(storedData);
            
            // Populate the profile details
            document.getElementById('userEmail').textContent = loggedInEmail;

            // Load profile picture if available, otherwise use a default
            const profilePicElement = document.querySelector('.profile-pic');
            if (userDetails.profilePic) {
                profilePicElement.style.backgroundImage = `url(${userDetails.profilePic})`;
            }
        } else {
            alert('No profile found. Please update your profile.');
        }
    }

    // Show the form for editing profile when clicking the profile picture or name
    const profileSection = document.querySelector('.profile-section');
    profileSection.addEventListener('click', () => {
        parent.contentFrame.location.href = 'update-profile.html'; // Navigate to the profile page in the content frame
    });

    // Handle logout functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('loggedInEmail'); // Remove user's email from local storage
        // Additionally, remove any other user-related data if necessary
        alert('You have been logged out.');

        // Replace the entire frameset with index.html
        window.top.location.href = 'index.html'; // Redirect the top-level window to index.html
    });
});
