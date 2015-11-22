document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    //either WebGL or Canvas renderer, depending on support
    var r = PIXI.autoDetectRenderer(500, 500);
    r.backgroundColor = 0x3498db;


    //adds canvas to HTML body
    document.body.appendChild(r.view);

    //Creates main stage for display objects
    var stage = new PIXI.Container();
    //main sprite objects
    var state;
    var sprite = new PIXI.Sprite.fromImage('img/sprite.png');
    var apple = new PIXI.Sprite.fromImage('img/apple.png');

    function setupGame(stage) {
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        apple.anchor.x = 0.5;
        apple.anchor.y = 0.5;

        sprite.vx = 0;
        sprite.vy = 0;

        sprite.position.x = r.width / 2;
        sprite.position.y = r.height / 2;

        apple.position.x = Math.random() * r.height;
        apple.position.y = Math.random() * r.width;

        stage.addChild(sprite);
        stage.addChild(apple);

        var left = keyboard(37),
            up = keyboard(38),
            right = keyboard(39),
            down = keyboard(40);


        //Left arrow key `press` method
        left.press = function() {

            //Change the cat's velocity when the key is pressed
            sprite.vx = -5;
            sprite.vy = 0;
        };

        //Left arrow key `release` method
        left.release = function() {

            //If the left arrow has been released, and the right arrow isn't down,
            //and the cat isn't moving vertically:
            //Stop the cat
            if (!right.isDown && sprite.vy === 0) {
                sprite.vx = 0;
            }
        };

        //Up
        up.press = function() {
            sprite.vy = -5;
            sprite.vx = 0;
        };
        up.release = function() {
            if (!down.isDown && sprite.vx === 0) {
                sprite.vy = 0;
            }
        };

        //Right
        right.press = function() {
            sprite.vx = 5;
            sprite.vy = 0;
        };
        right.release = function() {
            if (!left.isDown && sprite.vy === 0) {
                sprite.vx = 0;
            }
        };

        //Down
        down.press = function() {
            sprite.vy = 5;
            sprite.vx = 0;
        };
        down.release = function() {
            if (!up.isDown && sprite.vx === 0) {
                sprite.vy = 0;
            }
        };

        state = play;
        animate();
    }

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
        sprite.x += sprite.vx;
        sprite.y += sprite.vy;

        if (hitTestRectangle(sprite, apple)) {
            r.backgroundColor = 0x4598dc;
        }
    }


    //set up game
    setupGame(stage);

    function animate() {
        requestAnimationFrame(animate);

        state();

        // Render our container
        r.render(stage);
    }
});