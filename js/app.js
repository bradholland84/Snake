document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    //either WebGL or Canvas renderer, depending on support
    var r = PIXI.autoDetectRenderer(400, 400);
    r.backgroundColor = 0x061639;

    //adds canvas to HTML body
    document.body.appendChild(r.view);

    //Creates main stage for display objects
    var stage = new PIXI.Container();

    //timer that restricts movement speed
    var timer = 0;

    //holds 2-dimensional array of sprites
    var map = {};

    //snake array containing tiles, head starts at center
    var snake = [
        {
            x: 10,
            y: 10
        }
    ];

    //position of fruit
    var fruit = {
        x: 5,
        y: 5
    };

    //put images into texture cache
    PIXI.loader
        .add('img/square.png')
        .add('img/sprite.png')
        .load(setupSprites);

    //makes random point on the map
    var applePoint = new PIXI.Point(
        getRandomIntInclusive(0, 19),
        getRandomIntInclusive(0, 19)
    );

    //main game state
    var state;
    //main sprite objects
    var sprite;
    function setupSprites() {

        map.tileSprites = [];
        var x;
        var y;
        var texture = PIXI.loader.resources['img/square.png'].texture;
        for (x = 0; x < r.width / 20; x ++) {
            map.tileSprites.push([]);
            for (y = 0; y < r.height / 20; y ++) {
                var sq = new PIXI.Sprite(texture);
                sq.position.x = x * 20;
                sq.position.y = y * 20;
                map.tileSprites[x].push(sq);
                stage.addChild(sq);
            }
        }

        console.log(map.tileSprites);
        //set up game
        setupGame(stage);
    }


    //sets up the game with sprite positions
    function setupGame(stage) {
        sprite = new PIXI.Sprite(PIXI.loader.resources['img/sprite.png'].texture);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        sprite.vx = 0;
        sprite.vy = -20;

        sprite.position.x = r.width / 2;
        sprite.position.y = r.height / 2;

        sprite.alpha = 0;
        stage.addChild(sprite);

        var left = keyboard(37),
            up = keyboard(38),
            right = keyboard(39),
            down = keyboard(40);


        //Left arrow key `press` method
        left.press = function() {

            //Change the sprite's velocity when the key is pressed
            sprite.vx = -20;
            sprite.vy = 0;
        };

        //Left arrow key `release` method
        left.release = function() {

            //If the left arrow has been released, and the right arrow isn't down,
            //and the sprite isn't moving vertically:
            //Stop the sprite
            if (!right.isDown && sprite.vy === 0) {
                //sprite.vx = 0;
            }
        };

        //Up
        up.press = function() {
            sprite.vy = -20;
            sprite.vx = 0;
        };
        up.release = function() {
            if (!down.isDown && sprite.vx === 0) {
                //sprite.vy = 0;
            }
        };

        //Right
        right.press = function() {
            sprite.vx = 20;
            sprite.vy = 0;
        };
        right.release = function() {
            if (!left.isDown && sprite.vy === 0) {
                //sprite.vx = 0;
            }
        };

        //Down
        down.press = function() {
            sprite.vy = 20;
            sprite.vx = 0;
        };
        down.release = function() {
            if (!up.isDown && sprite.vx === 0) {
                //sprite.vy = 0;
            }
        };

        state = play;
        animate();
    }

    //defines keyboard pressing actions
    function keyboard(keyCode) {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

    //checks to see if the two parameters are touching
    function hitTestRectangle(r1, r2) {

        //Define the variables we'll need to calculate
        var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

        //hit will determine whether there's a collision
        hit = false;

        //Find the center points of each sprite
        r1.centerX = r1.x + r1.width / 2;
        r1.centerY = r1.y + r1.height / 2;
        r2.centerX = r2.x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;

        //Find the half-widths and half-heights of each sprite
        r1.halfWidth = r1.width / 2;
        r1.halfHeight = r1.height / 2;
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;

        //Calculate the distance vector between the sprites
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;

        //Figure out the combined half-widths and half-heights
        combinedHalfWidths = r1.halfWidth + r2.halfWidth;
        combinedHalfHeights = r1.halfHeight + r2.halfHeight;

        //Check for a collision on the x axis
        if (Math.abs(vx) < combinedHalfWidths) {

            //A collision might be occuring. Check for a collision on the y axis
            if (Math.abs(vy) < combinedHalfHeights) {

                //There's definitely a collision happening
                hit = true;
            } else {

                //There's no collision on the y axis
                hit = false;
            }
        } else {

            //There's no collision on the x axis
            hit = false;
        }

        //`hit` will be either `true` or `false`
        return hit;
    }
    function play() {

        var apple = map.tileSprites[applePoint.x][applePoint.y];

        if (timer > 20) {
            //update snake segment positions
            updateSnake(apple);
            //console.log(snake);
            //reset the timer to 0
            timer = 0;
        } else {
            timer ++;
        }

        //tint the apple
        apple.tint =  0xffff1a;


    }

    function stop() {
        var text = new PIXI.Text("Game Over", {font:"50px Arial", fill: "red"});
        stage.addChild(text);
    }

    //animation loop
    function animate() {
        requestAnimationFrame(animate);

        state();

        // Render our container
        r.render(stage);
    }

    function updateSnake(apple) {


        if (snake[0].x * 20 > r.width ||
            snake[0].y * 20 > r.height ||
            snake[0].x * 20 < 0 ||
            snake[0].y * 20 < 0) {
            state = stop;
        } else {
            // create a new object representing the snake head
            var newHead = {
                x: snake[0].x + sprite.vx / 20,
                y: snake[0].y + sprite.vy / 20
            };

            snake.unshift(newHead);
            map.tileSprites[newHead.x][newHead.y].tint = 0xff00ff;

            //check to see if the snake ate an apple, if so: keep the last segment
            if (hitTestRectangle(map.tileSprites[newHead.x][newHead.y], apple)) {
                console.log('hit');
                console.log("length of snake is now: " + snake.length);
                newApple();
            } else {
                var lastSegment = snake.pop();
                //remove tint of the last segment
                map.tileSprites[lastSegment.x][lastSegment.y].tint = 0xFFFFFF;
                //snake did not eat an apple.

            }

            //tint the snake segments
            snake.forEach(function(segment) {
                map.tileSprites[segment.x][segment.y].tint = 0xff00ff;
            });

        }



    }

    function newApple() {
        map.tileSprites[applePoint.x][applePoint.y].tint = 0xFFFFFF;
        map.tileSprites[applePoint.x][applePoint.y].tint = 0xff00ff;

        applePoint = new PIXI.Point(
            getRandomIntInclusive(0, 19),
            getRandomIntInclusive(0, 19)
        );
    }


    // Returns a random integer between min (included) and max (included)
    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});