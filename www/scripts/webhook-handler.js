const express = require('express');
const crypto = require('crypto');
const exec = require('child_process').exec;
require('dotenv').config();

const app = express();
const port = process.env.WEBHOOK_PORT || 3001;
const secret = process.env.GITHUB_SECRET;

// Middleware
app.use(express.json());

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
    exec("./update-portfolio.sh", (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ details: 'Internal Server Error', error: err.message, payload: req.body });
        }
        console.log(stdout);
        console.error(stderr);
        res.status(200).send('Updated successfully');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});