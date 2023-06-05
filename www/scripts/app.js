// Build the express server
const express = require('express');
const path = require('path');
const app = express();

// Define directory paths
const rootPath = path.join(__dirname, '../');
const assetsPath = path.join(__dirname, '../assets');
const dataPath = path.join(__dirname, '../data');
const librariesPath = path.join(__dirname, '../libraries');
const scriptsPath = path.join(__dirname, '../scripts');
const stylesPath = path.join(__dirname, '../styles');
const viewsPath = path.join(__dirname, '../views');
const PORT = 3000;

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
    console.log(filePath);
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

// Start listening on PORT, starting the server
app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is running on port " + PORT);
    else
        console.log("Error occurred, server can\'t start", error);
    }
);
