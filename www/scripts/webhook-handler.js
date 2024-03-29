// Description: This script is used to handle the GitHub webhook and update the portfolio website when a push event is received.
const express = require('express');
const crypto = require('crypto');
const exec = require('child_process').exec;
const https = require('https');
const fs = require('fs');
require('dotenv').config();

// Create the server
const app = express();
const port = process.env.WEBHOOK_PORT || 3001;
const secret = process.env.GITHUB_SECRET;
const environment = process.env.NODE_ENV || 'development';

// SSL Credentials
const credentials = {
    key: fs.readFileSync(environment === 'production' ? process.env.SSL_PRIVATE_KEY_PATH_PROD : process.env.SSL_PRIVATE_KEY_PATH_DEV, 'utf8'),
    cert: fs.readFileSync(environment === 'production' ? process.env.SSL_CERTIFICATE_PATH_PROD : process.env.SSL_CERTIFICATE_PATH_DEV, 'utf8')
};

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

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
    let hmac;
    try {
        hmac = crypto.createHmac('sha1', secret);
    } catch (err) {
        console.error('Error creating HMAC:', err);
        return res.status(500).send('Error creating HMAC');
    }
    
    let digest;
    try {
        digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8');
    } catch (err) {
        console.error('Error creating digest:', err);
        return res.status(500).send('Error creating digest');
    }
    
    let checksum;
    try {
        checksum = Buffer.from(sig, 'utf8');
    } catch (err) {
        console.error('Error creating checksum:', err);
        return res.status(500).send('Error creating checksum');
    }
    
    try {
        if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
            return res.status(400).send('Invalid signature');
        }
    } catch (err) {
        console.error('Error comparing checksum and digest:', err);
        return res.status(500).send('Error comparing checksum and digest');
    }

    // Compare the two buffers in constant time
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        return res.status(400).send('Invalid signature');
    }

    console.log('Valid signature');

    // Check if the event is a ping
    if (req.get('X-GitHub-Event') === 'ping') {
        return res.status(200).send('Ping received successfully');
    }

    // Execute the shell script
    exec('cd ~/Portfolio && /usr/bin/git pull', (err, stdout, stderr) => {
        console.log('Updating the repository');
        if (err) {
            console.log('Error occurred while updating the repository', err.message);
            console.error('Error executing git pull:', err);
            return res.status(500).send('Error occurred while updating the repository');
        }
        console.log(stdout);
        console.error(stderr);
        res.status(200).send('Updated successfully');
    });
});

// Start the server
httpsServer.listen(port, () => {
    console.log(`HTTPS Server is running on port ${port}`);
});