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
function displayDonors() {
    const bloodGroup = document.getElementById('search').value.trim().toUpperCase();
    const donorList = document.getElementById('donorList');
    donorList.innerHTML = ''; // Clear previous results
    const donors = [];

    // Retrieve all keys from localStorage
    for (const key in localStorage) {
        if (isValidEmail(key) && key !== localStorage.getItem('loggedInEmail')) {
            try {
                const data = JSON.parse(localStorage[key]);

                // Check if bloodGroup is defined and matches the search, ignore case
                if (data.bloodGroup && (bloodGroup === '' || data.bloodGroup.toUpperCase() === bloodGroup)) {
                    data.key = key; // Store the key to identify the donor later
                    data.status = getApplicationStatus(key);
                    donors.push(data);
                }
            } catch (error) {
                console.error(`Error parsing data for key ${key}:`, error);
            }
        }
    }

    // Sort donors by status, "Not applied" first
    donors.sort((a, b) => {
        if (a.status === 'Not applied' && b.status !== 'Not applied') {
            return -1; // a comes before b
        }
        if (a.status !== 'Not applied' && b.status === 'Not applied') {
            return 1; // b comes before a
        }
        return 0; // No change in order
    });

    // Create the table structure
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Create table headers
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #d9534f; color: #ffffff;">Name</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #d9534f; color: #ffffff;">Blood Group</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #d9534f; color: #ffffff;">Address</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #d9534f; color: #ffffff;">Age</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #d9534f; color: #ffffff;">Status</th>
        <th style="border: 1px solid #ddd; padding: 8px; background-color: #d9534f; color: #ffffff;">Actions</th>
    `;
    table.appendChild(headerRow);

    // Populate table rows with donor data
    donors.forEach(data => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px;">${data.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${data.bloodGroup}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${data.address}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${data.age}</td>
            <td style="border: 1px solid #ddd; padding: 8px; ${data.status === 'Applied' ? 'color: green;' : ''}">
                ${data.status}
            </td>
            <td style="border: 1px solid #ddd; padding: 8px;">
                <button onclick="viewProfile('${data.key}')" style="padding: 5px 10px; background-color: #00796b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    See Profile
                </button>
            </td>
        `;
        table.appendChild(row);
    });

    // Append the table to the donorList div
    donorList.appendChild(table);
}

// Function to validate email format
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Function to check the status of an application
function getApplicationStatus(email) {
    const applicationKey = `application_${email}_${localStorage.getItem('loggedInEmail')}`;
    const application = localStorage.getItem(applicationKey);
    if (application) {
        return 'Applied';
    }
    return 'Not applied';
}

// Function to view profile
function viewProfile(email) {
    // Redirect to profile2.html with the email as a query parameter
    window.location.href = `profile2.html?email=${encodeURIComponent(email)}`;
}
