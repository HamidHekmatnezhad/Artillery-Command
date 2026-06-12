const express = require('express');
const path = require('path');
const fs = require('fs'); // file system
const app = express();

const port = 8080;

app.use(express.static('public', { index: false })); // static files in public folder  
// for save in json 
app.use(express.json());
// Local Bootstrap for use in HTML pages offline
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist'))); 
app.use('/b-icons', express.static(path.join(__dirname, 'node_modules', 'bootstrap-icons', 'font')));
// Local p5
app.use('/p5', express.static(path.join(__dirname, 'node_modules', 'p5', 'lib')));

// adding Layout to pages
function renderPagesWithLayout(pageName) {
    const pagePath = path.join(__dirname, 'public', 'views', pageName);
    const headPath = path.join(__dirname, 'public', 'components', 'head.html');
    const navbarPath = path.join(__dirname, 'public', 'components', 'navbar.html');
    const footerPath = path.join(__dirname, 'public', 'components', 'footer.html');

    let pageContent = fs.readFileSync(pagePath, 'utf8');
    let headContent = fs.readFileSync(headPath, 'utf8');
    let navbarContent = fs.readFileSync(navbarPath, 'utf8');
    let footerContent = fs.readFileSync(footerPath, 'utf8');

    pageContent = pageContent.replace('{{HEAD}}', headContent);
    pageContent = pageContent.replace('{{NAVBAR}}', navbarContent);
    pageContent = pageContent.replace('{{FOOTER}}', footerContent);

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
app.get('/api/radioOperator', (req, res) => {
    const data = require('./data/radioOperator.json');
    res.json(data);
});
app.get('/api/leaderboard', (req, res) => {
    const data = require('./data/leaderboard.json');
    res.json(data);
});

// ------------- API Save Data -------------
app.post('/api/saveLeaderboard', (req, res) => {
    const newData = req.body; 
    const filePath = path.join(__dirname, 'data', 'leaderboard.json');

    // read data
    fs.readFile(filePath, 'utf8', (err, data) => {
        let leaderboard = [];
        
        if (!err && data) {
            try {
                leaderboard = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing leaderboard JSON:", e);
            }
        }

        // search for exist player
        const existingPlayerIndex = leaderboard.findIndex(player => player.name === newData.name);

        // If the player is found
        if (existingPlayerIndex !== -1) {
            // we check if her new record is better than the previous record.
            if (newData.score > leaderboard[existingPlayerIndex].score) {
                // update 
                leaderboard[existingPlayerIndex] = newData;
            }
        } else {
            // If the player's name is not in the list, we add it as a new record
            leaderboard.push(newData);
        }

        // sort data 
        leaderboard.sort((a, b) => b.score - a.score);

        // save updated data
        fs.writeFile(filePath, JSON.stringify(leaderboard, null, 4), (err) => {
            if (err) {
                console.error("Error writing to file", err);
                return res.status(500).json({ message: "error in leaderboard save" });
            }
            res.json({ message: "Leaderboard data saved successfully" });
        });
    });
});

// ------------- 404 -------------
app.use((req, res) => {
    const renderedPage = renderPagesWithLayout('404.html');
    res.status(404).send(renderedPage);
});

// ------------- start server -------------
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

});