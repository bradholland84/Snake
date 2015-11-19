Document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    //either WebGL or Canvas renderer, depending on support
    var r = PIXI.autoDetectRenderer(500, 500);
    r.backgroundColor = 0x3498db;

    //adds canvas to HTML body
    document.body.appendChild(r.view);

    //Creates main stage for display objects
    var stage = new PIXI.Container();

    // Start animating
    animate();

    function animate() {
        requestAnimationFrame(animate);

        // Render our container
        renderer.render(stage);
    }
});