
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
                setTimeout(() => { 
                    const endTime = performance.now();
                    startNewGame();
                    addZUI();
                    fadeToNormal();
                    $("#loadingDiv").attr("hidden", "true");
                    console.log(`buildGrid+friends execution time (with delays): ${(endTime - startTime).toFixed(2)} ms`);
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
                setTimeout(() => {
                    const endTime = performance.now();
                    startNewGame();
                    addZUI();
                    fadeToNormal();
                    $("#loadingDiv").attr("hidden", "true");
                    console.log(`buildGrid+friends execution time: ${(endTime - startTime).toFixed(2)} ms`);
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

//TRACK MOOSE POSITION (if debugging)
if (SHOW_DEBUG_OVERLAY) {
    window.addEventListener('pointermove', (event) => {
        cursorPositionDiv.textContent = `X: ${event.clientX}, Y: ${event.clientY}`;
        spriteCountDiv.textContent = `Total Sprites: ${stage.children.length}`;
    }, false);
    document.addEventListener("mouseout", function (event) {
        $("#tooltip-position").hide();
    });
}

// Listen for window resize
window.addEventListener('resize', updateUIPositions);

var zui = null;
var domElement = null;
var showDebugTiles = false;
//ZUI STAGE INPUT HANLDING
function addZUI() {  
    zui = new Two.ZUI(stage);
    domElement = two.renderer.domElement;
    var mouse = new Two.Vector();
    var touches = {};
    var distance = 0;
    var dragging = false;
    let lastElement = null;
    
    //set intiial zoom + limits //TODO: add pan limits
    zui.addLimits(1.8, 2.6);
    setTimeout(() => {
        zui.zoomBy(.7, GRID_X_SIZE*HEX_SIZE, GRID_Y_SIZE*HEX_SIZE);
    }, 10);

    //draw static ui
    drawUITop();
    drawUILeft();

    //KEYBOARD INPUT
    window.addEventListener('keydown', function(e) {
        e = e || window.event;
        switch (e.key) {
            case "d":
                //show debug menu - dont enable this until we load zui - otherwise it trigger in main menu
                if (!showDebugTiles) {
                    debug_hex_group.visible = false;
                    colour_hex_group.visible = true;
                }
                else {
                    debug_hex_group.visible = true;
                    colour_hex_group.visible = false;
                }
        
                showDebugTiles = !showDebugTiles;
                two.update();      
                break;
            case "down":
                zui.translateSurface(0, -100);  
                break;
        }
    }, false);

    //MEESES
    domElement.addEventListener('mouseover', throttledMouseover, false);
    domElement.addEventListener('mousedown', mousedown, false);
    domElement.addEventListener('mousewheel', mousewheel, false);
    domElement.addEventListener('wheel', mousewheel, false);
    const tooltip = $("#tooltip-position");
    let lastMouseMove = 0;

    //MOOSE OVER
    function mouseover(e) {
        if (!isDialogOpen) {
            let elem = stage.children.find(shape => shape._id === e.target.id);
    
            if (lastElement === elem) return;  // Prevent redundant updates
            lastElement = elem;
    
            // Ignore elements that should not capture events
            if (elem && elem.noPointerEvents) return;
        
            if (elem) {
                tooltip.show();
                let gridX = elem.gridX !== undefined ? elem.gridX : -1;
                let gridY = elem.gridY !== undefined ? elem.gridY : -1;
                let fillColor = elem.fill || "Unknown";    
                hexPositionDiv.textContent = `(${gridX}, ${gridY}) Depth: ${elem.depth}`;
    
                lastElement = elem;
                
                tooltip
                    .text(elem.desc)
                    .css({
                        "left": event.pageX + "px",
                        "top": event.pageY + "px",
                        "display": "block"
                });
    
                if (HEX_ARR[gridY] !== undefined) {
                    fillColor = HEX_ARR[gridY][gridX].colour;
    
                    //update ui to reflect what has been moused over       
                    if (elem.isHex) {
                        drawUIBottom(gridX, gridY, fillColor, elem.path);
                    }
                    else {
                        removeUIBottom();
                    }
                }
                else { 
                    removeUIBottom();
                    console.log("HEX_ARR[gridY] not here man");
                }
            }
            else {
                // drawUILeft();
                removeUIBottom();
                console.log("elem not here man");
            }
        }
    }
    function throttledMouseover(e) {
        const now = Date.now();
        if (now - lastMouseMove < 30) return; // Limit to n ms updates
        lastMouseMove = now;
        mouseover(e);
    }

    //MOOSE DOWN
    function mousedown(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        //dialog OK btn
        if (isMouseOver(dialogOKText, mouse)) removeDialog();

        //click quit btn
        if (isMouseOver(bgSpriteLeft1, mouse)) quitToMenu();
        //click log up/down
        if (isMouseOver(bgSpriteTopChevronUp, mouse)) eventLogUp();
        if (isMouseOver(bgSpriteTopChevronDown, mouse)) eventLogDown();


        window.addEventListener('mousemove', mousemove, false);
        window.addEventListener('mouseup', mouseup, false);

        let elem = stage.children.find(shape => shape._id === e.target.id);
    
        // ignore elements that should not capture events
        if (elem && elem.noPointerEvents) return;
    
        if (elem) {
            if (elem.params.type === "poi") {;
                pushToEventLog(elem.params.eventText[0]);
            }

            if (elem.clickable) {
                somethingSelected = true;  
                selectedTileTxt = elem.desc;
                drawUIRight(elem);
            }
            else {
                somethingSelected = false;
                removeUIRight();
            }
        }
    }


    //MOOSE MOVE
    function mousemove(e) {
        if (!isDialogOpen) {
            // Adjust this value to control the maximum movement speed
            var dx = e.clientX - mouse.x;
            var dy = e.clientY - mouse.y;
        
            $("#tooltip-position").hide();
            zui.translateSurface(dx, dy);           
            removeUIBottom();
            mouse.set(e.clientX, e.clientY);
        }
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
      var dy = (e.wheelDeltaY || - e.deltaY) / 2000;
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

function startNewGame() {
    //show opening game log & dialog
    pushToEventLog("Your kingdom is pillaged and your Knights are scattered.");
    dialog01(dialogParams.openingDialog);

    //TODO: assign gold, food, other start params
}

function quitToMenu() {
    console.log("quitToMenu()");
    fadeToBlack();
    setTimeout(() => {
        location.reload();
    }, 2000);
}