// Build the express server
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
const PORT = 80;
const PORT2 = 8080;
const PORTS = 443;

// SSL Certificate
// Local development
const privateKey = fs.readFileSync(path.join(rootPath,'privkey.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(rootPath, 'cert.pem'), 'utf8');

// Production
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/samuel.theclementes.com/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/samuel.theclementes.com/fullchain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
};

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Routes for directories
app.use('/assets', express.static(assetsPath));
app.use('/data', express.static(dataPath));
app.use('/libraries', express.static(librariesPath));
app.use('/scripts', express.static(scriptsPath));
app.use('/styles', express.static(stylesPath));

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
})

// If there are unmatched routes this will handle them
app.use((req, res) => {
    res.status(404).sendFile(path.join(viewsPath, "404.html"), (err) => {
        if(err) {
            res.status(404).send("Page Not Found");
        }
    });
});

app.use(express.static(rootPath, {
    dotfiles: 'allow' // set this to 'allow' to serve hidden directories
}));

// Start listening on PORTx, starting the server
app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is running on port " + PORT);
    else
        console.log("Error occurred, server can\'t start", error);
    }
);

app.listen(PORT2, (error) => {
    if (!error)
        console.log("Server is running on port " + PORT2);
    else
        console.log("Error occurred, server can\'t start", error);
    }
);

httpsServer.listen(PORTS, (error) => {
    if (!error)
        console.log("Server is running on port " + PORTS);
    else
        console.log("Error occurred, server can\'t start", error);
    }
);
