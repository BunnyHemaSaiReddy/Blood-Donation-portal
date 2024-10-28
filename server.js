// server.js
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
        return res.status(400).json({ message: 'Email and code are required.' });
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
            return res.status(500).json({ message: 'Error sending verification email.' });
        } else {
            console.log('Email sent:', info.response);
            return res.status(200).json({ message: 'Verification email sent.' });
        }
    });
});

function getPhoneNumberByEmail(email) {
    const donorData = localStorage.getItem(email);
    if (donorData) {
        const data = JSON.parse(donorData);
        return data.phoneNumber || 'Phone number not available'; // Return phone number or a default message
    }
    return 'Phone number not found';
}

// Function to send email to donor and then to receiver
app.post('/send-donor-email', (req, res) => {
    const { donorEmail, requestData, status } = req.body;

    if (!donorEmail || !requestData || !status) {
        return res.status(400).json({ message: 'Donor email, request data, and status are required.' });
    }

    const donorEmailBody = `
        Hello ${donorEmail},

        Your blood donation request has been ${status} for the requester ${requestData.requester}.

        Details of the request:
        - Blood Quantity Needed: ${requestData.quantity} units
        - Situation: ${requestData.situation}
        - Status: ${status}

        Thank you for your willingness to donate blood!

        Best Regards,
        Blood Donation Management Team
    `;

    const donorMailOptions = {
        from: 'hsr.bunny.2004@gmail.com',
        to: donorEmail,
        subject: 'Blood Donation Request Status',
        text: donorEmailBody,
    };

    transporter.sendMail(donorMailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email to donor:', error);
            return res.status(500).json({ message: 'Error sending email to donor.' });
        } else {
            console.log('Email sent to donor:', info.response);
            const phoneNumber = getPhoneNumberByEmail(donorEmail);
            // If donor email is sent successfully, send an email to the receiver
            const receiverEmailBody = `
                Hello ${requestData.requester},

                We are pleased to inform you that your blood donation request has been ${status} by the donor ${donorEmail}.

                ${status === 'accepted' ? `
                    **Donor Details:**
                    - **Donor Email:** ${donorEmail}
                    - **Donor Phone Number:** ${phoneNumber}

                    Please contact the donor directly to coordinate the blood donation.
                ` : `
                    Unfortunately, the request has been denied. If you have any questions, feel free to reach out to us.
                `}

                **Details of Your Request:**
                - Blood Quantity Needed: ${requestData.quantity} units
                - Situation: ${requestData.situation}

                Thank you for your willingness to help others in need!

                Best Regards,
                Blood Donation Management Team
            `;

            const receiverMailOptions = {
                from: 'hsr.bunny.2004@gmail.com',
                to: donorEmail,
                subject: 'Blood Donation Request Update',
                text: receiverEmailBody,
            };

            // Send email to the receiver
            transporter.sendMail(receiverMailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email to receiver:', error);
                    return res.status(500).json({ message: 'Error sending email to receiver.' });
                } else {
                    console.log('Email sent to receiver:', info.response);
                    return res.status(200).json({ message: 'Emails sent successfully to both donor and receiver.' });
                }
            });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
