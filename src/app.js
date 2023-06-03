const express = require('express');
const path = require('path');
const publicPath = path.join('Portfolio', '../public');

const app = express();
const PORT = 3000;

app.use(express.static(publicPath, {extensions: ['html']}));

app.use(function (req, res) {
    res.status(404).sendFile(publicPath + '/404.html');
});

app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is running on port " + PORT);
    else
        console.log("Error occurred, server can't start", error);
    }
);
