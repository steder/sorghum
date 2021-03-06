/*
  TODO: Priority is to get gameplay concepts:
  + get shooting working; click left mouse and a shell is fired
  from your tank towards where the mouse click occured.
  The shot can either go off screen or explode when it reaches the crosshair.  I don't hink it matters too much which way as long as the shots start at the tank.
  + add a second tank and get collisions between tanks and shells
  + friendly fire is probably okay actually, especially with ricochets.
    (I think it could be cool to have people fire shots at a weird angle
     and be killed by the ricochet.)
 */

var gamejs = require('gamejs');


var Crosshair = function(startX, startY, width, height) {
    Crosshair.superConstructor.apply(this, arguments);
    this.originalImage = gamejs.image.load("images/crosshair.png");

    this.startX = startX;
    this.x = startX;
    this.startY = startY;
    this.y = startY;
    this.maxSpeed = 16;
    this.minSpeed = 4;
    this.speed = this.minSpeed;

    this.rotation = 15;

    var dims = this.originalImage.getSize();
    //this.originalImage = gamejs.transform.scale(this.originalImage,
      //                                             [dims[0] * 0.5,
        //                                           dims[1] * 0.5]);
    this.image = this.originalImage;

    this.originalRect = new gamejs.Rect(this.x, this.y, width, height);
    this.rect = this.originalRect;
    return this;
};
// this sets the prototype of Crosshair to sprite
// and is necessary for the superconstructor magic above.
gamejs.utils.objects.extend(Crosshair, gamejs.sprite.Sprite);
Crosshair.prototype.update = function(msDuration) {
    // deltas are useful for figuring out whether to move
    // and sign indicates direction (up, down, left, right)
    var deltaX = (this.x - this.startX);
    var deltaY = (this.y - this.startY);

    // distance is used to adjust speed, if we're very close
    // we may want to reduce speed slightly and move in
    // smoother increments
    // TODO: tweak this to make it feel responsive
    // minSpeed should be greater than 1
    var distance = (deltaX * deltaX) + (deltaY * deltaY);

    if (distance < (this.maxSpeed * this.maxSpeed)) {
        this.speed = this.minSpeed;
    }
    else {
        this.speed = this.maxSpeed;
    }

    // adjust the speeds so that you don't overshoot on the X
    // or Y axis and then have to readjust:
    // This allows a speed greater than 1 to work and still
    // move the crosshair to the exact coordinate of the
    // cursor.
    var absDeltaX = Math.abs(deltaX);
    var absDeltaY = Math.abs(deltaY);
    var speedX = absDeltaX > this.speed && this.speed || absDeltaX;
    var speedY = absDeltaY > this.speed && this.speed || absDeltaY;

    var moveX = 0, moveY = 0;

    if (deltaX < 0) {
        this.startX -= speedX;
        moveX -= speedX;
    }
    else if (deltaX > 0) {
        this.startX += speedX;
        moveX += speedX;
    }
    if (deltaY < 0) {
        this.startY -= speedY;
        moveY -= speedY;
    }
    else if (deltaY > 0) {
        this.startY += speedY;
        moveY += speedY;
    }

    this.rect.moveIp(moveX, moveY);

    //if ((this.rotation + 30) % 90 !== 0) {
    //this.image = gamejs.transform.rotate(this.originalImage, this.rotation + 30);
    //} else {
    this.image = this.originalImage;
    //}

    this.rotation = this.rotation + 60;
};

// Tank:
var Tank = function(x, y, width, height) {
    Crosshair.superConstructor.apply(this, arguments);

    this.startX = x;
    this.x = x;
    this.startY = y;
    this.y = y;

    this.speed = 4;
    this.xSpeed = 0;
    this.ySpeed = 0;

    this.originalImage = gamejs.image.load("images/tank.png");
    this.image = this.originalImage;

    this.rect = new gamejs.Rect(this.x, this.y, width, height);
    return this;
};
gamejs.utils.objects.extend(Tank, gamejs.sprite.Sprite);
Tank.prototype.update = function(msDuration) {
    this.rect.moveIp(this.xSpeed, this.ySpeed);
};


function main() {
    var display = gamejs.display.setMode([800, 600]);

    // display silly hello world message once:
    display.blit(
        (new gamejs.font.Font('30px Sans-serif')).render('Hello World')
    );

    gamejs.display.setCaption("Tanks! Crosshair testing...");

    var mainSurface = gamejs.display.getSurface();
    var displayRect = display.rect;

    var crosshair = new Crosshair(100, 100, 32, 32);
    var tank = new Tank(200, 200, 32, 32);

    function tick(msDuration) {
        mainSurface.fill("#FFFFFF");

        // handle key / mouse events
        gamejs.event.get().forEach(function(event) {
            if (event.type === gamejs.event.KEY_DOWN) {
                // increase tank speeds: (pressing down on throttle pedal)
                if (tank.xSpeed === 0) {
                    if (event.key === gamejs.event.K_LEFT) {
                        tank.xSpeed -= tank.speed;
                    } else if (event.key === gamejs.event.K_RIGHT) {
                        tank.xSpeed += tank.speed;
                    }
                }
                if (tank.ySpeed === 0) {
                    if (event.key === gamejs.event.K_UP)  {
                        tank.ySpeed -= tank.speed;
                    } else if (event.key === gamejs.event.K_DOWN) {
                        tank.ySpeed += tank.speed;
                    }
                }
            } else if (event.type === gamejs.event.KEY_UP) {
                // reduce tank speeds: (releasing throttle)
                if (tank.xSpeed !== 0) {
                    if (event.key === gamejs.event.K_LEFT) {
                        tank.xSpeed += tank.speed;
                    } else if (event.key === gamejs.event.K_RIGHT) {
                        tank.xSpeed -= tank.speed;
                    }
                }
                if (tank.ySpeed !== 0) {
                    if (event.key === gamejs.event.K_UP)  {
                        tank.ySpeed += tank.speed;
                    } else if (event.key === gamejs.event.K_DOWN) {
                        tank.ySpeed -= tank.speed;
                    }
                }
            } else if (event.type === gamejs.event.MOUSE_MOTION) {
                // if mouse is over display surface
                if (displayRect.collidePoint(event.pos)) {
                    crosshair.x = event.pos[0] - 16;
                    crosshair.y = event.pos[1] - 16;
                }
            }
        });

        // Update Sprites:
        crosshair.update(msDuration);
        tank.update(msDuration);

        // Draw Sprites:
        crosshair.draw(mainSurface);
        tank.draw(mainSurface);
    };

    // 30 frames a second?
    gamejs.time.fpsCallback(tick, this, 30);
};


/* Main */
gamejs.preload(['images/crosshair.png',
                'images/tank.png']);
gamejs.ready(main);