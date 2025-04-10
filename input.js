//#region MAIN MENU CONTROL
const menuParentDiv = $('#menuParentDiv');
const loadingDiv = document.getElementById('loadingDiv');
// const menuClouds = document.getElementById('menuClouds');
const menuFog = document.getElementById('menuFog');
const startBtn = $('#mainmenu_pressStart');
const pressStartDiv =  $('#pressStartDiv');
const newMapRandomBtn = $('#mainmenu_newMapRandom');
const newMapSeededBtn = $('#mainmenu_newMapSeeded');
const newMapSeededInput = $('#mainmenu_mapSeed');
const newMapSeededBtn2 = $('#mainmenu_newMapSeeded2');
const loadQuestBtn = $('#mainmenu_loadGame');
const musicVolumeTxt = $('#optionsmenu_volumeMusic');
const effectsVolumeTxt = $('#optionsmenu_volumeFX');
const optionsBtn = $('#mainmenu_options');
const backBtn = $('#mainmenu_back');
const mainMenuDiv = $('#mainmenu_div');
const optionsMenuDiv = $('#optionsmenu_div');
const showFPS_btn = $("#optionsmenu_showFPS_btn");
const showFog_btn = $("#optionsmenu_showFog_btn");
const showScn_btn = $("#optionsmenu_showScn_btn");
const musicVolume_input= $("#optionsmenu_volumeMusic_input");
const effectsVolume_input = $("#optionsmenu_volumeFX_input");
let movementMarkerSprites = [];

startBtn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    audioManager.initSynth();
    audioManager.loadPlaylist(menuPlayList);  
    audioManager.startPlaylist(true);
    pressStartDiv.hide();
    menuParentDiv.show();
    optionsBtn.show();
});

optionsBtn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    showFPS_btn.text(userConfig.show_fps);
    showFPS_btn.val(userConfig.show_fps);
    showFog_btn.text(userConfig.showFog ?? true);
    showFog_btn.val(userConfig.showFog ?? true);
    showScn_btn.text(userConfig.showScanlines ?? true);
    showScn_btn.val(userConfig.showScanlines ?? true);
    musicVolume_input.val(userConfig.musicVolume);
    effectsVolume_input.val(userConfig.effectsVolume);

    optionsBtn.hide();
    backBtn.show();
    mainMenuDiv.hide();
    optionsMenuDiv.show();
});
showFPS_btn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    if (showFPS_btn.val() === true) {
        showFPS_btn.text("false");
        showFPS_btn.val(false);
    }
    else {
        showFPS_btn.text("true");
        showFPS_btn.val(true);
    }
});
showFog_btn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    if (showFog_btn.val() === true) {
        showFog_btn.text("false");
        showFog_btn.val(false);
    }
    else {
        showFog_btn.text("true");
        showFog_btn.val(true);
    }
});
showScn_btn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    if (showScn_btn.val() === true) {
        showScn_btn.text("false");
        showScn_btn.val(false);
    }
    else {
        showScn_btn.text("true");
        showScn_btn.val(true);
    }
});

backBtn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    userConfig.show_fps      = showFPS_btn.val();
    userConfig.showFog       = showFog_btn.val();
    userConfig.showScanlines = showScn_btn.val();
    userConfig.musicVolume   = musicVolume_input.val();
    userConfig.effectsVolume = effectsVolume_input.val();
    saveConfig(userConfig);

    // optionsBtn.show();
    // backBtn.hide();
    // mainMenuDiv.show();
    // optionsMenuDiv.hide();
    setTimeout(() => {
        quitToMenu(true);
    }, 500);
});

newMapRandomBtn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    const startTime = performance.now();

    //save original cursor, set to hourglass
    const originalCursor = $("body").css("cursor");
    $("body").css("cursor", `url('${PATH_IMG_MOUSE_HOURGLASS}'), auto`);

    console.log("Height Seed: " + MAP_SEED);
    menuParentDiv.hide();
    optionsBtn.hide(); //whyyyyy
    loadingDiv.removeAttribute('hidden');
    fadeToBlack();
    audioManager.fadeVolume(0, 1000);

    setTimeout(() => {
        // menuClouds.setAttribute('hidden', 'true')
        menuFog.setAttribute('hidden', 'true')
        buildGrid(MAP_SEED).then(function () {
            //wait for UI to update, then run buildGrid (so that 'loading...' shows)
            setTimeout(() => {                    
                audioManager.stop();       
                setTimeout(() => {
                    const endTime = performance.now();
                    startNewGame();
                    addZUI();
                    fadeToNormal();
                    $("#loadingDiv").attr("hidden", "true");
                    $("body").css("cursor", originalCursor);
                    console.log(`buildGrid+friends execution time (with delays): ${(endTime - startTime).toFixed(2)} ms`);
                }, 1000);   
            }, 1);   
        });        
    }, 3000);
});

newMapSeededBtn.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    console.log("New Map (Seeded) clicked");
    newMapSeededInput.show();
    newMapSeededBtn2.show();
});
newMapSeededBtn2.on("click", function () {
    playSFX(PATH_SFX_UI_CLICK01);
    const startTime = performance.now();

    console.log("Height Seed: " + MAP_SEED);
    loadingDiv.removeAttribute('hidden');
    menuParentDiv.hide();
    fadeToBlack();
    audioManager.fadeVolume(0, 1000);

    setTimeout(() => {
        let seedValue = parseInt(newMapSeededInput.val(), 10);
        //menuClouds.setAttribute('hidden', 'true')
        buildGrid(seedValue).then(function (){     
            //wait for UI to update, then run buildGrid (so that 'loading...' shows)
            setTimeout(() => {
                audioManager.stop();
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
//#endregion

//#region GLOBAL INPUTS
//suppress ctrl+mousewheel scroll b/c its weird with ZUI zoom is mixed with this
document.addEventListener("wheel", function(event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }, { passive: false });

//track moose pos(if debugging)
if (SHOW_DEBUG_OVERLAY) {
    window.addEventListener('pointermove', (event) => {
        cursorPositionDiv.textContent = `X: ${event.clientX}, Y: ${event.clientY}`;
        spriteCountDiv.textContent = `Total Sprites: ${stage.children.length}`;
    }, false);
    document.addEventListener("mouseout", function (event) {
        $("#tooltip-position").hide();
    });
}

//listen for window resize & adjust static elements
window.addEventListener('resize', updateUIPositions);
//#endregion

//#region ZUI
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
    zui.addLimits(1.6, 2.6);
    setTimeout(() => {
        zui.zoomBy(1, GRID_X_SIZE*HEX_SIZE, GRID_Y_SIZE*HEX_SIZE);
    }, 1);

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

    //MEESE STOOF
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
            // let elem = elementMap.get(e.target.id);
            if (elem) {
    
                if (lastElement === elem) return;  // Prevent redundant updates
                lastElement = elem;
        
                // Ignore elements that should not capture events
                if (elem.noPointerEvents) return;
        
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
                        drawUIBottom(gridX, gridY, fillColor, elem);
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

        //click quit btn
        if (isMouseOver(bgSpriteLeft1, mouse)) {
            playSFX(PATH_SFX_UI_CLICK01);
            quitToMenu();        
        }
        //click log up/down
        if (isMouseOver(bgSpriteTopChevronUp, mouse))  {
            playSFX(PATH_SFX_UI_CLICK02);
            eventLogUp();
        }
        if (isMouseOver(bgSpriteTopChevronDown, mouse)){
            playSFX(PATH_SFX_UI_CLICK02);
            eventLogDown();
        }

        if (!isDialogOpen) {
            //click end turn btn
            if (isMouseOver(bgSpriteLeft4, mouse)) endTurn();

            window.addEventListener('mousemove', mousemove, false);
            window.addEventListener('mouseup', mouseup, false);

            let elem = stage.children.find(shape => shape._id === e.target.id);
        
            // ignore elements that should not capture events
            if (elem && elem.noPointerEvents) return;
        
            //clear last selected tile (if exists)
            if (selectedTile) {
                let spriteDOM = document.getElementById(selectedTile._id);
                spriteDOM.classList.remove('glowing-selected');
            }

            if (elem) {
                //click unit movement icons
                movementMarkerSprites.forEach(markerSprite => {
                    if (elem === markerSprite) {
                        playSFX(PATH_SFX_UI_CLICK02);
                        moveUnitToSpriteLocation(selectedTile, markerSprite);
                    }
                });

                // clear any existing markers
                movementMarkerSprites.forEach(marker => { stage.remove(marker); });
                movementMarkerSprites = [];

                let spriteDOM  = document.getElementById(elem._id);
                if (elem.params !== undefined && elem.params.eventText !== undefined) {;
                    pushToEventLog(elem.params.eventText[0]);
                }

                if (elem.clickable) {
                    playSFX(PATH_SFX_UI_CLICK01);
                    selectedTile = elem; 
                    somethingSelected = true;  
                    selectedTileTxt = elem.desc;
                    spriteDOM.classList.add('glowing-selected');
                    drawUIRight(elem);

                    //if this is a knight, show movement hexes
                    if (elem.params.type === "knight") {
                        //get nearest tiles (distance = knights vision stat)
                        let sprites = getAdjacentHexSprites(elem.gridX, elem.gridY, elem.params.eye, colour = null);
                        if (sprites.length) isUnitMoving = true;

                        sprites.forEach(spr => {
                            //check movement cost agaisnt elem. break (dont draw) if cost more than unit curr_ap
                            if (spr.moveCost+1 > elem.params.ap_cur) return;

                            //identify each surrounding tile
                            let moveSprite = two.makeSprite(PATH_IMG_ICON_BOOTS, spr.position._x, spr.position._y, 1, 1, 1, false);
                            moveSprite.gridX = spr.gridX;
                            moveSprite.gridY = spr.gridY;
                            moveSprite.moveCost = spr.moveCost;
                            moveSprite.scale = 0.6;
                            moveSprite.desc = "Move";
                            stage.add(moveSprite); 
                            movementMarkerSprites.push(moveSprite);
                        });
                    }
                    else {
                        isUnitMoving = false;
                    }
                }
                else {
                    somethingSelected = false;
                    //selectedTile = null or somethign?
                    removeUIRight();
                }
            }
        }
        else {            
            //dialog OK btn
            if (isMouseOver(dialogOKText, mouse)) {
                playSFX(PATH_SFX_UI_PAPER01);
                removeDialog();
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
//#endregion

function startNewGame() {
    audioManager.loadPlaylist(mapPlayList);
    audioManager.startPlaylist(true, true);
    pushToEventLog("Your kingdom is pillaged and your Knights are scattered.");
    dialog01(dialogParams.openingDialog);
    totGold += 5;
    totFood += 1;
}

function endTurn() {
    fadeToDark();
    pushToEventLog("Day " + turnNum + " ends. The enemy moves under the darkness of night.");
    moveEnemiesEoT();

    //start new turn after a short pause for fade & process
    setTimeout(() => { 
        turnNum++;
        fadeToNormal(); 
        dialog01(["Day " + turnNum + " begins.", "Your kingdom collects resources."]);

        //restore ap for all units
        friendlyUnitSprites.forEach(fSpr => {
            fSpr.params.ap_cur = fSpr.params.ap_max;
        });
        enemyUnitSprites.forEach(eSpr => {
            eSpr.params.ap_cur = eSpr.params.ap_max;
        });

        totGold += turnGold;
        totFood += turnFood;
    }, 2000); 
}

function quitToMenu(fast = false) {
    if (fast) {
        location.reload();
    }
    else {
        fadeToBlack();
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}