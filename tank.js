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
    self.visible = true;

    self.tiles = [{x:0, y:0},
                  {x:1, y:0},
                  {x:2, y:0}];
    self.step = 0;

    self.spriteMapName = spriteMapName;
    self.xIndex = xIndex;
    self.yIndex = yIndex;
    self.tileWidth = tileWidth;
    self.tileHeight = tileHeight;
    self.xOffset = xOffset;
    self.yOffset = yOffset;
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
        if (self.visible) {
            xIndex = self.xIndex;
            yIndex = self.yIndex;

            if (self.step > 0) {
                if (self.step <= 40) {
                    xIndex = self.tiles[0].x;
                    yIndex = self.tiles[0].y;
                } else if (self.step <= 80) {
                    xIndex = self.tiles[1].x;
                    yIndex = self.tiles[1].y;
                } else {
                    xIndex = self.tiles[2].x;
                    yIndex = self.tiles[2].y;
                }
            }

	        ctx.drawImage(self.img,
                          (xIndex * self.tileWidth) + self.xOffset + (xIndex * 1),
                          (yIndex * self.tileHeight) + self.yOffset + (yIndex * 1),
                          self.tileWidth, self.tileHeight,
                          x, y,
                          self.tileWidth,
                          self.tileHeight);
        }
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
    self.canvasId = canvasId;
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
    self.crosshair = new window.penzilla.tank.Sprite(
        "crosshair.png",
        0, 0,
        32, 32,
        0, 0,
        function () {console.log("Loaded image!")}
    );

    self.tank2.setOrigin(100, 0);
    self.crosshair.setOrigin(50, 50);
    self.crosshair.visible = false;

    self.sprites = [];
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

    $(self.canvasId).mousemove(function (e) {
        el = $(self.canvasId);
        x = e.pageX - el.offset().left - (window.penzilla.tank.TILE_WIDTH / 2);
        y = e.pageY - el.offset().top - (window.penzilla.tank.TILE_HEIGHT / 2);
        self.crosshair.moveTo(x, y);
    });
    $(self.canvasId).mouseover(function (e) {
        self.crosshair.visible = true;
    });
    $(self.canvasId).mouseout(function (e) {
        self.crosshair.visible = false;
    });
    $(self.canvasId).mousedown(function (e) {
        el = $(self.canvasId);
        x = e.pageX - el.offset().left - (window.penzilla.tank.TILE_WIDTH / 2);
        y = e.pageY - el.offset().top - (window.penzilla.tank.TILE_HEIGHT / 2);

        var sprite = new window.penzilla.tank.Sprite("tankbrigade.png",
                                                            0, 0,
                                                            32, 32,
                                                            32, 32,
                                                     function(e) {});
        sprite.setOrigin(x, y);
        self.sprites.push(sprite);
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
        self.crosshair.draw(self.ctx);

        var i = 0;
        while (i < self.sprites.length) {
            var sprite = self.sprites[i];
            sprite.step += 1;
            sprite.draw(self.ctx);

            if (sprite.step >= 120) {
                /* Remove the image from the list */
                self.sprites = self.sprites.slice(0, i).concat(self.sprites.slice(i+1));
            } else {
                i += 1;
            }
        }

	};

	function abortTimer() {
	    clearInterval(loopTimer);
	};

    var loopTimer = setInterval(drawLoop, timeout);
};
