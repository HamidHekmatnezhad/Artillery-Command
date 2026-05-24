let canvasWidth, canvasHeight;
let gridSize = 50; // size of each grid cell in pixels

let cols = 20;
let rows = 20;

let r = 0;
let g = 255;
let b = 0;

let bgMap;

function preload() {
    bgMap = loadImage('/assets/images/map.png');
}

function setup() {
    // find the container div for the canvas
    let container = document.getElementById('canvas-container');
    
    // finding the size of the container to set the canvas size accordingly
    canvasWidth = container.offsetWidth;
    canvasHeight = container.offsetHeight;

    // make canvas
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
}

function draw() {
    if (bgMap) {
        image(bgMap, 0, 0, width, height);
    }
    else {
        background(26, 26, 26);
    }
    

    fill(0, 0, 0, 100);
    rect(0, 0, width, height);

    let cellW = width / cols;
    let cellH = height / rows;

    stroke(0, 200, 0, 100); 
    strokeWeight(1);

    // draw vertical lines and X coordinates
    for (let i = 0; i <= cols; i++) {
        let x = i * cellW;
        line(x, 0, x, height); 
        if (i < cols) {
            fill(r, g, b); 
            noStroke();
            textSize(14);
            textAlign(CENTER, CENTER);
            text(i, x + (cellW / 2), 15); 
            stroke(r, g, b, 100); 
        }
    }

    // draw horizontal lines and Y coordinates
    for (let j = 0; j <= rows; j++) {
        let y = j * cellH;
        line(0, y, width, y);
        
        if (j < rows) {
            fill(r, g, b);
            noStroke();
            textSize(14);
            textAlign(CENTER, CENTER);
            
            let letter = String.fromCharCode(65 + j); 
            
            text(letter, 15, y + (cellH / 2)); 
            stroke(r, g, b, 100);
        }
    }
}

// this function is for when the user resizes the browser window
function windowResized() {
    let container = document.getElementById('canvas-container');
    resizeCanvas(container.offsetWidth, container.offsetHeight);
}