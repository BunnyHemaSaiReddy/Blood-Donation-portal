// Function to create and store a new request
function createRequest(email, quantity, situation, message) {
    const requestId = `application_${Date.now()}`; // Unique key based on timestamp
    const requestData = {
        donor: email,
        quantity: quantity,
        situation: situation,
        message: message,
        status: 'pending'
    };
    localStorage.setItem(requestId, JSON.stringify(requestData));
    displayMessage('Request has been created successfully.');
}

// Function to display requests for a specific donor after login
function displayRequestsForDonor(email) {
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = ''; // Clear previous results

    // Retrieve all keys from localStorage and filter for this donor's requests
    for (const key in localStorage) {
        if (key.startsWith('application_')) { // Only handle application entries
            try {
                const requestData = JSON.parse(localStorage.getItem(key));
                function getPhoneNumberByEmail(email) {
                    const donorData = localStorage.getItem(email);
                    if (donorData) {
                        const data = JSON.parse(donorData);
                        return data.phoneNumber || 'Phone number not available'; // Return phone number or a default message
                    }
                    return 'Phone number not found';
                }
                
                // Get the phone number based on the requester's email
                const requesterPhoneNumber = getPhoneNumberByEmail(requestData.requester);
                // Check if the request belongs to the donor's email
                if (requestData && requestData.donor === email) {
                    const requestDiv = document.createElement('div');
                    requestDiv.classList.add('request');
                    requestDiv.innerHTML = `
                        <p><strong>Blood Quantity Needed:</strong> ${requestData.quantity} units</p>
                        <p><strong>Situation:</strong> ${requestData.situation}</p>
                        <p><strong>Requester Phone:</strong> ${requesterPhoneNumber}</p>
                        <p><strong>Requester Mail:</strong> ${requestData.requester}</p>
                        <p><strong>Status:</strong> ${requestData.status}</p>
                        <div class="request-actions" id="actions-${key}">
                            <button id="accept-${key}" onclick="acceptRequest('${key}', '${email}', '${requestData.donor}')">Accept</button>
                            <button id="deny-${key}" onclick="denyRequest('${key}', '${email}', '${requestData.donor}')">Deny</button>
                        </div>
                    `;
                    requestsList.appendChild(requestDiv);
                }
            } catch (error) {
                console.error(`Error parsing request data for key ${key}:`, error);
            }
        }
    }

    // Check if there are no requests
    if (requestsList.innerHTML === '') {
        requestsList.innerHTML = `<p>No requests found for ${email}.</p>`;
    }
}

// Function to accept a request and send email to donor
function acceptRequest(key, donorEmail, donorName) {
    try {
        const requestData = JSON.parse(localStorage.getItem(key));
        requestData.status = 'accepted';
        localStorage.setItem(key, JSON.stringify(requestData));

        displayMessage(`Request from ${donorName} has been accepted.`);

        // Hide the accept and deny buttons after acceptance and change button text
        document.getElementById(`actions-${key}`).style.display = 'none';
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Request Accepted';
        acceptButton.className = 'updated-button accepted'; // Optional: Add a class for styling
        document.getElementById(`actions-${key}`).parentElement.appendChild(acceptButton);

        sendEmailToDonor(donorEmail, requestData, 'accepted');  // Send email after accepting the request

        displayRequestsForDonor(donorEmail); // Refresh the request list
    } catch (error) {
        console.error(`Error accepting request for ${key}:`, error);
        displayMessage('Error accepting request. Please try again.', true);
    }
}

// Function to deny a request and send email to donor
function denyRequest(key, donorEmail, donorName) {
    try {
        const requestData = JSON.parse(localStorage.getItem(key));
        requestData.status = 'denied';
        localStorage.setItem(key, JSON.stringify(requestData));

        displayMessage(`Request from ${donorName} has been denied.`);

        // Hide the accept and deny buttons after denial and change button text
        document.getElementById(`actions-${key}`).style.display = 'none';
        const denyButton = document.createElement('button');
        denyButton.textContent = 'Request Denied';
        denyButton.className = 'updated-button denied'; // Optional: Add a class for styling
        document.getElementById(`actions-${key}`).parentElement.appendChild(denyButton);
        sendEmailToDonor(donorEmail, requestData, 'denied');  // Send email after denying the request

        displayRequestsForDonor(donorEmail); // Refresh the request list
    } catch (error) {
        console.error(`Error denying request for ${key}:`, error);
        displayMessage('Error denying request. Please try again.', true);
    }
}

// Function to send an email to the donor with request details
function sendEmailToDonor(donorEmail, requestData, status) {
    // Prepare the data to send
    const emailData = {
        donorEmail: donorEmail,
        requestData: requestData,
        status: status
    };

    // Send a POST request to the server
    fetch('http://localhost:3000/send-donor-email', {
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
    messageDiv.innerHTML = message;
    messageDiv.className = isError ? 'error' : 'success';
    messageDiv.style.display = 'block';
}

// Automatically run when the page loads
window.onload = function() {
    const loggedInEmail = localStorage.getItem('loggedInEmail');

    if (!loggedInEmail) {
        displayMessage('No logged-in email found. Please log in first.', true);
        return;
    }

    // Compare the logged-in email with the stored one
    if (loggedInEmail === 'bunnyhemasaireddy@gmail.com') {
        displayMessage('Welcome, Hemasai! You have special access.', false);
        displayRequestsForDonor(loggedInEmail);
    } else {
        displayRequestsForDonor(loggedInEmail);
    }
};
