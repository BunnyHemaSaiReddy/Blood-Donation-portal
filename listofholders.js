document.addEventListener('DOMContentLoaded', function () {
    displayDonors();

    // Add event listeners for search button and Enter key press
    document.getElementById('searchButton').addEventListener('click', displayDonors);
    document.getElementById('search').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            displayDonors();
        }
    });
});

// Function to display donors based on search
async function displayDonors() {
    const bloodGroup = document.getElementById('search').value.trim().toUpperCase(); // Convert to uppercase for case-insensitive comparison
    const donorList = document.getElementById('donorList');
    donorList.innerHTML = ''; // Clear previous results

    const loggedInEmail = sessionStorage.getItem('loggedInEmail');

    try {
        // Fetch donors
        const url = bloodGroup ? 
            `https://bunny-blooddonation.onrender.com/api/donors?bloodGroup=${encodeURIComponent(bloodGroup)}` :
            'https://bunny-blooddonation.onrender.com/api/donors';
        
        const donorsResponse = await fetch(url);
        
        if (!donorsResponse.ok) {
            throw new Error('Failed to fetch donors');
        }

        const donors = await donorsResponse.json();

        // Fetch application status for the logged-in user
        let applicationStatusMap = {};
        if (loggedInEmail) {
            try {
                const statusResponse = await fetch(`https://bunny-blooddonation.onrender.com/api/applications-status/${loggedInEmail}`);
                if (statusResponse.ok) {
                    applicationStatusMap = await statusResponse.json();
                }
            } catch (error) {
                console.error('Error fetching application status:', error);
            }
        }

        // Filter out the logged-in user and display donors
        donors.forEach(donor => {
            if (donor.email !== loggedInEmail && donor.bloodGroup) {
                const applicationStatus = applicationStatusMap[donor.email];
                let statusText = '';
                let statusClass = '';
                
                if (applicationStatus) {
                    const status = applicationStatus.status;
                    if (status === 'pending') {
                        statusText = 'Applied';
                        statusClass = 'status-applied';
                    } else if (status === 'accepted') {
                        statusText = 'Accepted';
                        statusClass = 'status-accepted';
                    } else if (status === 'denied') {
                        statusText = 'Denied';
                        statusClass = 'status-denied';
                    }
                }

                const donorDiv = document.createElement('div');
                donorDiv.classList.add('donor');
                donorDiv.innerHTML = `
                    <strong>Name:</strong> ${donor.name || 'N/A'} <br>
                    <strong>Blood Group:</strong> ${donor.bloodGroup} <br>
                    <strong>Address:</strong> ${donor.address || 'N/A'} <br>
                    <strong>Age:</strong> ${donor.age || 'N/A'} <br>
                    ${statusText ? `<strong class="${statusClass}">Status: ${statusText}</strong> <br>` : ''}
                    <button onclick="viewProfile('${donor.email}')">See Profile</button>
                `;
                donorList.appendChild(donorDiv);
            }
        });
    } catch (error) {
        console.error('Error fetching donors:', error);
        donorList.innerHTML = '<p>Error loading donors. Please try again.</p>';
    }
}

// Function to validate email format
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Function to view profile
function viewProfile(email) {
    // Redirect to profile2.html with the email as a query parameter
    window.location.href = `profile2.html?email=${encodeURIComponent(email)}`;
}


