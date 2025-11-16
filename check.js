// const express = require('express');
// const nodemailer = require('nodemailer');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// // Create a transporter for nodemailer
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'hsr.bunny.2004@gmail.com',
//         pass: 'epjm sgyq fpvu uwlr' // Use your app password here if 2FA is enabled
//     }
// });

// // Function to send verification email
// const sendVerificationEmail = (receiverEmail, verificationCode) => {
//     const mailOptions = {
//         from: 'hsr.bunny.2004@gmail.com',
//         to: receiverEmail,
//         subject: 'Email Verification - Blood Donation Portal',
//         text: `This message is from the blood donation portal. To verify your account, use the following 6-digit code: ${verificationCode}\nEnter the OTP in the portal.`
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error('Error sending email:', error);
//         } else {
//             console.log('Email sent:', info.response);
//         }
//     });
// };

// // Test sending an email
// const testEmail = () => {
//     const receiverEmail = 'bunnyhemasaireddy@gmail.com';
//     const verificationCode = '123456';
//     sendVerificationEmail(receiverEmail, verificationCode);
// };

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     testEmail(); // Call the test function to send an email on server start
// });

// Function to send verification code using fetch
async function sendVerificationCode() {
    const email = "bunnyhemasaireddy@gmail.com";
    const generatedCode = 2345;

    try {
        const response = await fetch('http://localhost:3000/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code: generatedCode }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error:', errorData.message);
        } else {
            const result = await response.json();
            console.log('Server response:', result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

sendVerificationCode();

