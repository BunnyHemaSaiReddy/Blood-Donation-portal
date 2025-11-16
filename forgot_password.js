// Function to simulate sending a verification code
let generatedCode; // Variable to store the generated code

async function sendVerificationCode() {
    const email = document.getElementById('email').value;

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    // Check if the email is registered
    try {
        const response = await fetch('https://bunny-blooddonation.onrender.com/api/check-email-exists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!data.exists) {
            alert('Email is not registered. Please sign up first.');
            window.location.href = 'signup.html';
            return;
        }
    } catch (error) {
        console.error('Error checking email:', error);
        alert('An error occurred. Please try again.');
        return;
    }

    // Generate a random 6-digit verification code
    generatedCode = Math.floor(100000 + Math.random() * 900000);

    // Send verification code via email
    try {
        const response = await fetch('https://bunny-blooddonation.onrender.com/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code: generatedCode }),
        });

        if (!response.ok) {
            throw new Error('Failed to send verification code');
        }

        alert(`Verification code sent to ${email}. Please check your email.`);
    } catch (error) {
        console.error('Error sending verification code:', error);
        alert('An error occurred. Please try again.');
        return;
    }

    // Show the verification code input step
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

// Function to verify the entered code
function verifyCode() {
    const enteredCode = document.getElementById('verificationCode').value;

    if (!enteredCode) {
        alert('Please enter the verification code.');
        return;
    }

    if (enteredCode == generatedCode) {
        alert('Verification successful!');
        // Show the password reset step
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
    } else {
        alert('Invalid verification code. Please try again.');
    }
}

// Function to reset the password
async function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const email = document.getElementById('email').value;

    if (!newPassword || !confirmNewPassword) {
        alert('Please fill in both password fields.');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    try {
        const response = await fetch('https://bunny-blooddonation.onrender.com/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Failed to reset password. Please try again.');
            return;
        }

        alert('Password has been reset successfully! Redirecting to the login page.');
        window.location.href = 'login.html'; // Redirect to the login page
    } catch (error) {
        console.error('Error resetting password:', error);
        alert('An error occurred. Please try again.');
    }
}

