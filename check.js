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











// // server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hsr.bunny.2004@gmail.com',
        pass: 'epjm sgyq fpvu uwlr' // Use your app password here if 2FA is enabled
    }
});

// Route to send a verification code email
app.post('/send-code', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required.' }); // Use json() here
    }

    const mailOptions = {
        from: 'hsr.bunny.2004@gmail.com',
        to: email,
        subject: 'Email Verification - Blood Donation Portal',
        text: `This message is from the blood donation portal. To verify your account, use the following 6-digit code: ${code}\nEnter the OTP in the portal.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending verification email.' }); // Use json() here
        } else {
            console.log('Email sent:', info.response);
            return res.status(200).json({ message: 'Verification email sent.' }); // Use json() here
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


