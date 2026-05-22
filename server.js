const express = require('express');
const path = require('path');
const fs = require('fs'); // file system
const app = express();

const port = 8080;

app.use(express.static('public', { index: false })); // static files in public folder  

// adding NAVBAR to pages
function renderPageWithNavbar(pageName) {
    const pagePath = path.join(__dirname, 'public', pageName);
    const navbarPath = path.join(__dirname, 'public', 'navbar.html');

    let pageContent = fs.readFileSync(pagePath, 'utf8');
    let navbarContent = fs.readFileSync(navbarPath, 'utf8');

    return pageContent.replace('{{NAVBAR}}', navbarContent);
}

// Routing
// ------------- index -------------
app.get('/', (req,res) => {
    const renderedPage = renderPageWithNavbar('index.html');
    res.send(renderedPage);
});
// ------------- game -------------
app.get('/game', (req,res) => {
    const renderedPage = renderPageWithNavbar('game.html');
    res.send(renderedPage);
});
// ------------- about -------------


app.get('/api/data', (req, res) => {
    const data = require('./data/content.json');
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    
});