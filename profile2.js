document.addEventListener('DOMContentLoaded', function () {
    // Get email parameter from the URL
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (email) {
        displayProfile(email);

        // Check if the user has already applied to this donor
        if (isAlreadyApplied(email)) {
            document.getElementById('applyButton').disabled = true;
            document.getElementById('applyButton').textContent = 'Already Applied';
            displayResultMessage();
        } else {
            // Add event listener for the Apply button to open the dialog
            document.getElementById('applyButton').addEventListener('click', function () {
                document.getElementById('applicationDialog').showModal();
            });

            // Add event listener for submitting the dialog form
            document.getElementById('submitApplication').addEventListener('click', function (event) {
                event.preventDefault();
                sendApplication(email);
            });

            // Add event listener for canceling the dialog
            document.getElementById('cancelApplication').addEventListener('click', function () {
                document.getElementById('applicationDialog').close();
            });
        }
    } else {
        console.error('Email parameter not found in URL.');
    }
});

// Function to display the donor's profile
function displayProfile(email) {
    try {
        const data = JSON.parse(localStorage.getItem(email));

        // Check if data exists
        if (!data) {
            throw new Error('No data found for this email');
        }

        // Display data in the profile
        document.getElementById('name').textContent = data.name;
        document.getElementById('age').textContent = data.age;
        document.getElementById('qualifications').textContent = data.qualifications;
        document.getElementById('bloodGroup').textContent = data.bloodGroup;
        document.getElementById('phoneNumber').textContent = data.phoneNumber;
        document.getElementById('address').textContent = data.address;
        document.getElementById('emergencyContact').textContent = data.emergencyContact;
        document.getElementById('occupation').textContent = data.occupation;
        document.getElementById('donationType').textContent = data.donationType;
        document.getElementById('lastDonationDate').textContent = data.lastDonationDate;
        document.getElementById('healthConditions').textContent = data.healthConditions;
        document.getElementById('medicalHistory').textContent = data.medicalHistory;
        document.getElementById('allergies').textContent = data.allergies;

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

// Function to send an application for blood donation
function sendApplication(email) {
    try {
        const quantity = document.getElementById('quantity').value;
        const situation = document.getElementById('situation').value;

        // Check if user provided the required information
        if (quantity && situation) {
            // Create an application object with relevant details
            const application = {
                donor: email,
                quantity: quantity,
                requester: localStorage.getItem("loggedInEmail"),
                situation: situation,
                status: 'pending'
            };

            // Save the application in localStorage with a unique key
            const applicationKey = `application_${email}_${localStorage.getItem("loggedInEmail")}`;
            localStorage.setItem(applicationKey, JSON.stringify(application));

            // Disable the apply button after applying
            document.getElementById('applyButton').disabled = true;
            document.getElementById('applyButton').textContent = 'Already Applied';
            displayResultMessage();

            console.log('Application details:', application);
            alert('Your application has been sent successfully.');

            // Redirect to listofholders.html after successful application
            window.location.href = 'listofholders.html';
        } else {
            alert('Please provide both quantity and a brief situation explanation for your application.');
        }

        // Close the dialog after submission
        document.getElementById('applicationDialog').close();
    } catch (error) {
        console.error(`Error sending application for ${email}:`, error);
    }
}

// Function to check if the user has already applied to this donor
function isAlreadyApplied(email) {
    const applicationKey = `application_${email}_${localStorage.getItem("loggedInEmail")}`;
    return localStorage.getItem(applicationKey) !== null;
}

// Function to display a message after applying
function displayResultMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.style.color = 'green';
    messageDiv.style.marginTop = '2px';
    messageDiv.textContent = 'Your application has been submitted. Please check your email for further updates.\n ' +
        '\nThe response time may vary, so make sure to monitor your inbox for any new information.';
    document.getElementById('applicationStatus').appendChild(messageDiv);
}
