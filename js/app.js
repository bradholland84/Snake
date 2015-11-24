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
    var snake = [];

    //put images into texture cache
    PIXI.loader
        .add('img/square.png')
        .load(setupSprites);

    //makes random point on the map
    var applePoint = new PIXI.Point(
        getRandomIntInclusive(0, 19),
        getRandomIntInclusive(0, 19)
    );

    //main game state
    var state = begin;

    //main sprite object that serves as player pointer
    var sprite;
    function setupSprites() {
        //adds tile sprites to stage
        timer = 0;
        snake = [{x: 10, y: 10}];
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

        //set up game
        setupGame(stage);
    }

    //sets up the game with sprite positions
    function setupGame(stage) {
        document.getElementById('score').innerHTML = "" + (snake.length - 1);
        sprite = new PIXI.Sprite();
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        sprite.vx = 0;
        sprite.vy = -20;

        sprite.position.x = r.width / 2;
        sprite.position.y = r.height / 2;

        // player-controlled pointer is invisible
        sprite.alpha = 0;
        stage.addChild(sprite);

        var left = keyboard(37),
            up = keyboard(38),
            right = keyboard(39),
            down = keyboard(40),
            enter = keyboard(13),
            rkey = keyboard(82);

        //Left arrow key `press` method
        left.press = function() {
            //Change the sprite's velocity when the key is pressed
            sprite.vx = -20;
            sprite.vy = 0;
        };

        //Up
        up.press = function() {
            sprite.vy = -20;
            sprite.vx = 0;
        };

        //Right
        right.press = function() {
            sprite.vx = 20;
            sprite.vy = 0;
        };

        //Down
        down.press = function() {
            sprite.vy = 20;
            sprite.vx = 0;
        };

        //R
        rkey.press = function() {
            location.reload();
        };

        //enter
        enter.press = function() {
            if (state == begin || state == lose) {
                state = play;
                setupSprites();
            }
        };

        //begin main animation loop
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

    //checks to see if the two sprite parameters are touching
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

    //main game logic
    function play() {
        //make the apple a different color
        var apple = map.tileSprites[applePoint.x][applePoint.y];
        apple.tint =  0xffff1a;

        // Restrict game speed
        if (timer > 15) {
            //update snake segment positions
            updateSnake(apple);

            //reset the timer to 0
            timer = 0;
        } else {
            timer ++;
        }
    }

    //player lost the game, stops play
    function lose() {
        timer = 0;
        var text = new PIXI.Text("Game Over! \n Press Enter to increase difficulty \n Press R to restart" , {font:"24px Arial", fill: "red", align: 'center'});
        for (var i = stage.children.length - 1; i >= 0; i--) {
            stage.removeChild(stage.children[i]);
        }
        stage.addChild(text);
    }

    //wait for player to begin game
    function begin() {
        var text = new PIXI.Text(" Press Enter to Begin \n Use arrow keys to move", {font:"30px Arial", fill: "white"});
        stage.addChild(text);
    }

    //main animation loop
    function animate() {
        requestAnimationFrame(animate);
        state();
        // Render our container
        r.render(stage);
    }

    //updates snake on screen
    function updateSnake(apple) {
        // create a new object representing the snake head
        var newHead = {
            x: snake[0].x + sprite.vx / 20,
            y: snake[0].y + sprite.vy / 20
        };

        // Make sure the snake doesn't try to eat itself
        ateSelf(newHead);

        if (snake[0].x * 20 > r.width ||
            snake[0].y * 20 > r.height ||
            snake[0].x * 20 < 0 ||
            snake[0].y * 20 < 0) {
            // player went out of bounds or they tried to eat themselves
            state = lose;
        } else {
            snake.unshift(newHead);
            map.tileSprites[newHead.x][newHead.y].tint = 0xff00ff;

            //check to see if the snake ate an apple, if so: keep the last segment
            if (hitTestRectangle(map.tileSprites[newHead.x][newHead.y], apple)) {
                document.getElementById('score').innerHTML = "" + (snake.length - 1);
                newApple();
            } else {
                var lastSegment = snake.pop();
                //remove tint of the last segment
                map.tileSprites[lastSegment.x][lastSegment.y].tint = 0xFFFFFF;
            }

            //now tint the snake segments
            snake.forEach(function(segment) {
                map.tileSprites[segment.x][segment.y].tint = 0xff00ff;
            });
        }
    }

    //generates new apple in  random position
    function newApple() {
        map.tileSprites[applePoint.x][applePoint.y].tint = 0xFFFFFF;
        map.tileSprites[applePoint.x][applePoint.y].tint = 0xff00ff;

        applePoint = new PIXI.Point(
            getRandomIntInclusive(0, 19),
            getRandomIntInclusive(0, 19)
        );

        // If the apple is going to be inside a space occupied by the snake, try again
        snake.forEach(function(segment) {
            if (applePoint.x == segment.x && applePoint.y == segment.y) {
                newApple();
            }
        });
    }

    //check if the snake is trying to eat itself
    function ateSelf(head) {
        snake.forEach(function(segment) {
           if (head.x == segment.x && head.y == segment.y) {
               state = lose;
               return true;
           }
        });
        return false;
    }

    // Returns a random integer between min (included) and max (included)
    function getRandomIntInclusive(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
});