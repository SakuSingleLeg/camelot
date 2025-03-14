
//MENU BTNS
const mainMenuDiv = document.getElementById('mainMenuDiv');
const loadingDiv = document.getElementById('loadingDiv');
const menuClouds = document.getElementById('menuClouds');
const newMapRandomBtn = document.getElementById('mainmenu_newMapRandom');
const newMapSeededBtn = $('#mainmenu_newMapSeeded');
const newMapSeededInput = $('#mainmenu_mapSeed');
const newMapSeededBtn2 = $('#mainmenu_newMapSeeded2');

newMapRandomBtn.addEventListener('click', () => {
    const startTime = performance.now();
    console.log("Height Seed: " + MAP_SEED);
    loadingDiv.removeAttribute('hidden')
    mainMenuDiv.setAttribute('hidden', 'true')
    fadeToBlack();

    setTimeout(() => {
        menuClouds.setAttribute('hidden', 'true')
        buildGrid(MAP_SEED).then(function () {
            // wait for UI to update, then run buildGrid (so that 'loading...' shows)
            setTimeout(() => {
                    // add Zoom User Interface (ZUI) and record how long all this takes
                    addZUI();
                    setTimeout(() => { 
                        const endTime = performance.now();
                        console.log(`buildGrid+friends execution time: ${(endTime - startTime).toFixed(2)} ms`);
                        fadeToNormal();
                        $("#loadingDiv").attr("hidden", "true");
                    }, 1000);   
            }, 1);   
        });        
    }, 3000);
});

newMapSeededBtn.on("click", function () {
    console.log("New Map (Seeded) clicked");
    // unhide seed options
    newMapSeededInput.show();
    newMapSeededBtn2.show();
});
newMapSeededBtn2.on("click", function () {    
    const startTime = performance.now();
    console.log("Height Seed: " + MAP_SEED);
    loadingDiv.removeAttribute('hidden')
    mainMenuDiv.setAttribute('hidden', 'true')
    fadeToBlack();

    setTimeout(() => {
        let seedValue = parseInt(newMapSeededInput.val(), 10);
        menuClouds.setAttribute('hidden', 'true')
        buildGrid(seedValue).then(function (){     
            // Wait for UI to update, then run buildGrid (so that 'loading...' shows)
            setTimeout(() => {
                    // Add Zoom User Interface (ZUI) and record how long all this takes
                    addZUI();
                    setTimeout(() => { 
                        const endTime = performance.now();
                        console.log(`buildGrid+friends execution time: ${(endTime - startTime).toFixed(2)} ms`);
                        fadeToNormal();
                        $("#loadingDiv").attr("hidden", "true");
                    }, 1000);   
            }, 1);   
        });        
    }, 3000);
});


//suppress ctrl+mousewheel scroll b/c its weird with ZUI zoom is mixed with this
document.addEventListener("wheel", function(event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }, { passive: false });

//TRACK MOOSE POSITION
window.addEventListener('pointermove', (event) => {
    cursorPosition.textContent = `X: ${event.clientX}, Y: ${event.clientY}`;
}, false);
document.addEventListener("mouseout", function (event) {
    $("#tooltip-position").hide();
    //removeUI(); // TODO: handle ui on mouseout
});

// Listen for window resize
window.addEventListener('resize', updateUIPositions);

var zui = null;
var domElement = null;
//ZUI STAGE INPUT HANLDING
function addZUI() {  
    zui = new Two.ZUI(stage);
    domElement = two.renderer.domElement;
    var mouse = new Two.Vector();
    var touches = {};
    var distance = 0;
    var dragging = false;
    var lastElement;
    
    //set intiial zoom + limits //TODO: add pan limits
    zui.addLimits(1.4, 2.4);
    setTimeout(() => {
        zui.zoomBy(.5, GRID_X_SIZE*HEX_SIZE, GRID_Y_SIZE*HEX_SIZE);
    }, 10);

    //draw static ui
    drawUILeft();

    //KEYBOARD INPUT
    window.addEventListener('keydown', function(e) {
        e = e || window.event;
        switch (e.key) {
            case "d":
                //show debug menu - dont enable this until we load zui - otherwise it trigger in main menu
                if (!SHOW_DEBUG) {
                debug_hex_group.visible = false;
                colour_hex_group.visible = true;
                }
                else {
                debug_hex_group.visible = true;
                colour_hex_group.visible = false;
                }
        
                SHOW_DEBUG = !SHOW_DEBUG;
                two.update();      
                break;
            case "down":
                zui.translateSurface(0, -100);  
                break;
        }
    }, false);

    //MEESES
    domElement.addEventListener('mouseover', mouseover, false);
    domElement.addEventListener('mousedown', mousedown, false);
    domElement.addEventListener('mousewheel', mousewheel, false);
    domElement.addEventListener('wheel', mousewheel, false);


    //MOOSE OVER
    function mouseover(e) {
        let elem = stage.children.find(shape => shape._id === e.target.id);
    
        // Ignore elements that should not capture events
        if (elem && elem.noPointerEvents) return;

        //TODO: methinks dis borken
        if (lastElement) {
            $("#tooltip-position").hide();
            // ui.remove();
        }
    
        if (elem) {
            $("#tooltip-position").show();
            let gridX = elem.gridX !== undefined ? elem.gridX : "?";
            let gridY = elem.gridY !== undefined ? elem.gridY : "?";
            let fillColor = elem.fill || "Unknown";    
            hexPosition.textContent = `(${gridX}, ${gridY}) ${fillColor}`;

            lastElement = elem;
            
            $("#tooltip-position")
                .text(elem.desc)
                .css({
                    "left": event.pageX + "px",
                    "top": event.pageY + "px",
                    "display": "block"
            });

            fillColor = HEX_ARR[gridX][gridY].colour;

            //update ui to reflect what has been moused over       
            if (elem.isHex) {
                drawUIBottom(gridX, gridY, fillColor);
            }
            else {
                removeUIBottom();
            }
            if (somethingSelected) {
                drawUIRight(selectedTileTxt);
            }
            drawUILeft();
        }
        else {
            drawUILeft();
            removeUIBottom();
            console.log("elems not here man");
        }
    }


    //MOOSE DOWN
    function mousedown(e) {
        console.log("mouse clicked on element");
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        //check if menu btns clicked - if click is inside sprite bounds
        if (
            mouse.x  >= bgSpriteLeft1.translation.x - bgSpriteLeft1.width / 2 &&
            mouse.x  <= bgSpriteLeft1.translation.x + bgSpriteLeft1.width / 2 &&
            mouse.y >= bgSpriteLeft1.translation.y - bgSpriteLeft1.height / 2 &&
            mouse.y <= bgSpriteLeft1.translation.y + bgSpriteLeft1.height / 2
        ) {
            console.log("bgSpriteLeft1 clicked, reloading page");
            // 'return' to main menu when clicked
            quitToMenu();
        }

        window.addEventListener('mousemove', mousemove, false);
        window.addEventListener('mouseup', mouseup, false);

        let elem = stage.children.find(shape => shape._id === e.target.id);
    
        // ignore elements that should not capture events
        if (elem && elem.noPointerEvents) return;
    
        if (elem) {
            if (elem.clickable) {
                console.log("somethingSelected = true");
                somethingSelected = true;  
                selectedTileTxt = elem.desc;
                drawUIRight(elem.desc);
            }
            else {
                somethingSelected = false;
                console.log("somethingSelected = false");
                removeUIRight();
            }
        }
    }


    //MOOSE MOVE
    function mousemove(e) {
        var dx = e.clientX - mouse.x;
        var dy = e.clientY - mouse.y;
        $("#tooltip-position").hide();
        zui.translateSurface(dx, dy);           
        ui.remove();
        mouse.set(e.clientX, e.clientY);
    }


    //MOOSE UP
    function mouseup(e) {
        // drawUILeft();
        ui.add();
        window.removeEventListener('mousemove', mousemove, false);
        window.removeEventListener('mouseup', mouseup, false);   
    }


    //MOOSE WHEEL
    function mousewheel(e) {
      var dy = (e.wheelDeltaY || - e.deltaY) / 1000;
      zui.zoomBy(dy, e.clientX, e.clientY);
    }

    //UNUSED INPUT METHODS
    // domElement.addEventListener('touchstart', touchstart, false);
    // domElement.addEventListener('touchmove', touchmove, false);
    // domElement.addEventListener('touchend', touchend, false);
    // domElement.addEventListener('touchcancel', touchend, false);

    // function touchstart(e) {
    //   switch (e.touches.length) {
    //     case 2:
    //       pinchstart(e);
    //       break;
    //     case 1:
    //       panstart(e)
    //       break;
    //   }
    // }

    // function touchmove(e) {
    //   switch (e.touches.length) {
    //     case 2:
    //       pinchmove(e);
    //       break;
    //     case 1:
    //       panmove(e)
    //       break;
    //   }
    // }

    // function touchend(e) {
    //   touches = {};
    //   var touch = e.touches[ 0 ];
    //   if (touch) {  // Pass through for panning after pinching
    //     mouse.x = touch.clientX;
    //     mouse.y = touch.clientY;
    //   }
    // }

    // function panstart(e) {
    //   var touch = e.touches[ 0 ];
    //   mouse.x = touch.clientX;
    //   mouse.y = touch.clientY;
    // }

    // function panmove(e) {
    //   var touch = e.touches[ 0 ];
    //   var dx = touch.clientX - mouse.x;
    //   var dy = touch.clientY - mouse.y;
    //   zui.translateSurface(dx, dy);
    //   mouse.set(touch.clientX, touch.clientY);
    // }

    // function pinchstart(e) {
    //   for (var i = 0; i < e.touches.length; i++) {
    //     var touch = e.touches[ i ];
    //     touches[ touch.identifier ] = touch;
    //   }
    //   var a = touches[ 0 ];
    //   var b = touches[ 1 ];
    //   var dx = b.clientX - a.clientX;
    //   var dy = b.clientY - a.clientY;
    //   distance = Math.sqrt(dx * dx + dy * dy);
    //   mouse.x = dx / 2 + a.clientX;
    //   mouse.y = dy / 2 + a.clientY;
    // }

    // function pinchmove(e) {
    //   for (var i = 0; i < e.touches.length; i++) {
    //     var touch = e.touches[ i ];
    //     touches[ touch.identifier ] = touch;
    //   }
    //   var a = touches[ 0 ];
    //   var b = touches[ 1 ];
    //   var dx = b.clientX - a.clientX;
    //   var dy = b.clientY - a.clientY;
    //   var d = Math.sqrt(dx * dx + dy * dy);
    //   var delta = d - distance;
    //   zui.zoomBy(delta / 250, mouse.x, mouse.y);
    //   distance = d;
    // }    
}

function quitToMenu() {
    console.log("quitToMenu()");
    fadeToBlack();
    setTimeout(() => {
        location.reload();
    }, 2000);
}