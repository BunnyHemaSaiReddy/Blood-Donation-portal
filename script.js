// Function to generate a random 6-digit number
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
}

// Function to send a verification code (simulated here)
let generatedCode; // Variable to store the generated code

async function sendVerificationCode() {
    const email = document.getElementById('email').value;

    // Check if the email is already registered
    try {
        const response = await fetch('http://bunny-blooddonation.onrender.com/api/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (data.exists) {
            alert('This email is already registered. Please log in instead.');
            window.location.href = 'login.html'; // Redirect to login page
            return;
        }
    } catch (error) {
        console.error('Error checking email:', error);
        alert('An error occurred. Please try again.');
        return;
    }
     
    // Generate and store the verification code
    generatedCode = generateRandomCode();
    console.log(generatedCode);

    // Make a request to the server to send the email
    try {
        const response = await fetch('http://bunny-blooddonation.onrender.com/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code: generatedCode }),
        });

        if (!response.ok) {
            throw new Error('Failed to send verification code');
        }
    } catch (error) {
        console.error('Error sending verification code:', error);
        alert('An error occurred. Please try again.');
        return;
    }

    // Show the verification code section and hide the email section
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

// Function to verify the code
function verifyCode() {
    const code = document.getElementById('verificationCode').value;

    // Check if the entered code matches the generated code
    if (code == generatedCode) {
        alert('Verification code verified.');

        // Show the password configuration section and hide the verification code section
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
    } else {
        alert('Invalid verification code. Please try again.');
    }
}

// Form validation for signup
async function signup() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsCheckbox = document.getElementById('termsCheckbox').checked;

    // Check if the terms checkbox is checked
    if (!termsCheckbox) {
        alert('You must agree to the Terms and Conditions before signing up.');
        return;
    }

    // Validate the password and confirmation
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('http://bunny-blooddonation.onrender.com/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Signup failed. Please try again.');
            return;
        }

        alert('Signup successful! Redirecting to the login page.');
        window.location.href = 'login.html'; // Redirect to login page
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred. Please try again.');
    }
}

// Adding event listener to the signup form for the submit button
document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission
    signup(); // Call signup function
});



// document.getElementById('loginForm').addEventListener('submit', function (event) {
//     event.preventDefault(); // Prevent the form from submitting normally

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     // Retrieve stored data from local storage
//     const storedData = localStorage.getItem(email); 

//     if (storedData) {
//         const userDetails = JSON.parse(storedData);
//         // Check if the password matches
//         if (userDetails.password === password) {
//             alert('Login successful! Redirecting to the portal.');
//             window.location.href = 'portal.html'; // Redirect to the main portal page
//         } else {
//             alert('Incorrect password. Please try again.');
//         }
//     } else {
//         alert('No account found with this email. Please sign up.');
//         window.location.href = 'signup.html'; // Redirect to signup page
//     }
// });



