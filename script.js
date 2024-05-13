const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startPos = [6, 13];
let player = {
    x: startPos[0],
    y: startPos[1],
    platformMoved: false
}
let inputDelay = 0;

const numRows = 13;
const numCols = 13;
const DelayTime = 5;

const Colors = {
    platform: "#c7735e",
    river: "navy",
    road: "black",
    safe: "purple",
    end: "green",
    car: "red"
}

// Images
const IMG_Frog = document.getElementById("frog");

function resetPlayer(){
    player.x = startPos[0];
    player.y = startPos[1];
}

/**
 * ===== FINISH =====  Row 0
 * 5 lanes of water    Row 1,2,3,4,5
 * ==== SAFE ROW ====  Row 6
 * 5 lanes of cars     Row 7,8,9,10,11
 * ==== SAFE ROW ===== Row 12
 * 
 * The game has 13 rows, 13 columns
 */

/**
 * Each car has the following properties:
 * position: [x,y]
 * eastBound: true/false
 * speed: (a number)
 */
let cars = [];
let safePlatforms = [];
const platformWidth = 2;
// Safe platforms have a width of 2

let keys = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowUp: false,
    ArrowDown: false
}

window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {
    canvas.width = window.innerWidth - 5;
    canvas.height = window.innerHeight - 5;
}
resizeCanvas(); // initialize canvas size

function drawBoard() {
    let blockSize = Math.min(canvas.width / numCols, canvas.height / numRows);

    // background for road
    ctx.fillStyle = Colors.road;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // background for safe lanes
    ctx.fillStyle = Colors.safe;
    ctx.fillRect(0, blockSize * 6, canvas.width, blockSize);
    ctx.fillRect(0, blockSize * 12, canvas.width, blockSize);

    // background for river
    ctx.fillStyle = Colors.river;
    ctx.fillRect(0, blockSize * 1, canvas.width, blockSize * 5);

    // background for end bank
    ctx.fillStyle = Colors.end;
    ctx.fillRect(0, 0, canvas.width, blockSize * 1);

    renderCars(blockSize);
    renderPlatforms(blockSize);

    ctx.drawImage(IMG_Frog, player.x * blockSize, player.y * blockSize, blockSize, blockSize);

    ctx.clearRect(blockSize * numCols, 0, canvas.width, canvas.height);
}

function renderCars(size) {
    for (let i = 0; i < cars.length; i++) {
        let car = cars[i];
        ctx.fillStyle = Colors.car;
        ctx.fillRect(car.pos[0] * size, car.pos[1] * size, size, size);
    }
}

/**
 * @param objects an array of cars or safe platforms
 * @returns true if a given object collides with player, false otherwise
 */
function checkCollision(objects, length) {
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i].pos;

        let sameRow = Math.abs(object[1] - player.y) <= 0.5 ? true : false;
        let sameCol = (player.x + 1 >= object[0] && player.x <= (object[0] + length)) ? true : false;
        if (sameRow && sameCol) {
            return true;
        }
    }
    return false;
}

function renderPlatforms(size) {
    for (let i = 0; i < safePlatforms.length; i++) {
        let platform = safePlatforms[i];
        ctx.fillStyle = Colors.platform;
        ctx.fillRect(platform.pos[0] * size, platform.pos[1] * size, size * platform.width, size);
    }
}

function moveCars() {
    for (let i = 0; i < cars.length; i++) {
        let x = cars[i].pos[0];
        let direc = 1;
        if (cars[i].eastBound == false) {
            direc = -1;
        }
        cars[i].pos = [x += direc * cars[i].speed, cars[i].pos[1]];
        if (cars[i].pos[0] > numCols) {
            cars[i].pos[0] = -1;
        }
        if (cars[i].pos[0] < -1) {
            cars[i].pos[0] = numCols;
        }
    }
}

function movePlatforms() {
    for (let i = 0; i < safePlatforms.length; i++) {
        let x = safePlatforms[i].pos[0];
        let direc = 1;
        if (safePlatforms[i].eastBound == false) {
            direc = -1;
        }
        safePlatforms[i].pos = [x += direc * safePlatforms[i].speed, safePlatforms[i].pos[1]];

        // the frog is touching the platform
        if(!player.platformMoved && checkCollision([safePlatforms[i]], 2) == true){
            player.x += direc * safePlatforms[i].speed;
            player.platformMoved = true;
        }

        if (safePlatforms[i].pos[0] > numCols) {
            safePlatforms[i].pos[0] = -2;
        }
        if (safePlatforms[i].pos[0] < -2) {
            safePlatforms[i].pos[0] = numCols;
        }
    }
}

/**
 * Initialize all of the cars on the board
 */
function initCars() {
    // create a bunch of cars on rows 1-5
    for (let row = 11; row > 6; row--) {
        let rowSpeed = 0.1 + Math.random() * 0.2;
        let numCarsInRow = 3;
        // row 8 has only one car at a fast speed
        if (row == 8) {
            numCarsInRow = 1;
            rowSpeed = 0.5;
        }
        for (let i = 0; i < numCarsInRow; i++) {
            let xpos = Math.floor(Math.random() * 13);
            let eastb = true;
            if (row % 2 == 0) {
                eastb = false;
            }
            cars.push({
                pos: [xpos, row],
                eastBound: eastb,
                speed: rowSpeed
            });
        }
    }
}

/**
 * Initialize all of the logs in the game
 */
function initPlatforms() {
    // create a bunch of platforms size 2 on rows 1-5
    for (let row = 5; row > 0; row--) {
        let rowSpeed = 0.1 + Math.random() * 0.2;
        let numCarsInRow = 2;
        for (let i = 0; i < numCarsInRow; i++) {
            let xpos = Math.floor(Math.random() * 13);
            let eastb = true;
            if (row % 2 == 0) {
                eastb = false;
            }
            safePlatforms.push({
                pos: [xpos, row],
                eastBound: eastb,
                speed: rowSpeed,
                width: 2
            });
        }
    }

}


// initialize cars and platforms
initCars();
initPlatforms();
function gameLoop() {
    console.log("Game loop working");
    if (inputDelay <= 0) {
        movePlayer();
    }
    checkPlayerEdge();
    inputDelay--;
    moveCars();
    movePlatforms();
    player.platformMoved = false;

    // check for collisions
    let carColl = checkCollision(cars, 1);
    if(carColl){
        resetPlayer(); // send player back to start
    }

    drawBoard();
}

let gameInterval = setInterval(gameLoop, 50);

/**
 * Keyboard input
 */
document.addEventListener("keydown", keyDownFunction);

document.addEventListener("keyup", keyUpFunction);

function keyDownFunction(evt) {
    switch (evt.key) {
        case "ArrowRight":
            keys.ArrowRight = true;
            break;
        case "ArrowLeft":
            keys.ArrowLeft = true;
            break;
        case "ArrowUp":
            keys.ArrowUp = true;
            break;
        case "ArrowDown":
            keys.ArrowDown = true;
            break;
    }
}

function keyUpFunction(evt) {
    switch (evt.key) {
        case "ArrowRight":
            keys.ArrowRight = false;
            break;
        case "ArrowLeft":
            keys.ArrowLeft = false;
            break;
        case "ArrowUp":
            keys.ArrowUp = false;
            break;
        case "ArrowDown":
            keys.ArrowDown = false;
            break;
    }

}

function movePlayer() {
    if (keys.ArrowRight) {
        player.x += 1;
        inputDelay = DelayTime;
    }
    if (keys.ArrowLeft) {
        player.x -= 1;
        inputDelay = DelayTime;
    }
    if (keys.ArrowUp) {
        player.y -= 1;
        inputDelay = DelayTime;
    }
    if (keys.ArrowDown) {
        player.y += 1;
        inputDelay = DelayTime;
    }
}

function checkPlayerEdge() {
    player.x = Math.max(0, Math.min(player.x, numCols - 1));
    player.y = Math.max(0, Math.min(player.y, numRows - 1));
}