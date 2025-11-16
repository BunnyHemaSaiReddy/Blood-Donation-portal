// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool, initializeDatabase } = require('./db');

const app = express();
const PORT = 3000;

// Serve HTML, CSS, JS from same directory
app.use(express.static(__dirname));

// Middleware (must come before routes)
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// Home route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

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

// Check if email exists (for signup)
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ message: 'Error checking email.' });
    }
});

// Signup - Create new user
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user already exists
        const [existing] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Insert new user
        await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
        return res.status(200).json({ message: 'Signup successful!' });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Error during signup.' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT email, password FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        if (rows[0].password !== password) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // Create session
        await pool.query('INSERT INTO sessions (email) VALUES (?) ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP', [email]);
        
        return res.status(200).json({ message: 'Login successful!', email: email });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Error during login.' });
    }
});

// Logout
app.post('/api/logout', async (req, res) => {
    try {
        const { email } = req.body;
        await pool.query('DELETE FROM sessions WHERE email = ?', [email]);
        return res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ message: 'Error during logout.' });
    }
});

// Get user profile
app.get('/api/profile/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const [rows] = await pool.query('SELECT * FROM profiles WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found.' });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Error fetching profile.' });
    }
});

// Get user data (includes password for login check)
app.get('/api/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const [profileRows] = await pool.query('SELECT * FROM profiles WHERE email = ?', [email]);
        
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userData = { ...userRows[0] };
        if (profileRows.length > 0) {
            Object.assign(userData, profileRows[0]);
        }

        return res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ message: 'Error fetching user data.' });
    }
});

// Update or create profile
app.post('/api/profile', async (req, res) => {
    try {
        const { email, ...profileData } = req.body;
        
        // Check if profile exists
        const [existing] = await pool.query('SELECT email FROM profiles WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            // Update existing profile
            await pool.query(`
                UPDATE profiles SET 
                    name = ?, age = ?, qualifications = ?, bloodGroup = ?, 
                    phoneNumber = ?, address = ?, emergencyContact = ?, 
                    occupation = ?, donationType = ?, lastDonationDate = ?, 
                    healthConditions = ?, medicalHistory = ?, allergies = ?, 
                    profilePic = ?
                WHERE email = ?
            `, [
                profileData.name, profileData.age, profileData.qualifications,
                profileData.bloodGroup, profileData.phoneNumber, profileData.address,
                profileData.emergencyContact, profileData.occupation, profileData.donationType,
                profileData.lastDonationDate, profileData.healthConditions,
                profileData.medicalHistory, profileData.allergies, profileData.profilePic,
                email
            ]);
        } else {
            // Create new profile
            await pool.query(`
                INSERT INTO profiles (email, name, age, qualifications, bloodGroup, 
                    phoneNumber, address, emergencyContact, occupation, donationType, 
                    lastDonationDate, healthConditions, medicalHistory, allergies, profilePic)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                email, profileData.name, profileData.age, profileData.qualifications,
                profileData.bloodGroup, profileData.phoneNumber, profileData.address,
                profileData.emergencyContact, profileData.occupation, profileData.donationType,
                profileData.lastDonationDate, profileData.healthConditions,
                profileData.medicalHistory, profileData.allergies, profileData.profilePic
            ]);
        }

        return res.status(200).json({ message: 'Profile saved successfully!' });
    } catch (error) {
        console.error('Error saving profile:', error);
        return res.status(500).json({ message: 'Error saving profile.' });
    }
});

// Get all donors (for search)
app.get('/api/donors', async (req, res) => {
    try {
        const { bloodGroup } = req.query;
        let query = `
            SELECT p.*, u.email 
            FROM profiles p 
            INNER JOIN users u ON p.email = u.email
        `;
        let params = [];

        if (bloodGroup && bloodGroup.trim() !== '') {
            query += ' WHERE p.bloodGroup = ?';
            params.push(bloodGroup.toUpperCase());
        }

        const [rows] = await pool.query(query, params);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching donors:', error);
        return res.status(500).json({ message: 'Error fetching donors.' });
    }
});

// Create blood request
app.post('/api/request', async (req, res) => {
    try {
        const { email, name, bloodGroup, amount, location, message } = req.body;
        
        await pool.query(`
            INSERT INTO requests (email, name, bloodGroup, amount, location, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [email, name, bloodGroup, amount, location, message]);

        return res.status(200).json({ message: 'Request created successfully!' });
    } catch (error) {
        console.error('Error creating request:', error);
        return res.status(500).json({ message: 'Error creating request.' });
    }
});

// Get all requests
app.get('/api/requests', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, u.email 
            FROM requests r 
            INNER JOIN users u ON r.email = u.email
            WHERE r.status = 'pending'
        `);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        return res.status(500).json({ message: 'Error fetching requests.' });
    }
});

// Update request status
app.put('/api/request/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await pool.query('UPDATE requests SET status = ? WHERE id = ?', [status, id]);
        return res.status(200).json({ message: 'Request updated successfully!' });
    } catch (error) {
        console.error('Error updating request:', error);
        return res.status(500).json({ message: 'Error updating request.' });
    }
});

// Create application
app.post('/api/application', async (req, res) => {
    try {
        const { donor_email, requester_email, quantity, situation } = req.body;
        
        // Check if application already exists
        const [existing] = await pool.query(`
            SELECT id FROM applications 
            WHERE donor_email = ? AND requester_email = ?
        `, [donor_email, requester_email]);

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already applied to this donor.' });
        }
        
        await pool.query(`
            INSERT INTO applications (donor_email, requester_email, quantity, situation)
            VALUES (?, ?, ?, ?)
        `, [donor_email, requester_email, quantity, situation]);

        return res.status(200).json({ message: 'Application sent successfully!' });
    } catch (error) {
        console.error('Error creating application:', error);
        return res.status(500).json({ message: 'Error creating application.' });
    }
});

// Get applications for a donor (to show in donateblood.html)
app.get('/api/applications/:donor_email', async (req, res) => {
    try {
        const { donor_email } = req.params;
        console.log('Fetching applications for donor:', donor_email);
        
        const [rows] = await pool.query(`
            SELECT a.*, u.email as requester_email, p.name as requester_name
            FROM applications a
            INNER JOIN users u ON a.requester_email = u.email
            LEFT JOIN profiles p ON a.requester_email = p.email
            WHERE a.donor_email = ? AND a.status = 'pending'
            ORDER BY a.created_at DESC
        `, [donor_email]);
        
        console.log('Applications found:', rows.length);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ message: 'Error fetching applications.', error: error.message });
    }
});

// Check if requester has already applied to a donor
app.get('/api/application-status/:donor_email/:requester_email', async (req, res) => {
    try {
        const { donor_email, requester_email } = req.params;
        const [rows] = await pool.query(`
            SELECT id, status, quantity, situation, created_at
            FROM applications
            WHERE donor_email = ? AND requester_email = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [donor_email, requester_email]);
        
        if (rows.length === 0) {
            return res.status(200).json({ exists: false });
        }
        
        return res.status(200).json({ exists: true, application: rows[0] });
    } catch (error) {
        console.error('Error checking application status:', error);
        return res.status(500).json({ message: 'Error checking application status.' });
    }
});

// Get application status for all donors (for listofholders)
app.get('/api/applications-status/:requester_email', async (req, res) => {
    try {
        const { requester_email } = req.params;
        const [rows] = await pool.query(`
            SELECT donor_email, status, quantity, situation, created_at
            FROM applications
            WHERE requester_email = ?
            ORDER BY created_at DESC
        `, [requester_email]);
        
        // Convert to object with donor_email as key
        const statusMap = {};
        rows.forEach(row => {
            statusMap[row.donor_email] = {
                status: row.status,
                quantity: row.quantity,
                situation: row.situation,
                created_at: row.created_at
            };
        });
        
        return res.status(200).json(statusMap);
    } catch (error) {
        console.error('Error fetching applications status:', error);
        return res.status(500).json({ message: 'Error fetching applications status.' });
    }
});

// Get application by ID
app.get('/api/application/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT a.*, u.email as requester_email, p.name as requester_name
            FROM applications a
            INNER JOIN users u ON a.requester_email = u.email
            LEFT JOIN profiles p ON a.requester_email = p.email
            WHERE a.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }
        
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching application:', error);
        return res.status(500).json({ message: 'Error fetching application.' });
    }
});

// Accept or deny application
app.put('/api/application/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['accepted', 'denied'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "denied".' });
        }

        // Get application details
        const [appRows] = await pool.query(`
            SELECT a.*, u.email as requester_email, p.name as requester_name
            FROM applications a
            INNER JOIN users u ON a.requester_email = u.email
            LEFT JOIN profiles p ON a.requester_email = p.email
            WHERE a.id = ?
        `, [id]);

        if (appRows.length === 0) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        const application = appRows[0];

        // Update application status
        await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

        // Send email to requester
        const statusText = status === 'accepted' ? 'accepted' : 'denied';
        const subject = `Blood Donation Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`;
        const text = `Your blood donation application has been ${statusText}.\n\n` +
                    `Donor Email: ${application.donor_email}\n` +
                    `Quantity Requested: ${application.quantity} units\n` +
                    `Situation: ${application.situation}\n\n` +
                    (status === 'accepted' ? 'Please contact the donor to arrange the donation.' : 'Thank you for your interest.');

        const mailOptions = {
            from: 'hsr.bunny.2004@gmail.com',
            to: application.requester_email,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(200).json({ message: `Application ${statusText} successfully and email sent.` });
    } catch (error) {
        console.error('Error updating application:', error);
        return res.status(500).json({ message: 'Error updating application.' });
    }
});

// Reset password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Email not found.' });
        }

        await pool.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
        return res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Error resetting password.' });
    }
});

// Send email to donor and receiver
app.post('/send-donor-email', async (req, res) => {
    try {
        const { donorEmail, requestData, status } = req.body;

        if (!donorEmail || !requestData || !status) {
            return res.status(400).json({ message: 'Donor email, request data, and status are required.' });
        }

        // Get donor phone number from database
        let phoneNumber = 'Phone number not available';
        try {
            const [profileRows] = await pool.query('SELECT phoneNumber FROM profiles WHERE email = ?', [donorEmail]);
            if (profileRows.length > 0 && profileRows[0].phoneNumber) {
                phoneNumber = profileRows[0].phoneNumber;
            }
        } catch (error) {
            console.error('Error fetching phone number:', error);
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
                
                // Get requester email
                const requesterEmail = requestData.requesterEmail || requestData.requester;
                
                // Send email to the receiver
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
                    to: requesterEmail,
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
    } catch (error) {
        console.error('Error in send-donor-email:', error);
        return res.status(500).json({ message: 'Error sending emails.' });
    }
});

// Check if email exists (for forgot password)
app.post('/api/check-email-exists', async (req, res) => {
    try {
        const { email } = req.body;
        const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ message: 'Error checking email.' });
    }
});

// Initialize database on server start
initializeDatabase().then(() => {
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
        
        // Automatically open index.html in the default browser
        const { exec } = require('child_process');
        const path = require('path');
        const indexPath = path.join(__dirname, 'index.html');
        
        // Open index.html in the default browser
        let command;
        if (process.platform === 'win32') {
            // Windows
            command = `start "" "${indexPath}"`;
        } else if (process.platform === 'darwin') {
            // macOS
            command = `open "${indexPath}"`;
        } else {
            // Linux
            command = `xdg-open "${indexPath}"`;
        }
        
        exec(command, (error) => {
            if (error) {
                console.log(`Could not automatically open browser. Please manually open: ${indexPath}`);
                console.log(`Or visit: http://localhost:${PORT}`);
            } else {
                console.log(`Opening index.html in your default browser...`);
            }
        });
    });
}).catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});


