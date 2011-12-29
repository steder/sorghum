// module:
window.penzilla = window.penzilla || {};
// module level constants
window.penzilla.tank = {
    // keyboard handling:
	KEYCODES: {"LEFT":37,
	           "UP": 38,
	           "RIGHT":39,
			   "DOWN":40,
			   "R":82},

    // useful sizes:
	WIDTH: 200,
    HEIGHT: 100,
    TANK_WIDTH: 32,
    TANK_HEIGHT: 32,
    TILE_WIDTH: 32,
    TILE_HEIGHT: 32,

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
    self.x = x;
    self.y = y;
};

window.penzilla.tank.Sprite.prototype.draw = function (ctx) {
    var self = this;
    console.log("draw image - xIndex: " + String(self.xIndex));
    console.log("draw image - yIndex: " + String(self.yIndex));
    console.log("draw image - tileWidth: " + String(self.tileWidth));
    console.log("draw image - tileHeight: " + String(self.tileHeight));
    console.log("draw image - x: " + String(self.x));
    console.log("draw image - y: " + String(self.y));
    // this offset calculation is very particular to this gpl'd
    // spritemap for iron brigade.  probably worth factoring
    // out and/or reformatting the spritemap to not have
    // unnecessary space.
	ctx.drawImage(self.img,
                  (self.xIndex * self.tileWidth) + self.xOffset + (self.xIndex * 1),
                  (self.yIndex * self.tileHeight) + self.yOffset + (self.yIndex * 1),
                  self.tileWidth, self.tileHeight,
                  self.x, self.y,
                  self.tileWidth,
                  self.tileHeight);
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
};

window.penzilla.tank.Game.prototype.run = function() {
    var self = this;

	var timeout = 1000.0 / window.penzilla.tank.frameRate;

	function drawLoop(event) {
		self.ctx.fillStyle = "rgb(255,255, 255)";
		self.ctx.fillRect (0, 0,
                      window.penzilla.tank.WIDTH,
                      window.penzilla.tank.HEIGHT);
        tank.draw(self.ctx);
	};

	function abortTimer() {
	    clearInterval(loopTimer);
	};

	//var loopTimer = setInterval(drawLoop, timeout);

    var tank = new window.penzilla.tank.Sprite(
        "tankbrigade.png", // image file
        15, 3, // index of starting tile
        32, 32, // offset coordinates to first sprite tile
        32, 32, // sprite tile dimensions
        drawLoop
    );
};


function initialize_tanks() {
	  var WIDTH = 200;
	  var HEIGHT = 100;

      var TANK_WIDTH = 32;
      var TANK_HEIGHT = 32;
	  var TANK_X = 0;
	  var TANK_Y = 0;
	  var NEW_X = TANK_X;
	  var NEW_Y = TANK_Y;
      var DELTA = 4;

	  console.log("Loading tanks...");
	  var c = document.getElementById("canvas");
	  var ctx = c.getContext("2d");
	  var img = new Image();
	  img.onload = function () {
		// drawImage(img, dx, dy)
		// drawImage(img, dx, dy, width, height)
		// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
		ctx.drawImage(img, 32, 32, TANK_WIDTH, TANK_HEIGHT, 0, 0, TANK_WIDTH, TANK_HEIGHT);
	  };

	  img.src = "tankbrigade.png";

	  function rotateTank() {
		console.log("Rotating tank...")
		//ctx.save()
		ctx.translate(TANK_X, TANK_Y);
		ctx.rotate(Math.PI/2); // rotate 90 degrees
		//ctx.restore();
      }

	  // register keyboard handler(s):
	  $(document).keydown(function (event){
		switch (event.keyCode) {
		  case KEYCODES["LEFT"]:
		    if (TANK_X - DELTA >= 0){
		    	NEW_X -= DELTA;
			}
		    break;
		  case KEYCODES["UP"]:
		    if (TANK_Y - DELTA >= 0) {
		    	NEW_Y -= DELTA;
			}
		    break;
		  case KEYCODES["RIGHT"]:
		    if (TANK_X + DELTA + TANK_WIDTH <= WIDTH ){
		    	NEW_X += DELTA;
			}
			break;
		  case KEYCODES["DOWN"]:
		    if (TANK_Y + DELTA + TANK_HEIGHT <= HEIGHT) {
		    	NEW_Y += DELTA;
			}
		    break;
		  case KEYCODES["R"]:
		    rotateTank();
		    break;
		  default:
 			console.log("keyCode: " + String(event.keyCode));
		}
	  });

	  // Setup Graphics Loop:
	  var frameRate = 60;
	  var timeout = 1000.0 / frameRate;
	  function drawLoop() {
		ctx.fillStyle = "rgb(255,255, 255)";
		ctx.fillRect (0, 0, WIDTH, HEIGHT);
		DELTA_X = NEW_X - TANK_X;
		DELTA_Y = NEW_Y - TANK_Y;

		if (DELTA_X < 0) {
			TANK_X -= 1;
		}
		else if (DELTA_X > 0) {
			TANK_X += 1;
		}
		if (DELTA_Y < 0) {
			TANK_Y -= 1;
		}
		else if (DELTA_Y > 0) {
			TANK_Y += 1;
		}
		//ctx.drawImage(img, TANK_X, TANK_Y);
		ctx.drawImage(img, 32, 32, TANK_WIDTH, TANK_HEIGHT, 0, 0, TANK_WIDTH, TANK_HEIGHT);
	  };

	  var loopTimer = setInterval(drawLoop, timeout);

	  function abortTimer() {
	    clearInterval(loopTimer);
	  };
};