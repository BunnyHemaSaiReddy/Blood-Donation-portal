document.addEventListener('DOMContentLoaded', function () {
    displayApplications();
});

// Function to display applications from requesters
async function displayApplications() {
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = ''; // Clear previous results

    const loggedInEmail = sessionStorage.getItem('loggedInEmail');
    if (!loggedInEmail) {
        requestsList.innerHTML = '<p>Please log in to view applications.</p>';
        return;
    }

    try {
        console.log('Fetching applications for donor:', loggedInEmail);
        const response = await fetch(`http://localhost:3000/api/applications/${encodeURIComponent(loggedInEmail)}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Error response:', errorData);
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch applications`);
        }

        const applications = await response.json();
        console.log('Applications received:', applications);

        if (!Array.isArray(applications)) {
            console.error('Invalid response format:', applications);
            requestsList.innerHTML = '<p>Error: Invalid response from server.</p>';
            return;
        }

        if (applications.length === 0) {
            requestsList.innerHTML = '<p>No pending applications at the moment.</p>';
            return;
        }

        // Display all pending applications
        applications.forEach(application => {
            const requestDiv = document.createElement('div');
            requestDiv.classList.add('request');
            requestDiv.innerHTML = `
                <p><strong>Requester Name:</strong> ${application.requester_name || application.requester_email || 'N/A'}</p>
                <p><strong>Requester Email:</strong> ${application.requester_email || 'N/A'}</p>
                <p><strong>Quantity Needed:</strong> ${application.quantity || 'N/A'} units</p>
                <p><strong>Situation:</strong> ${application.situation || 'N/A'}</p>
                <p><strong>Applied On:</strong> ${application.created_at ? new Date(application.created_at).toLocaleString() : 'N/A'}</p>
                <div class="request-actions">
                    <button onclick="acceptApplication(${application.id})">Accept</button>
                    <button onclick="denyApplication(${application.id})">Deny</button>
                </div>
            `;
            requestsList.appendChild(requestDiv);
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        requestsList.innerHTML = `<p>Error loading applications: ${error.message}. Please check the console for details.</p>`;
    }
}

// Function to validate email format
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Function to accept an application
async function acceptApplication(applicationId) {
    try {
        const response = await fetch(`http://localhost:3000/api/application/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'accepted' }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to accept application');
            return;
        }

        alert('Application has been accepted and email sent to requester.');
        displayApplications(); // Refresh the applications list
    } catch (error) {
        console.error(`Error accepting application ${applicationId}:`, error);
        alert('An error occurred. Please try again.');
    }
}

// Function to deny an application
async function denyApplication(applicationId) {
    try {
        const response = await fetch(`http://localhost:3000/api/application/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'denied' }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to deny application');
            return;
        }

        alert('Application has been denied and email sent to requester.');
        displayApplications(); // Refresh the applications list
    } catch (error) {
        console.error(`Error denying application ${applicationId}:`, error);
        alert('An error occurred. Please try again.');
    }
}
