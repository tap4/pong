/*  
 */
    "use strict";

/* jshint browser: true, devel: true, globalstrict: true */

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");

/*
0        1         2         3         4         5         6         7         8         9
123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// =================
// KEYBOARD HANDLING
// =================

var g_keys = [];
var g_slowBallUpdate = false;
var g_finalScore1=0;
var g_finalScore2=0;
var g_winner = "none";

function handleKeydown(evt) {
    g_keys[evt.keyCode] = true;
}

function handleKeyup(evt) {
    g_keys[evt.keyCode] = false;
}

// Inspects, and then clears, a key's state
//
// This allows a keypress to be "one-shot" e.g. for toggles
// ..until the auto-repeat kicks in, that is.
//
function eatKey(keyCode) {
    var isDown = g_keys[keyCode];
    g_keys[keyCode] = false;
    return isDown;
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);

// ============
// PADDLE STUFF
// ============

// COMMON PADDLE STUFF

// A generic contructor which accepts an arbitrary descriptor object
function Paddle(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
}

// Add these properties to the prototype, where they will serve as
// shared defaults, in the absence of an instance-specific overrides.

Paddle.prototype.halfWidth = 10;
Paddle.prototype.halfHeight = 50;

Paddle.prototype.update = function () {
    
    //Enables paddle movement to the right, if within 100-pixel margin
    if (g_keys[this.GO_RIGHT]) 
    {
        if ((this.cx + this.halfWidth) <= 95 || (this.cx >= 300 && this.cx + this.halfWidth <= 395)) 
        {this.cx += 5;}
    }
    
    //Enables paddle mov't to left, if within 100-pixel margin
    if (g_keys[this.GO_LEFT]) 
    {
        if ((this.cx - this.halfWidth >= 5 && (this.cx - this.halfWidth) <= 100) || (this.cx >= 305)) 
        {this.cx -= 5;}
    }
    
    //Enables paddle mov't up, if within canvas frame
    if (g_keys[this.GO_UP]) 
    {
        if (this.cy > this.halfHeight) 
        {this.cy -= 5;}
    } 
    //Enables paddle mov't down, if within canvas frame
    else if (g_keys[this.GO_DOWN]) 
    {
        if (this.cy < g_canvas.height - this.halfHeight) this.cy += 5;
    }
};

Paddle.prototype.render = function (ctx) 
{
    ctx.fillStyle = this.color;
    //Enable temporary color change if ball made contact with this paddle
    if (this.colorChange === true)
    { ctx.fillStyle = this.alternateColor;
     this.colorClock =++ this.colorClock;
    }
    ctx.fillRect(this.cx - this.halfWidth,
    this.cy - this.halfHeight,
    this.halfWidth * 2,
    this.halfHeight * 2);
    ctx.strokeStyle = this.outlineColor;
    ctx.strokeRect(this.cx - this.halfWidth,
    this.cy - this.halfHeight,
    this.halfWidth * 2,
    this.halfHeight * 2);
    //Limit the length of time for the paddle color change
    if (this.colorClock > 4)
        {this.colorClock = 0;
         this.colorChange = false;
        }
};

Paddle.prototype.collidesWith = function (prevX, prevY,
nextX, nextY,
r) {
    var paddleEdge = this.cx;
    // Check X coords
    if ((nextX - r < paddleEdge && prevX - r >= paddleEdge) || (nextX + r > paddleEdge && prevX + r <= paddleEdge)) {
        // Check Y coords
        if (nextY + r >= this.cy - this.halfHeight && nextY - r <= this.cy + this.halfHeight) {
            // It's a hit!
            this.colorChange = true;
            return true;
        }
    }
    // It's a miss!
    return false;
};

// PADDLE 1

var KEY_W = 'W'.charCodeAt(0);
var KEY_S = 'S'.charCodeAt(0);
var KEY_A = 'A'.charCodeAt(0);
var KEY_D = 'D'.charCodeAt(0);

var g_paddle1 = new Paddle({
    cx: 30,
    cy: 100,
    color: "blue",
    alternateColor: "aqua",
    outlineColor: "black",
    colorChange: false,
    colorClock: 0,

    GO_UP: KEY_W,
    GO_DOWN: KEY_S,
    GO_LEFT: KEY_A,
    GO_RIGHT: KEY_D,

    SCORE: 0
});

// PADDLE 2

var KEY_I = 'I'.charCodeAt(0);
var KEY_K = 'K'.charCodeAt(0);
var KEY_J = 'J'.charCodeAt(0);
var KEY_L = 'L'.charCodeAt(0);

var g_paddle2 = new Paddle({
    cx: 370,
    cy: 300,
    color: "green",
    alternateColor: "lime",
    outlineColor: "black",
    colorChange: false,
    colorClock: 0,

    GO_UP: KEY_I,
    GO_DOWN: KEY_K,
    GO_RIGHT: KEY_L,
    GO_LEFT: KEY_J,
    SCORE: 0
});

//Usage: w = p.getScoreWidth(ctx);
//Before: p is a paddle, ctx is a context
//After: w is the width of text if this p's score were written on ctx
Paddle.prototype.getScoreWidth = function (ctx)
{   
    return ctx.measureText(this.SCORE).width;
};

//Usage: drawScoreBoard();
//After: 2 score boxes and scores have been centered and written to the top of canvas
function drawScoreBoard() {
    g_ctx.fillStyle = "black";
    g_ctx.font = "bold 40px Arial";
    var halfWidth1 = g_paddle1.getScoreWidth(g_ctx)/2;
    var halfWidth2 = g_paddle2.getScoreWidth(g_ctx)/2;
    g_ctx.fillStyle = "blue";
    g_ctx.fillRect(95-halfWidth1,15, 2*halfWidth1+10, 45);
    g_ctx.fillStyle = "green";
    g_ctx.fillRect(295-halfWidth2,15, 2*halfWidth2+10, 45);
    g_ctx.fillStyle = "aqua";
    g_ctx.fillText(g_paddle1.SCORE, 100-halfWidth1, 50);
    g_ctx.fillStyle = "lime";
    g_ctx.fillText(g_paddle2.SCORE, 300-halfWidth2, 50);
     g_ctx.strokeStyle = "black";
    g_ctx.strokeRect(295-halfWidth2,15, 2*halfWidth2+10, 45);
    g_ctx.strokeRect(95-halfWidth1,15, 2*halfWidth1+10, 45);
}

//Usage: drawColorWalls(x, c, s)
//Before: x is a context, c is a string and valid JS color name, s is an integer
//After: A rectangle of width s is drawn and painted the color c
function drawColorWalls(ctx, color, score)
{
    g_ctx.fillStyle = color;
    if (color === "aqua")
    {
        g_ctx.fillRect(0,0,score*2,400);
    }
    if (color === "lime")
    {
        g_ctx.fillRect(400-(score*2),0,score*2,400);
    }
}

//Usage: drawBackground();
//After: scoreboard, colorwalls, and team messages have been drawn to canvas
function drawBackground() {
    if (g_paddle1.SCORE + g_paddle2.SCORE < 200)
    {
    drawColorWalls(g_ctx,"aqua",g_paddle1.SCORE);
    drawColorWalls(g_ctx, "lime", g_paddle2.SCORE);
    writeTeamMessages("white","white");
    }
    
    if (g_paddle1.SCORE + g_paddle2.SCORE === 200)
    {
     g_finalScore1 = g_paddle1.SCORE;
     g_finalScore2 = g_paddle2.SCORE;
        if (g_finalScore1>g_finalScore2) {g_winner="blue";}
        if (g_finalScore1<g_finalScore2) {g_winner="green";}
        if (g_finalScore1 === g_finalScore2) {g_winner= "tie";}
        drawColorWalls(g_ctx,"aqua",g_finalScore1);
        drawColorWalls(g_ctx, "lime", g_finalScore2);
        if (g_winner === "blue") {writeTeamMessages("blue","lime");}
        if (g_winner === "green") {writeTeamMessages("aqua", "green");}
        if (g_winner === "tie") {writeTeamMessages("blue","green");}
    }
    
     if (g_paddle1.SCORE + g_paddle2.SCORE >200)
    {
        drawColorWalls(g_ctx,"aqua",g_finalScore1);
        drawColorWalls(g_ctx, "lime", g_finalScore2);
        if (g_winner === "blue") {writeTeamMessages("blue","lime");}
        if (g_winner === "green") {writeTeamMessages("aqua", "green");}
        if (g_winner === "tie") {writeTeamMessages("blue","green");}
    }
}

//Usage: writeTeamMessages(a, b)
//Before: a and b are strings, and valid JS color names
//After: Team messages have been written to canvas in appropriate color
function writeTeamMessages(color1, color2)
{
    var blueWidth = getTextWidth(g_ctx, "BLUE");
    var rulesWidth = getTextWidth(g_ctx,"RULES!");
    var goWidth = getTextWidth(g_ctx, "GO");
    var greenWidth = getTextWidth(g_ctx, "GREEN!");
    if (g_winner !== "green")
    {
    g_ctx.fillStyle= color1;
    g_ctx.fillText("BLUE",100-(blueWidth/2),200);
    g_ctx.fillText("RULES!",100-(rulesWidth/2),250);
    }
    if (g_winner !== "blue")
    {
    g_ctx.fillStyle = color2;
    g_ctx.fillText("GO", 300-(goWidth/2),200);
    g_ctx.fillText("GREEN!", 300-(greenWidth/2),250);
    }
}

//Usage: w = getTextWidth(x, t)
//Before: x is a canvas, t is a string
//After: w is the length of t if it were written to x
function getTextWidth(ctx, text)
{   
    return ctx.measureText(text).width;
}

// ==========
// BALL STUFF
// ==========

// BALL STUFF

function Ball(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
}

Ball.prototype.radius = 10;

var g_ballFast = new Ball({
    cx: 50,
    cy: 200,
    xVel: 5,
    yVel: 4
});

var g_ballSlow = new Ball({
    cx: 150,
    cy: 200,
    xVel: 5,
    yVel: 4
});

Ball.prototype.update = function () {
    // Remember my previous position
    var prevX = this.cx;
    var prevY = this.cy;

    // Compute my provisional new position (barring collisions)
    var nextX = prevX + this.xVel;
    var nextY = prevY + this.yVel;

    // Bounce off the paddles
    if (g_paddle1.collidesWith(prevX, prevY, nextX, nextY, this.radius) || g_paddle2.collidesWith(prevX, prevY, nextX, nextY, this.radius)) {
        this.xVel *= -1;
    }

    // Bounce off top and bottom edges
    if (nextY < 0 || // top edge
    nextY > g_canvas.height) { // bottom edge
        this.yVel *= -1;
    }


    if (nextX < 0) {
        this.xVel *= -1;
        g_paddle2.SCORE += 1;
    }
    if (nextX > g_canvas.width) {
        this.xVel *= -1;
        g_paddle1.SCORE += 1;
    }

    // *Actually* update my position 
    // ...using whatever velocity I've ended up with
    //
    this.cx += this.xVel;
    this.cy += this.yVel;
};

Ball.prototype.render = function (ctx) {  
    ctx.fillStyle = "black";
    fillCircle(ctx, this.cx, this.cy, this.radius);
    ctx.fill();   
};

// =====
// UTILS
// =====

function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function fillCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}

// =================
// UPDATE SIMULATION
// =================

function updateSimulation() {
    if (shouldSkipUpdate()) return;
    g_ballFast.update();
    //Manipulate slowBalls ability to update, cutting its speed in half.
    if (g_slowBallUpdate === true) {
        g_ballSlow.update();
    }
    g_slowBallUpdate = !g_slowBallUpdate;
    g_paddle1.update();
    g_paddle2.update();
  }

// Togglable Pause Mode
//
var KEY_PAUSE = 'P'.charCodeAt(0);
var KEY_STEP = 'O'.charCodeAt(0);

var g_isUpdatePaused = false;

function shouldSkipUpdate() {
    if (eatKey(KEY_PAUSE)) {
        g_isUpdatePaused = !g_isUpdatePaused;
    }
    return g_isUpdatePaused && !eatKey(KEY_STEP);
}

// =================
// RENDER SIMULATION
// =================

function renderSimulation(ctx) {
    clearCanvas(ctx);
    drawBackground();
    drawScoreBoard();

    g_ballFast.render(ctx);
    g_ballSlow.render(ctx);

    g_paddle1.render(ctx);
    g_paddle2.render(ctx);
}

// ========
// MAINLOOP
// ========

function mainIter() {
    if (!requestedQuit()) {
        gatherInputs();
        updateSimulation();
        renderSimulation(g_ctx);
    } else {
        window.clearInterval(intervalID);
    }
}


// HELPER FUNCTIONS

function fillEllipse(ctx, cx, cy, halfWidth, halfHeight, angle) {
    ctx.save(); // save the current ctx state, to restore later
    ctx.beginPath();

    // These "matrix ops" are applied in last-to-first order
    // ..which can seem a bit weird, but actually makes sense
    //
    // After modifying the ctx state like this, it's important
    // to restore it
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(halfWidth, halfHeight);

    // Just draw a unit circle, and let the matrices do the rest!
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath(); // reset to an empty path
    ctx.restore();
}


// Simple voluntary quit mechanism
//
var KEY_QUIT = 'Q'.charCodeAt(0);

function requestedQuit() {
    return g_keys[KEY_QUIT];
}

// ..and this is how we set it all up, by requesting a recurring periodic
// "timer event" which we can use as a kind of "heartbeat" for our game.
//
var intervalID = window.setInterval(mainIter, 16.666);

//window.focus();