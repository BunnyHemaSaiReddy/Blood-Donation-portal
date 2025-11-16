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
        const response = await fetch(`https://bunny-blooddonation.onrender.com/api/applications/${encodeURIComponent(loggedInEmail)}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            console.error('Error response:', errorData);
            throw new Error(errorData.message || `httpss ${response.status}: Failed to fetch applications`);
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
        // First get application details
        const appResponse = await fetch(`https://bunny-blooddonation.onrender.com/api/application/${applicationId}`);
        if (!appResponse.ok) {
            throw new Error('Failed to fetch application details');
        }
        const application = await appResponse.json();

        // Update status
        const response = await fetch(`https://bunny-blooddonation.onrender.com/api/application/${applicationId}`, {
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

        // Send email to donor and receiver
        const requestData = {
            requester: application.requester_name || application.requester_email,
            requesterEmail: application.requester_email,
            quantity: application.quantity,
            situation: application.situation
        };
        await sendEmailToDonor(application.donor_email, requestData, 'accepted');

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
        // First get application details
        const appResponse = await fetch(`https://bunny-blooddonation.onrender.com/api/application/${applicationId}`);
        if (!appResponse.ok) {
            throw new Error('Failed to fetch application details');
        }
        const application = await appResponse.json();

        // Update status
        const response = await fetch(`https://bunny-blooddonation.onrender.com/api/application/${applicationId}`, {
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

        // Send email to donor and receiver
        const requestData = {
            requester: application.requester_name || application.requester_email,
            quantity: application.quantity,
            situation: application.situation
        };
        await sendEmailToDonor(application.donor_email, requestData, 'denied');

        alert('Application has been denied and email sent to requester.');
        displayApplications(); // Refresh the applications list
    } catch (error) {
        console.error(`Error denying application ${applicationId}:`, error);
        alert('An error occurred. Please try again.');
    }
}

// Function to send email to donor
function sendEmailToDonor(donorEmail, requestData, status) {
    // Prepare the data to send
    const emailData = {
        donorEmail: donorEmail,
        requestData: requestData,
        status: status
    };

    // Send a POST request to the server
    fetch('https://bunny-blooddonation.onrender.com/send-donor-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message); // Handle success message
        alert(`Email sent to ${donorEmail} successfully!`); // Display success alert
    })
    .catch(error => {
        console.error('Error sending email:', error);
        alert('Failed to send email.'); // Display error alert
    });
}

// Function to display messages to the user
function displayMessage(message, isError = false) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = message;
        messageDiv.className = isError ? 'error' : 'success';
        messageDiv.style.display = 'block';
    }
}

// Automatically run when the page loads
window.onload = function() {
    const loggedInEmail = sessionStorage.getItem('loggedInEmail');

    if (!loggedInEmail) {
        displayMessage('No logged-in email found. Please log in first.', true);
        return;
    }
}

