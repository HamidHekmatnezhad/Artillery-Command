const express = require('express');
const path = require('path');
const fs = require('fs'); // file system
const app = express();

const port = 8080;

app.use(express.static('public', { index: false })); // static files in public folder  
// Local Bootstrap for use in HTML pages offline
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist'))); 
app.use('/b-icons', express.static(path.join(__dirname, 'node_modules', 'bootstrap-icons', 'font')));

// adding Layout to pages
function renderPagesWithLayout(pageName) {
    const pagePath = path.join(__dirname, 'public', 'views', pageName);
    const headPath = path.join(__dirname, 'public', 'components', 'head.html');
    const navbarPath = path.join(__dirname, 'public', 'components', 'navbar.html');

    let pageContent = fs.readFileSync(pagePath, 'utf8');
    let headContent = fs.readFileSync(headPath, 'utf8');
    let navbarContent = fs.readFileSync(navbarPath, 'utf8');

    pageContent = pageContent.replace('{{HEAD}}', headContent);
    pageContent = pageContent.replace('{{NAVBAR}}', navbarContent);

    return pageContent;
}

// Routing
// ------------- home -------------
app.get('/', (req, res) => {
    res.redirect('/index');
    });
app.get('/index', (req,res) => {
    const renderedPage = renderPagesWithLayout('index.html');
    res.send(renderedPage);
});

// ------------- game -------------
app.get('/game', (req,res) => {
    const renderedPage = renderPagesWithLayout('game.html');
    res.send(renderedPage);
});

// ------------- leaderboard -------------
app.get('/leaderboard', (req,res) => {
    const renderedPage = renderPagesWithLayout('leaderboard.html');
    res.send(renderedPage);
});

// ------------- help -------------
app.get('/help', (req,res) => {
    const renderedPage = renderPagesWithLayout('help.html');
    res.send(renderedPage);
});

// ------------- about -------------
app.get('/about', (req,res) => {
    const renderedPage = renderPagesWithLayout('about.html');
    res.send(renderedPage);
});


// ------------- API JSON data -------------
app.get('/api/content', (req, res) => {
    const data = require('./data/content.json');
    res.json(data);
});
app.get('/api/artilleryFireData', (req, res) => {
    const data = require('./data/artilleryFireData.json');
    res.json(data);
});

// ------------- start server -------------
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

});