document.addEventListener('DOMContentLoaded', () => {
    const profileDetails = document.getElementById('profileDetails');
    const profileForm = document.getElementById('profileForm');
    const editProfileButton = document.getElementById('editProfileButton');
    const profilePic = document.getElementById('profilePic');
    const profilePicInput = document.getElementById('profilePicInput');

    const loggedInEmail = localStorage.getItem('loggedInEmail') || 'user@example.com';
    const storedData = JSON.parse(localStorage.getItem(loggedInEmail));

    // Show profile details if data exists, otherwise show the form
    if (storedData) {
        document.getElementById('userEmailDisplay').textContent = loggedInEmail;
        document.getElementById('userNameDisplay').textContent = `Name: ${storedData.name || loggedInEmail}`;
        document.getElementById('userAgeDisplay').textContent = storedData.age || 'N/A';
        document.getElementById('userQualificationsDisplay').textContent = storedData.qualifications || 'N/A';
        document.getElementById('userBloodGroupDisplay').textContent = storedData.bloodGroup || 'N/A';
        document.getElementById('userPhoneNumberDisplay').textContent = storedData.phoneNumber || 'N/A';
        document.getElementById('userAddressDisplay').textContent = storedData.address || 'N/A';
        document.getElementById('userEmergencyContactDisplay').textContent = storedData.emergencyContact || 'N/A';
        document.getElementById('userOccupationDisplay').textContent = storedData.occupation || 'N/A';
        document.getElementById('userDonationTypeDisplay').textContent = storedData.donationType || 'N/A';
        document.getElementById('lastDonationDateDisplay').textContent = storedData.lastDonationDate || 'N/A';
        document.getElementById('healthConditionsDisplay').textContent = storedData.healthConditions || 'N/A';
        document.getElementById('medicalHistoryDisplay').textContent = storedData.medicalHistory || 'N/A';
        document.getElementById('userAllergiesDisplay').textContent = storedData.allergies || 'N/A';

        if (storedData.profilePic) {
            document.getElementById('profilePic').src = storedData.profilePic;
        }

        profileDetails.classList.remove('hidden');
    } else {
        profileForm.classList.remove('hidden');
    }

    // Handle profile picture click to change the image
    profilePic.addEventListener('click', () => {
        profilePicInput.click();
    });

    // Handle profile picture input change
    profilePicInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                profilePic.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle edit button click
    editProfileButton.addEventListener('click', () => {
        profileDetails.classList.add('hidden');
        profileForm.classList.remove('hidden');

        // Populate form fields with existing data
        if (storedData) {
            document.getElementById('userName').value = storedData.name || '';
            document.getElementById('userAge').value = storedData.age || '';
            document.getElementById('userQualifications').value = storedData.qualifications || '';
            document.getElementById('userBloodGroup').value = storedData.bloodGroup || '';
            document.getElementById('userPhoneNumber').value = storedData.phoneNumber || '';
            document.getElementById('userAddress').value = storedData.address || '';
            document.getElementById('userEmergencyContact').value = storedData.emergencyContact || '';
            document.getElementById('userOccupation').value = storedData.occupation || '';
            document.getElementById('userDonationType').value = storedData.donationType || '';
            document.getElementById('lastDonationDate').value = storedData.lastDonationDate || '';
            document.getElementById('healthConditions').value = storedData.healthConditions || '';
            document.getElementById('medicalHistory').value = storedData.medicalHistory || '';
            document.getElementById('userAllergies').value = storedData.allergies || '';
        }
    });

    // Handle form submission (save new profile details)
    document.getElementById('profileFormDetails').addEventListener('submit', function(event) {
        event.preventDefault();

        const profilePicInputFile = document.getElementById('profilePicInput').files[0];
        let profilePicData = '';

        if (profilePicInputFile) {
            const reader = new FileReader();
            reader.onload = function() {
                profilePicData = reader.result;
                saveProfileData(profilePicData);
            };
            reader.readAsDataURL(profilePicInputFile);
        } else {
            saveProfileData();
        }
    });

    function saveProfileData(profilePicData = '') {
        // Retrieve existing data to retain the password
        const existingData = JSON.parse(localStorage.getItem(loggedInEmail)) || {};

        // Create updated data object while retaining the password
        const updatedData = {
            name: document.getElementById('userName').value || existingData.name || loggedInEmail,
            age: document.getElementById('userAge').value,
            qualifications: document.getElementById('userQualifications').value,
            bloodGroup: document.getElementById('userBloodGroup').value,
            phoneNumber: document.getElementById('userPhoneNumber').value,
            address: document.getElementById('userAddress').value,
            emergencyContact: document.getElementById('userEmergencyContact').value,
            occupation: document.getElementById('userOccupation').value,
            donationType: document.getElementById('userDonationType').value,
            lastDonationDate: document.getElementById('lastDonationDate').value,
            healthConditions: document.getElementById('healthConditions').value,
            medicalHistory: document.getElementById('medicalHistory').value,
            allergies: document.getElementById('userAllergies').value,
            profilePic: profilePicData || existingData.profilePic || 'default-profile.png' // Ensure the picture is saved here
        };

        // Keep the password intact
        if (existingData.password) {
            updatedData.password = existingData.password;
        }

        // Save the updated data back to local storage
        localStorage.setItem(loggedInEmail, JSON.stringify(updatedData));
        alert('Profile saved successfully!');
        window.location.reload(); // Reload the page to show updated details
    }
});
