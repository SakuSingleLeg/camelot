// Function to get a shape by ID
function getShapeById(id) {
    return stage.children.find(shape => shape._id === id);
}

function isMouseOver(sprite, mouse) {
    return (
        mouse.x >= sprite.translation.x - sprite.width / 2 &&
        mouse.x <= sprite.translation.x + sprite.width / 2 &&
        mouse.y >= sprite.translation.y - sprite.height / 2 &&
        mouse.y <= sprite.translation.y + sprite.height / 2
    );
}

//FPS COUNTER
let SHOW_FPS = userConfig.show_fps ?? false;
if (SHOW_FPS) {
    $(document).ready(function () {
        console.log("counting all of the frames ...");

        let lastLoop = performance.now();
        let frameTimes = [];
        const smoothingWindow = 30; // Number of frames to average

        function updateFPS() {
            let now = performance.now();
            let deltaTime = now - lastLoop;
            lastLoop = now;

            let currentFPS = 1000 / deltaTime;
            frameTimes.push(currentFPS);

            if (frameTimes.length > smoothingWindow) {
                frameTimes.shift(); // Remove oldest entry to maintain window size
            }

            let smoothedFPS = Math.round(
                frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
            );

            $("#fps-counter").text("FPS: " + smoothedFPS);

            requestAnimationFrame(updateFPS);
        }

        requestAnimationFrame(updateFPS);
    });
};