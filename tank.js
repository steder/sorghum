function initialize_tanks() {
	  var KEYCODES = {"LEFT":37,
	                  "UP": 38,
	                  "RIGHT":39,
				      "DOWN":40};

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
	  	ctx.drawImage(img, TANK_X, TANK_Y);			
	  };
	  img.src = "tank.png";

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
		ctx.drawImage(img, TANK_X, TANK_Y);
	  };
	
	  var loopTimer = setInterval(drawLoop, timeout);
	
	  function abortTimer() {
	    clearInterval(loopTimer);	
	  };
};