const express = require('express');
const crypto = require('crypto');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config({ path: 'www/.env' });

const app = express();
const port = process.env.WEBHOOK_PORT || 3001;
const secret = process.env.GITHUB_SECRET;

// Create a write stream (in append mode) for the access log and error log
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
fs.open('error.log', 'a', (err, fd) => {
    if (err) throw err;
    fs.close(fd, (err) => {
        if (err) throw err;
    });
});

// Middleware
app.use(express.json());
app.use(morgan('combined', { stream: accessLogStream }));

// Routes
app.post('/webhook', (req, res) => {
    const payload = JSON.stringify(req.body);
    if(!payload) {
        return res.status(400).send('Payload required');
    }

    const sig = req.get('X-Hub-Signature') || '';
    const hmac = crypto.createHmac('sha1', secret);
    const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8');
    const checksum = Buffer.from(sig, 'utf8');

    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        return res.status(400).send('Invalid signature');
    }

    // Execute the shell script
    exec("update-portfolio.sh", (err, stdout, stderr) => {
        if (err) {
            fs.appendFile('error.log', `${new Date().toISOString()} - ${err.message}\n`, function (err) {
                if (err) console.error('Error writing to error.log:', err);
            });
            return res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
        console.log(stdout);
        console.error(stderr);
        res.status(200).send('Updated successfully');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});