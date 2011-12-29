// module:
window.penzilla = window.penzilla || {};
// module level constants
window.penzilla.tank = {
    // keyboard handling:
	KEYCODES: {"LEFT":37,
	           "UP": 38,
	           "RIGHT":39,
			   "DOWN":40,
			   "R":82,
               "S":83,
               "TAB":9},

    // useful sizes:
	SCREEN_WIDTH: 200,
    SCREEN_HEIGHT: 100,
    TANK_WIDTH: 32,
    TANK_HEIGHT: 32,
    TILE_WIDTH: 32,
    TILE_HEIGHT: 32,
    DELTA: 4,

    frameRate: 60
};

// sprite
window.penzilla.tank.Sprite = function(spriteMapName,
                                       xIndex, yIndex,
                                       tileWidth, tileHeight,
                                       xOffset, yOffset,
                                       cbOnload
                                      ) {
	this.init(spriteMapName, xIndex, yIndex,
              tileWidth, tileHeight, xOffset, yOffset,
             cbOnload);
};

window.penzilla.tank.Sprite.prototype.init = function(spriteMapName,
                                                      xIndex, yIndex,
                                                      tileWidth, tileHeight,
                                                      xOffset, yOffset,
                                                      cbOnload) {
	var self = this;
    self.x = 0;
    self.y = 0;
    self.newX = self.x;
    self.newY = self.y;
    self.theta = 0;
    self.newTheta = self.theta;
    self.rotate = false;

    self.spriteMapName = spriteMapName;
    self.xIndex = xIndex;
    self.yIndex = yIndex;
    self.tileWidth = tileWidth;
    self.tileHeight = tileHeight;
    self.xOffset = xOffset;
    self.yOffset = yOffset;
    console.log("cbOnload: " + String(cbOnload));
    self.cbOnload = cbOnload;

    self.img = new Image();
    self.img.src = spriteMapName;
    self.img.onload = function (event) {
        self.cbOnload(event);
    };
};

window.penzilla.tank.Sprite.prototype.setOrigin = function(x, y) {
    var self = this;
    self.x = x;
    self.y = y;
    self.newX = x;
    self.newY = y;
};

window.penzilla.tank.Sprite.prototype.moveTo = function(newX, newY) {
    var self = this;
    self.newX = newX;
    self.newY = newY;
}

window.penzilla.tank.Sprite.prototype.draw = function (ctx) {
    var self = this;
    // Update coordinates based on self.x, self.y, self.newX, self.newY:
    deltaX = self.newX - self.x;
    deltaY = self.newY - self.y;
	if (deltaX < 0) {
		self.x -= 1;
	}
	else if (deltaX > 0) {
		self.x += 1;
	}
	if (deltaY < 0) {
		self.y -= 1;
	}
	else if (deltaY > 0) {
		self.y += 1;
	}

    x = self.x;
    y = self.y;


    //if ((self.newTheta - self.theta) > 0.1) {
    //    rotate = true;
    //    self.theta += Math.PI / 32;
    //}
    if (self.newTheta != self.theta) {
        self.theta = self.newTheta;
        self.rotate = true;
    }

    // this offset calculation is very particular to this specific
    // spritemap for iron brigade.  probably worth factoring
    // out and/or reformatting the spritemap to not have
    // unnecessary space.
    if (self.rotate) {
        // Adjust coordinates for rotation:
        x = self.x - (window.penzilla.tank.TANK_WIDTH / 2);
        y = self.y - (window.penzilla.tank.TANK_HEIGHT / 2);
        ctx.save();
        ctx.translate(self.x, self.y);
        ctx.rotate(self.theta);
	    ctx.drawImage(self.img,
                      (self.xIndex * self.tileWidth) + self.xOffset + (self.xIndex * 1),
                      (self.yIndex * self.tileHeight) + self.yOffset + (self.yIndex * 1),
                      self.tileWidth, self.tileHeight,
                      x, y,
                      self.tileWidth,
                      self.tileHeight);
        ctx.restore();
    }
    else {
	    ctx.drawImage(self.img,
                      (self.xIndex * self.tileWidth) + self.xOffset + (self.xIndex * 1),
                      (self.yIndex * self.tileHeight) + self.yOffset + (self.yIndex * 1),
                      self.tileWidth, self.tileHeight,
                      x, y,
                      self.tileWidth,
                      self.tileHeight);
    }
};

window.penzilla.tank.Sprite.prototype.rotateTank = function () {
    console.log("called rotateTank: " + self.theta + ", " + self.newTheta);
    var self = this;
    // self.newTheta += Math.PI / 8;
};

// game
window.penzilla.tank.Game = function(canvasId) {
    this.init(canvasId);
};

window.penzilla.tank.Game.prototype.init = function(canvasId) {
    var self = this;
    console.log("this:" + String(this) + ":" + canvasId);
    self.canvas = document.getElementById(canvasId);
    console.log("self.canvas:" + String(self.canvas));
    self.ctx = self.canvas.getContext("2d");
    console.log("self.ctx:" + String(self.ctx));
    self.tank1 = new window.penzilla.tank.Sprite(
        "tankbrigade.png", // image file
        15, 3, // index of starting tile
        32, 32, // offset coordinates to first sprite tile
        32, 32, // sprite tile dimensions
        function () {console.log("Loaded image!")}
    );
    self.tank2 = new window.penzilla.tank.Sprite(
        "tankbrigade.png", // image file
        17, 7, // index of starting tile
        32, 32, // offset coordinates to first sprite tile
        32, 32, // sprite tile dimensions
        function () {console.log("Loaded image!")}
    );
    self.tank2.setOrigin(100, 0);
};

window.penzilla.tank.Game.prototype.registerKeyboardEventHandlers = function() {
    var self = this;
  	// register keyboard handler(s):
    var DELTA = window.penzilla.tank.DELTA;
    var TANK_WIDTH = window.penzilla.tank.TANK_WIDTH;
    var TANK_HEIGHT = window.penzilla.tank.TANK_HEIGHT;
    var SCREEN_WIDTH = window.penzilla.tank.SCREEN_WIDTH;
    var SCREEN_HEIGHT = window.penzilla.tank.SCREEN_HEIGHT;

    var tank = self.tank1;
    function switchTank() {
        if (tank === self.tank1) {
            tank = self.tank2;
        }
        else {
            tank = self.tank1;
        }
    };

	$(document).keydown(function (event){
		switch (event.keyCode) {
		case window.penzilla.tank.KEYCODES["LEFT"]:
		    if (tank.x - DELTA >= 0){
		    	tank.newX -= DELTA;
			}
		    break;
		case window.penzilla.tank.KEYCODES["UP"]:
		    if (tank.y - DELTA >= 0) {
		    	tank.newY -= DELTA;
			}
		    break;
		case window.penzilla.tank.KEYCODES["RIGHT"]:
		    if (tank.x + DELTA + TANK_WIDTH <= SCREEN_WIDTH ){
		    	tank.newX += DELTA;
			}
			break;
		case window.penzilla.tank.KEYCODES["DOWN"]:
		    if (tank.y + DELTA + TANK_HEIGHT <= SCREEN_HEIGHT) {
		    	tank.newY += DELTA;
			}
		    break;
		case window.penzilla.tank.KEYCODES["R"]:
		    tank.rotateTank();
		    break;
        case window.penzilla.tank.KEYCODES["S"]:
            switchTank();
            break;
		default:
 			console.log("keyCode: " + String(event.keyCode));
		};
	});
};

window.penzilla.tank.Game.prototype.run = function() {
    var self = this;

    self.registerKeyboardEventHandlers();

	var timeout = 1000.0 / window.penzilla.tank.frameRate;

	function drawLoop(event) {
		self.ctx.fillStyle = "rgb(255,255, 255)";
		self.ctx.fillRect (0, 0,
                      window.penzilla.tank.SCREEN_WIDTH,
                      window.penzilla.tank.SCREEN_HEIGHT);
        self.tank1.draw(self.ctx);
        self.tank2.draw(self.ctx);
	};

	function abortTimer() {
	    clearInterval(loopTimer);
	};

    var loopTimer = setInterval(drawLoop, timeout);
};
