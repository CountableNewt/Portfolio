// Description: This script is used to handle the GitHub webhook and update the portfolio website when a push event is received.
const express = require('express');
const crypto = require('crypto');
const exec = require('child_process').exec;
require('dotenv').config();

// Create the server
const app = express();
const port = process.env.WEBHOOK_PORT || 3001;
const secret = process.env.GITHUB_SECRET;

// Middleware
app.use(express.json());

// Routes
app.post('/webhook', (req, res) => {
    // Validate the payload
    const payload = JSON.stringify(req.body);
    if(!payload) {
        return res.status(400).send('Payload required');
    }

    console.log('Payload received');

    // Validate the signature
    const sig = req.get('X-Hub-Signature') || '';
    const hmac = crypto.createHmac('sha1', secret);
    const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8');
    const checksum = Buffer.from(sig, 'utf8');

    // Compare the two buffers in constant time
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        return res.status(400).send('Invalid signature');
    }

    console.log('Valid signature');

    // Execute the shell script
    exec('git pull', (err, stdout, stderr) => {
        console.log('Updating the repository');
        if (err) {
            console.log('Error occurred while updating the repository', err.message);
            console.error(err);
            return res.status(500).json({ details: 'Internal Server Error', error: err.message, payload: req.body });
        }
        console.log(stdout);
        console.error(stderr);
        res.status(200).send('Updated successfully');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});