let canvasWidth, canvasHeight;
let gridSize = 50; // size of each grid cell in pixels
let mapGraohics;

let cols = 20;
let rows = 20;
let cellW, cellH;

let r = 0;
let g = 255;
let b = 0;

let bgMap;

let enemies = [];
let enemyIcons = [];
let enemyIconsSrc = [];
let limitEnemies = 6;

let friendlyUnit, friendlyUnitIcon;

let hitbox = false;
let gameStarted = false;
let gameOver = false;
let playerScore = 0;
let chatInputElement;
let btnSendChatElement;
let requestPlayer = false; // TODO: logic

let startTime;
let minTime = 10000; // 10 seconds
let maxTime = 60000; // 60 seconds
let firstTime = 2000; // 2 seconds
let rdmTime;
let noActionTimer = 120000; // 2 minutes
let noActionStartTime;
let reloadTime = 4000; // 5 seconds

let currentAngle = 90;
let currentMil = 1000;
let aimLineX, aimLineY, aimLineColor;
let lineLength = 1500;
let aimLineDebug = false;
let positionX, positionY;

let explosions = [];
let timeToFlight = 3000;

let btnFire, debugAim, hitboxSwitch, btnReset;

let debugBlockToMeters = false;

function preload() {
    // Load background map
    bgMap = loadImage('/assets/images/map.png');

    // Load friendly unit icon
    friendlyUnitIcon = loadImage('/assets/images/friendly.png');

    // Load enemy icons

    enemyIconsSrc[0] = '/assets/images/infantry.png';
    enemyIconsSrc[1] = '/assets/images/tank.png';
    enemyIconsSrc[2] = '/assets/images/base.png';
    enemyIconsSrc[3] = '/assets/images/truck.png';
    enemyIconsSrc[4] = '/assets/images/apc.png';
    enemyIconsSrc[5] = '/assets/images/outpost.png';
    enemyIconsSrc[6] = '/assets/images/armoredCar.png';
    for(let i = 0; i < enemyIconsSrc.length; i++){
        enemyIcons[i] = loadImage(enemyIconsSrc[i]);
    }

}

function rdm(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawMap() {
    // create a graphics layer for the map grid (optimazation)
    mapGraohics = createGraphics(canvasWidth, canvasHeight);
    mapGraohics.image(bgMap, 0, 0, width, height);
    mapGraohics.fill(0, 0, 0, 100);
    mapGraohics.rect(0, 0, width, height);

    cellW = width / cols;
    cellH = height / rows;

    mapGraohics.stroke(0, 200, 0, 100); 
    mapGraohics.strokeWeight(1);

    // draw vertical lines and X coordinates
    for (let i = 0; i <= cols; i++) {
        let x = i * cellW;
        mapGraohics.line(x, 0, x, height); 
        if (i < cols) {
            mapGraohics.fill(r, g, b); 
            mapGraohics.noStroke();
            mapGraohics.textSize(14);
            mapGraohics.textAlign(CENTER, CENTER);
            mapGraohics.text(i, x + (cellW / 2), 15); 
            mapGraohics.stroke(r, g, b, 100); 
        }
    }

    // draw horizontal lines and Y coordinates
    for (let j = 0; j <= rows; j++) {
        let y = j * cellH;
        mapGraohics.line(0, y, width, y);
        
        if (j < rows) {
            mapGraohics.fill(r, g, b);
            mapGraohics.noStroke();
            mapGraohics.textSize(14);
            mapGraohics.textAlign(CENTER, CENTER);
            
            let letter = String.fromCharCode(65 + j); 
            
            mapGraohics.text(letter, 15, y + (cellH / 2)); 
            mapGraohics.stroke(r, g, b, 100);
        }
    }
}

function showFriendlyUnit() {
    let tColor = color(0, 255, 0);
    tint(tColor);
    imageMode(CENTER);
    image(friendlyUnitIcon, friendlyUnit.X, friendlyUnit.Y, friendlyUnit.iconSize, friendlyUnit.iconSize);
    imageMode(CORNER);
    noTint();

    // hitbox
    if (hitbox) {
        noFill();
        stroke(tColor);
        strokeWeight(1);
        circle(friendlyUnit.X, friendlyUnit.Y, friendlyUnit.radius*2);
        noStroke();
    }

    

}

function showEnemies() {
    for (let e of enemies) {
        imageMode(CENTER);
        image(enemyIcons[e.enemyType], e.X, e.Y, e.iconSize, e.iconSize);
        imageMode(CORNER);

        // hitbox
        if (hitbox) {
            noFill();
            stroke(255,255,255);
            strokeWeight(1);
            circle(e.X, e.Y, e.radius*2);
            noStroke();
        }
    }
}

function calculateAimPosition() {
    currentAngle = document.getElementById('input-x').value;
    currentMil = document.getElementById('input-y').value;

    let barrelAngleRad = currentMil * (Math.PI / 3200);
    let rangeMeters = 2940 * Math.sin(2 * barrelAngleRad);
    let maxPixelRange = dist(aimLineX, aimLineY, 0, 0);
    
    let lineLength = map(rangeMeters, 0, 3000, 0, maxPixelRange);

    let angleRad = radians(currentAngle - 180);

    positionX = aimLineX + cos(angleRad) * lineLength;
    positionY = aimLineY + sin(angleRad) * lineLength;

    let aimX = aimLineX + cos(angleRad) * maxPixelRange;
    let aimY = aimLineY + sin(angleRad) * maxPixelRange;

    stroke(aimLineColor);
    strokeWeight(2);

    drawingContext.setLineDash([10, 10]);
    line(aimLineX, aimLineY, aimX, aimY);
    drawingContext.setLineDash([]);

    if (aimLineDebug) {
        fill(255, 0, 0); 
        noStroke();
        circle(positionX, positionY, 15); 
        
        fill(255);
        textSize(12);
        textAlign(LEFT, BOTTOM);
        text(`px: ${Math.round(positionX)}, ${Math.round(positionY)}`, positionX + 10, positionY - 10);
    }
}

function showExplosions() {
    for(let i = explosions.length - 1; i >= 0; i--){
        let exp = explosions[i];
        noStroke();
        fill(255, 100, 0, exp.alpha);
        circle(exp.x, exp.y, exp.radius * 2);
        exp.alpha -= 5;
        if(exp.alpha <= 0){
            explosions.splice(i, 1);
        }
    }
}

function gameOverHelper() {
    radio.handleMessageOperator(gameOver, "gameOver");
    gameOver = true;
    saveGameState();
}

function showGameOver() {
    btnFire.disabled = true;
    textAlign(CENTER, CENTER);
    textSize(80);
    fill(255, 0, 0);
    text("Game Over", width / 2, height / 2);
    textSize(30);
    fill(255);
    text("Mission Failed! We lost the base.\n Send somethings to reset", width / 2, height / 2 + 60);
}

function impact(targetX, targetY, ammoType) {
    let blastRadius = [15, 30];
    let damage = [100, 40];
    let mis = true;

    // friendly fire
    let d = dist(targetX, targetY, friendlyUnit.X, friendlyUnit.Y);
    if(d < friendlyUnit.radius + blastRadius[ammoType]) {
        mis = false;
        friendlyUnit.takeDamage(damage[ammoType]);
        playerScore -= 500;
        if(friendlyUnit.isDestroyed()) {
            gameOverHelper();
        }
        else {
            radio.handleMessageOperator(gameOver, "friendlyHit");
        }
        // TODO: play explosion sound
    }

    for(let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        let d = dist(targetX, targetY, e.X, e.Y);
        if(d < blastRadius[ammoType] + e.radius) {
            let finalDamage = damage[ammoType] + rdm(0, 20);
            e.takeDamage(finalDamage);
            mis = false;

            if(e.isDestroyed()) {
                playerScore += e.scoreValue;
                radio.handleMessageOperator(gameOver, "enemyDestroyed", e.gridLocation, e.enemyType, e.multiplier);
                enemies.splice(i, 1);

                // show Score
                let scoreText = document.getElementById('txt-score-point');
                scoreText.innerText = playerScore;

                saveGameState();
            }
            else {
                radio.handleMessageOperator(gameOver, "enemyHit", e.gridLocation, e.enemyType, e.multiplier)
                // TODO: explosion Sound
            }
        }
    }
    if(mis) {
        radio.handleMessageOperator(gameOver, "enemyMissShot");
    }

    explosions.push({
        x: targetX,
        y: targetY,
        radius: blastRadius[ammoType],
        alpha: 255
    });
}

function fireArtillery() {

    let selectedAmmo = document.querySelector('input[name="ammoType"]:checked').value;
    let ammoType = parseInt(selectedAmmo);

    let targetX = positionX;
    let targetY = positionY;

    noActionStartTime = millis();

    radio.handleMessageHq("shotFired", null);
    setTimeout(() => {
        radio.handleMessageHq("reloading", null);
    }, 800)

    btnFire.disabled = true;

    setTimeout(() => {
        btnFire.disabled = false;
    }, reloadTime);

    setTimeout(() => {
        impact(targetX, targetY, ammoType);
    }, timeToFlight);
}

function resetGame() {
    localStorage.removeItem('artilleryCommandSave');
    playerScore = 0;
    document.getElementById('txt-score-point').innerText = playerScore;
    gameStarted = false;
    gameOver = false;

    friendlyUnit = new FriendlyUnit(canvasWidth, canvasHeight, cols, rows);
    enemies = [];
    explosions = [];

    radio.clear();

    btnFire.disabled = true;
    saveGameState();

    radio.handleMessageOperator(gameOver, "startGame");
} 

function loadArtilleryTable() {
    // call json file
    fetch('/api/artilleryFireData')
    .then(response => response.json())
    .then(data => {
        let elementTbody = document.getElementById('artillery-table-info');
        if(!elementTbody) return;
        elementTbody.innerHTML = '';
        
        data.artilleryInfo.map((item) => {
            let elementTr = document.createElement('tr');
            elementTr.innerHTML = `
                <td>${item.range}</td>
                <td>${item.mil}</td>
                `;
            elementTbody.appendChild(elementTr);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function laodEnemyTable() {
    let tbody = document.getElementById('enemy-info-table');
    tbody.innerHTML = '';
    for(e of enemies){
        let tr = document.createElement('tr');
        tr.innerHTML = `
        <td><img class="enemy-icon-in-table" src="${enemyIconsSrc[e.enemyType]}" alt="${e.name}"></td>
        <td>${e.gridLocation}</td>
        <td>${e.health}</td>
        <td>${e.size}</td>
        <td>${e.scoreValue}</td>`

        tbody.appendChild(tr);
    }   
}

function sendPalyerMessage() {
    let msg = chatInputElement.value;

    if(msg.trim() != "") {
        let commandResult = radio.handleMessagePlayer(gameOver, msg);

        if(gameOver){
            resetGame();
            chatInputElement.value = "";
            return;
        }

        if(commandResult && !gameOver) {
            if(!gameStarted) {
                gameStarted = true;
                btnFire.disabled = false;
                startTime = millis();
                radio.handleMessageOperator(gameOver, "startedGame"); 
                radio.handleMessageOperator(gameOver, "reportFriendlyLoc", friendlyUnit.gridLocation);
            }
        }
        chatInputElement.value = "";
    }
}

function createEnemy() {
    let enemyRndmType = rdm(0, 6); // Random enemy type between 0 and 6
    let multiplierRndm = rdm(1, 3); // Random multiplier between 1 and 3
    let tmp = new Enemy(canvasWidth, canvasHeight, enemyRndmType, friendlyUnit.X, friendlyUnit.Y, friendlyUnit.radius, multiplierRndm, cols, rows);
    enemies.push(tmp);
    // Operator Log
    radio.handleMessageOperator(gameOver, "enemySpot", tmp.gridLocation, tmp.enemyType, tmp.multiplier);
    delete tmp;
}

function noActionCheck() {
    if(gameStarted && !gameOver) {
        if(millis() - noActionStartTime > noActionTimer) {
            radio.handleMessageOperator(gameOver, "noAction");
            noActionStartTime = millis();
        }
    }
}

function generateEnemies() {
    if(gameStarted && !gameOver) {
        if ((millis() - startTime > rdmTime && !gameOver) || (requestPlayer)) {
            if (enemies.length < limitEnemies) {
                createEnemy();
            }
            startTime = millis(); 
            rdmTime = rdm(minTime, maxTime); // Random time between minTime and maxTime
            requestPlayer = false;
        }
    }
}

function saveGameState() {
    let saveObject = {
        gameStarted: gameStarted,
        gameOver: gameOver,
        score: playerScore,
        healthFr: friendlyUnit.health,
        xFr: friendlyUnit.X,
        yFr: friendlyUnit.Y,
        enemies: enemies.map(e => ({
            type: e.enemyType,
            x: e.X,
            y: e.Y,
            health: e.health,
            multiplier: e.multiplier
        })),
        chatHistory: radio.history 
    };

    // save in local Storage
    localStorage.setItem('artilleryCommandSave', JSON.stringify(saveObject));
}

function loadGameState() {
    let savedData = localStorage.getItem('artilleryCommandSave');
    
    if (savedData) {
        let parsedData = JSON.parse(savedData);

        gameStarted = parsedData.gameStarted;
        gameOver = parsedData.gameOver;       
        playerScore = parsedData.score;
        friendlyUnit.health = parsedData.health;
        friendlyUnit.X = parsedData.xFr;
        friendlyUnit.Y = parsedData.yFr;
        friendlyUnit.calculateGridLocation(canvasWidth, canvasHeight, cols, rows);
        document.getElementById('txt-score-point').innerText = playerScore;
        
        enemies = [];
        for(let e of parsedData.enemies) {
            let newEnemy = new Enemy(canvasWidth, canvasHeight, e.type, friendlyUnit.X, friendlyUnit.Y, friendlyUnit.radius, e.multiplier, cols, rows);
            newEnemy.X = e.x;
            newEnemy.Y = e.y;
            newEnemy.health = e.health;
            newEnemy.calculateGridLocation(canvasWidth, canvasHeight, cols, rows);
            enemies.push(newEnemy);
        }

        radio.loadHistory(parsedData.chatHistory);

        if(gameStarted && !gameOver){
            btnFire.disabled = false;
        }
        console.log("Game loaded successfully.");
        return true;
        
    } 
    else{
        console.log("No save data found in this browser.");
        return false;
    }
}

function setup() {
    // find the container div for the canvas
    container = document.getElementById('canvas-container');
    
    // finding the size of the container to set the canvas size accordingly
    canvasWidth = container.offsetWidth;
    canvasHeight = container.offsetHeight;

    // make canvas - 
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');

    // draw map grid on the graphics layer
    drawMap();

    startTime = millis();
    rdmTime = firstTime;
    noActionStartTime = millis();

    // create friendly units 
    friendlyUnit = new FriendlyUnit(canvasWidth, canvasHeight, cols, rows);

    aimLineX = width / 2;
    aimLineY = height + 300;
    aimLineColor = color(255, 0, 0);

    loadArtilleryTable();

    // btn Fire 
    btnFire = document.getElementById('btn-fire');
    let ammoType = 0;
    if (btnFire) {
        btnFire.addEventListener('click', fireArtillery);
    }
    btnFire.disabled = true; 

    // create radio system with user name
    radio = new RadioSystem("Player"); // TODO: get user name from history.json
    chatInputElement = document.getElementById('chat-input');
    btnSendChatElement = document.getElementById('btn-send');
    radio.loadJsonData().then(() => {
        let saveFound = loadGameState();

        if(!saveFound){
            radio.handleMessageOperator(gameOver, "startGame");
        }
    });

    // switch aim debug line
    debugAim = document.getElementById('switch-debug-aim');
    if(debugAim){
        debugAim.addEventListener('change', function() {
            aimLineDebug = this.checked;
        });
    }

    // switch hitbox
    hitboxSwitch = document.getElementById('switch-hitbox');
    if(hitboxSwitch){
        hitboxSwitch.addEventListener('change', function() {
            hitbox = this.checked;
        });
    }
    
    // btn reset game
    btnReset = document.getElementById('btn-reset-game');
    if (btnReset) {
        btnReset.addEventListener('click', function() {
            resetGame();
        });
    }

    // btn send chat
    if(btnSendChatElement) {
        btnSendChatElement.addEventListener('click', sendPalyerMessage);
    }

    if(chatInputElement) {
        chatInputElement.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendPalyerMessage();
            }
        });
    }

    if(debugBlockToMeters){
        // block 132m and pixel 3.59
        let maxPixelRange = dist(aimLineX, aimLineY, 0, 0);
        let metersPerPixel = 3000 / maxPixelRange;
        let blockMeters = cellW * metersPerPixel;
        console.log(`[SCALE] 1 Pixel = ${metersPerPixel.toFixed(2)} Meters`);
        console.log(`[SCALE] 1 Map Block (${Math.round(cellW)}px) = ${Math.round(blockMeters)} Meters`);
    }

}

function draw() {
    image(mapGraohics, 0, 0);

    calculateAimPosition();

    generateEnemies();
    noActionCheck();

    showFriendlyUnit();
    showEnemies();
    showExplosions();
    laodEnemyTable();

    if(gameOver) {
        showGameOver();
    }

}

function windowResized() {
    // this function is for when the user resizes the browser window
    let container = document.getElementById('canvas-container');
    resizeCanvas(container.offsetWidth, container.offsetHeight);
    drawMap();
    showFriendlyUnit();
    showEnemies();
}

// save when change dir
window.addEventListener("beforeunload", function() {
    saveGameState();
});


// TODO function RESET