// Function to simulate sending a verification code
function sendVerificationCode() {
    const email = document.getElementById('email').value;

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    // Simulate checking if the email is registered
    if (!localStorage.getItem(email)) {
        alert('Email is not registered. Please sign up first.');
        window.location.href = 'signup.html';
        return;
    }

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('verificationCode', verificationCode); // Store the code temporarily for verification

    alert(`Verification code sent to ${email}: ${verificationCode}`); // Simulate sending the code

    // Show the verification code input step
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
}

// Function to verify the entered code
function verifyCode() {
    const enteredCode = document.getElementById('verificationCode').value;
    const storedCode = localStorage.getItem('verificationCode');

    if (!enteredCode) {
        alert('Please enter the verification code.');
        return;
    }

    if (enteredCode === storedCode) {
        alert('Verification successful!');
        // Show the password reset step
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
    } else {
        alert('Invalid verification code. Please try again.');
    }
}

// Function to reset the password
function resetPassword() {
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

    // Store the new password in local storage (for this simulation)
    localStorage.setItem(email, JSON.stringify({ password: newPassword }));
    localStorage.removeItem('verificationCode'); // Clean up stored verification code

    alert('Password has been reset successfully! Redirecting to the login page.');
    window.location.href = 'login.html'; // Redirect to the login page
}
