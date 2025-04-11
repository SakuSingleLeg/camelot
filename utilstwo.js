//function used for smoothing transition animation
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

//function to get a shape by ID
function getShapeById(id) {
    return stage.children.find(shape => shape._id === id);
}

//checks if mouse is currently within bounds of a two.js object
function isMouseOver(obj, mouse) {
    const buffer = 5; // padding for easier clicking
  
    let width = 0;
    let height = 0;
  
    // Handle Text
    if (obj._renderer.type === 'text') {
      width = obj.value.length * obj.size * 0.6; // rough width estimate
      height = obj.size;
    }
  
    // Handle Sprite
    else if (obj._renderer.type === 'sprite') {
      width = obj.width;
      height = obj.height;
    }
  
    // Optional fallback if you use rects or other shapes
    else if (obj.width && obj.height) {
      width = obj.width;
      height = obj.height;
    }
  
    const x = obj.translation.x - width / 2 - buffer;
    const y = obj.translation.y - height / 2 - buffer;
  
    return (
      mouse.x >= x &&
      mouse.x <= x + width + buffer * 2 &&
      mouse.y >= y &&
      mouse.y <= y + height + buffer * 2
    );
}
  
//fps counter
let SHOW_FPS = userConfig.show_fps ?? false;
if (SHOW_FPS) {
    $(document).ready(function () {
        console.log("Counting all of the frames...");

        let lastLoop = performance.now();
        let frameTimes = [];
        const smoothingWindow = 30; //number of frames to average

        function updateFPS() {
            let now = performance.now();
            let deltaTime = now - lastLoop;
            lastLoop = now;

            let currentFPS = 1000 / deltaTime;
            frameTimes.push(currentFPS);

            if (frameTimes.length > smoothingWindow) {
                frameTimes.shift(); //remove oldest entry to maintain size
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