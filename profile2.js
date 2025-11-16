document.addEventListener('DOMContentLoaded', async function () {
    // Get email parameter from the URL
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    const loggedInEmail = sessionStorage.getItem('loggedInEmail');

    if (email) {
        await displayProfile(email);
        await checkApplicationStatus(email);

        // If viewing own profile, show applications received
        if (email === loggedInEmail) {
            await displayApplicants(email);
        }

        // Add event listener for the Apply button
        const applyButton = document.getElementById('applyButton');
        if (applyButton) {
            // Hide Apply button if viewing own profile
            if (email === loggedInEmail) {
                applyButton.style.display = 'none';
            } else {
                applyButton.addEventListener('click', function () {
                    sendApplication(email);
                });
            }
        }
    } else {
        console.error('Email parameter not found in URL.');
    }
});

// Function to display the donor's profile
async function displayProfile(email) {
    try {
        const response = await fetch(`http://bunny-blooddonation.onrender.com/api/user/${email}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const data = await response.json();

        // Display data in the profile
        document.getElementById('name').textContent = data.name || 'N/A';
        document.getElementById('age').textContent = data.age || 'N/A';
        document.getElementById('qualifications').textContent = data.qualifications || 'N/A';
        document.getElementById('bloodGroup').textContent = data.bloodGroup || 'N/A';
        document.getElementById('phoneNumber').textContent = data.phoneNumber || 'N/A';
        document.getElementById('address').textContent = data.address || 'N/A';
        document.getElementById('emergencyContact').textContent = data.emergencyContact || 'N/A';
        document.getElementById('occupation').textContent = data.occupation || 'N/A';
        document.getElementById('donationType').textContent = data.donationType || 'N/A';
        document.getElementById('lastDonationDate').textContent = data.lastDonationDate || 'N/A';
        document.getElementById('healthConditions').textContent = data.healthConditions || 'N/A';
        document.getElementById('medicalHistory').textContent = data.medicalHistory || 'N/A';
        document.getElementById('allergies').textContent = data.allergies || 'N/A';

        // Display profile picture if available
        const profilePic = document.getElementById('profilePic');
        if (data.profilePic) {
            profilePic.src = data.profilePic;
        } else {
            profilePic.alt = "No profile picture available";
        }
    } catch (error) {
        console.error(`Error retrieving profile data for ${email}:`, error);
        document.getElementById('profile').textContent = 'Profile not found or data is invalid.';
    }
}

// Function to check application status and update button
async function checkApplicationStatus(donorEmail) {
    const requesterEmail = sessionStorage.getItem('loggedInEmail');
    if (!requesterEmail) {
        return;
    }

    try {
        const response = await fetch(`http://bunny-blooddonation.onrender.com/api/application-status/${donorEmail}/${requesterEmail}`);
        
        if (!response.ok) {
            return;
        }

        const data = await response.json();
        const applyButton = document.getElementById('applyButton');
        
        if (data.exists && applyButton) {
            // Application exists, change button to "Submitted" and disable it
            applyButton.textContent = 'Submitted';
            applyButton.disabled = true;
            applyButton.style.opacity = '0.6';
            applyButton.style.cursor = 'not-allowed';
            
            // Show status if available
            if (data.application) {
                const status = data.application.status;
                if (status === 'accepted') {
                    applyButton.textContent = 'Accepted';
                } else if (status === 'denied') {
                    applyButton.textContent = 'Denied';
                }
            }
        }
    } catch (error) {
        console.error('Error checking application status:', error);
    }
}

// Function to display applicants (for donor viewing their own profile)
async function displayApplicants(donorEmail) {
    try {
        const response = await fetch(`http://bunny-blooddonation.onrender.com/api/applications/${encodeURIComponent(donorEmail)}`);
        
        if (!response.ok) {
            console.error('Failed to fetch applicants');
            return;
        }

        const applications = await response.json();
        const applicantsSection = document.getElementById('applicantsSection');
        const applicantsList = document.getElementById('applicantsList');

        if (!applications || applications.length === 0) {
            applicantsSection.style.display = 'block';
            applicantsList.innerHTML = '<p>No pending applications at the moment.</p>';
            return;
        }

        applicantsSection.style.display = 'block';
        applicantsList.innerHTML = '';

        applications.forEach(application => {
            const appDiv = document.createElement('div');
            appDiv.style.border = '1px solid #ddd';
            appDiv.style.padding = '10px';
            appDiv.style.margin = '10px 0';
            appDiv.style.borderRadius = '5px';
            appDiv.innerHTML = `
                <p><strong>Requester Name:</strong> ${application.requester_name || application.requester_email || 'N/A'}</p>
                <p><strong>Requester Email:</strong> ${application.requester_email || 'N/A'}</p>
                <p><strong>Quantity Needed:</strong> ${application.quantity || 'N/A'} units</p>
                <p><strong>Situation:</strong> ${application.situation || 'N/A'}</p>
                <p><strong>Applied On:</strong> ${application.created_at ? new Date(application.created_at).toLocaleString() : 'N/A'}</p>
                <div style="margin-top: 10px;">
                    <button onclick="acceptApplicationFromProfile(${application.id})" style="margin-right: 5px; padding: 5px 10px; background-color: #4caf50; color: white; border: none; border-radius: 3px; cursor: pointer;">Accept</button>
                    <button onclick="denyApplicationFromProfile(${application.id})" style="padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Deny</button>
                </div>
            `;
            applicantsList.appendChild(appDiv);
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
    }
}

// Functions to handle accept/deny from profile page
async function acceptApplicationFromProfile(applicationId) {
    try {
        const response = await fetch(`http://bunny-blooddonation.onrender.com/api/application/${applicationId}`, {
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
        // Reload the page to refresh the applicants list
        window.location.reload();
    } catch (error) {
        console.error(`Error accepting application ${applicationId}:`, error);
        alert('An error occurred. Please try again.');
    }
}

async function denyApplicationFromProfile(applicationId) {
    try {
        const response = await fetch(`http://bunny-blooddonation.onrender.com/api/application/${applicationId}`, {
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
        // Reload the page to refresh the applicants list
        window.location.reload();
    } catch (error) {
        console.error(`Error denying application ${applicationId}:`, error);
        alert('An error occurred. Please try again.');
    }
}

// Function to send an application for blood donation
async function sendApplication(email) {
    const requesterEmail = sessionStorage.getItem('loggedInEmail');
    if (!requesterEmail) {
        alert('Please log in to send an application.');
        return;
    }

    // Prompt for quantity of blood needed and situation explanation
    const quantity = prompt("Enter the quantity of blood needed (in units):");
    if (!quantity) {
        return;
    }

    const situation = prompt("Briefly explain the situation:");
    if (!situation) {
        return;
    }

    try {
        alert('Sending your application...');

        const response = await fetch('http://bunny-blooddonation.onrender.com/api/application', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                donor_email: email,
                requester_email: requesterEmail,
                quantity: parseInt(quantity),
                situation: situation
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to send application. Please try again.');
            return;
        }

        alert('Your application has been sent successfully.');
        
        // Update button to "Submitted"
        const applyButton = document.getElementById('applyButton');
        if (applyButton) {
            applyButton.textContent = 'Submitted';
            applyButton.disabled = true;
            applyButton.style.opacity = '0.6';
            applyButton.style.cursor = 'not-allowed';
        }
    } catch (error) {
        console.error(`Error sending application for ${email}:`, error);
        alert('An error occurred. Please try again.');
    }
}

