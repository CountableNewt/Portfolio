// This is the main server file
const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const app = express();

// Define directory paths
const rootPath = path.join(__dirname, '../');
const assetsPath = path.join(__dirname, '../assets');
const dataPath = path.join(__dirname, '../data');
const librariesPath = path.join(__dirname, '../libraries');
const scriptsPath = path.join(__dirname, '../scripts');
const stylesPath = path.join(__dirname, '../styles');
const viewsPath = path.join(__dirname, '../views');

// Load environment variables
require('dotenv').config();
const environment = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT;

// SSL Credentials
const credentials = {
    key: fs.readFileSync(environment === 'production' ? process.env.SSL_PRIVATE_KEY_PATH_PROD : process.env.SSL_PRIVATE_KEY_PATH_DEV, 'utf8'),
    cert: fs.readFileSync(environment === 'production' ? process.env.SSL_CERTIFICATE_PATH_PROD : process.env.SSL_CERTIFICATE_PATH_DEV, 'utf8')
};

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Middleware
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if(req.protocol === 'http') {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
    } else {
        next();
    }
});

// Routes for directories
app.use('/assets', express.static(assetsPath));
app.use('/data', express.static(dataPath));
app.use('/libraries', express.static(librariesPath));
app.use('/scripts', express.static(scriptsPath));
app.use('/styles', express.static(stylesPath));

// Routes for pages
// This will serve pages from any directory in views
app.get('/:directory/:page', (req, res) => {
    const { directory, page } = req.params;
    const filePath = path.join(viewsPath, directory, `${page}.html`);
    res.sendFile(filePath, (err) => {
        if(err) {
            const notFoundPath = path.join(viewsPath, '404.html');
            res.status(404).sendFile(notFoundPath, (err) => {
                if(err) {
                    res.status(404).send("Page Not Found");
                }
            });
        }
    });
});

// This will serve pages without file extensions
// This keeps the web address cleaner
app.get('/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(viewsPath, `${page}.html`), (err) => {
        if(err) {
            res.status(404).sendFile(path.join(viewsPath, '404.html'), (err) => {
                if(err) {
                    res.status(404).send("Page Not Found");
                }
            });
        }
    });
});

// This will serve index for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(rootPath, "index.html"), (err) => {
        if(err) {
            res.status(404).sendFile(path.join(viewsPath, "404.html"), (err) => {
                if(err) {
                    res.status(404).send("Page Not Found");
                }
            });
        }
    });
});

// If there are unmatched routes this will handle them
app.use((req, res) => {
    res.status(404).sendFile(path.join(viewsPath, "404.html"), (err) => {
        if(err) {
            res.status(404).send("Page Not Found");
        }
    });
});

// Start listening on PORT/PORTDEV, starting the server
httpsServer.listen(PORT, (error) => {
    if (!error)
        console.log(`Server is running on port ${PORT}`);
    else
        console.log("Error occurred, server can\'t start", error);
});
