// initial UI params
let width = window.innerWidth;  // Get the window width
let height = window.innerHeight; // Get the window height
let hoverTileTxt = "Unknown Tile";
let selectedTileTxt = "";
let somethingSelected = false;


// BOTTOM UI
let uiX_b = width/2;
let uiY_b = height-90;
let bgSpriteBottom = two.makeSprite(PATH_IMG_PANEL_BOTTOM, uiX_b, uiY_b, 1, 1, 1, false);
let lgSprite = two.makeSprite(PATH_IMG_UNKNOWN_LG, uiX_b-300, uiY_b+4, 1, 1, 1, false);
bgSpriteBottom.visible = false;
lgSprite.visible = false;
let moveCost, atkBonus, defBonus = 0;

let txtName = two.makeText(hoverTileTxt, uiX_b-300, uiY_b + 24, {                 
    size: 20,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'left'
});
let txtMoveCost = two.makeText("Movement Cost: " + moveCost, uiX_b, uiY_b - 24, {                 
    size: 14,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'left'
});
let txtAtkBonus = two.makeText("Attack Bonus: " + atkBonus, uiX_b, uiY_b + 6, {                 
    size: 14,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'left'
}); 
let txtDefBonus = two.makeText("Defence Bonus: " + defBonus, uiX_b, uiY_b + 36, {                 
    size: 14,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'left'
});
function drawUIBottom (gridX, gridY, hexColour, path) {
    // clear existing ui elements before drawing new ones (will have ghosting otherwise)
    // not needed and hides other ui elements so TODO : remove?
    // ui.remove(...ui.children);  
    removeUIBottom();
    
    bgSpriteBottom.visible = true;
    ui.add(bgSpriteBottom);

    //lg icon + text based on tile
    if (hexColour === COLOUR_GRASS) {        
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Grassy Fields";
    }
    else if (hexColour === COLOUR_FOREST) {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Forest";
    }
    else if (hexColour === COLOUR_FARM) {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Farmland";
    }
    else if (hexColour === COLOUR_COAST) {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Forest";
    }
    else if (hexColour === COLOUR_WATER) {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Water";
    }
    else if (hexColour === COLOUR_MOUNTAIN) {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Mountain";
    }
    else if (hexColour === COLOUR_MOUNTAIN_PEAK) {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Peak";
    }
    else if (hexColour === COLOUR_MARSH) {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Marsh";
    }
    else {
        lgSprite = two.makeSprite(path, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = hexColour;//"Unknown";
    }
    lgSprite.scale = 2;
    lgSprite.visible = true;
    ui.add(lgSprite);

    txtName.value = hoverTileTxt;
    ui.add(txtName);

    moveCost = HEX_ARR[gridX][gridY].moveCost !== undefined ? HEX_ARR[gridX][gridY].moveCost + 1:1;
    atkBonus = HEX_ARR[gridX][gridY].atkBonus !== undefined ? HEX_ARR[gridX][gridY].atkBonus:0;
    defBonus = HEX_ARR[gridX][gridY].defBonus !== undefined ? HEX_ARR[gridX][gridY].defBonus:0;

    txtMoveCost.value = "Movement Cost: " + moveCost;    
    ui.add(txtMoveCost);  
    txtAtkBonus.value = "Attack Bonus: " + atkBonus;   
    ui.add(txtAtkBonus);    
    txtDefBonus.value = "Defence Bonus: " + defBonus;   
    ui.add(txtDefBonus);     

    two.add(ui);
    two.update(); 
}
function redrawUIBottom() {    
    removeUIBottom();

    uiX_b = window.innerWidth/2;
    uiY_b = window.innerHeight-90;

    if (typeof bgSpriteBottom   !== 'undefined' && bgSpriteBottom   !== null) {
           bgSpriteBottom.translation.set(uiX_b, uiY_b);
           ui.add(bgSpriteBottom);
    }
    if (typeof lgSprite         !== 'undefined' && lgSprite         !== null) {
        lgSprite.translation.set(uiX_b-300, uiY_b+4);
        ui.add(lgSprite);
    }
    if (typeof txtName          !== 'undefined' && txtName          !== null) {
        txtName.translation.set(uiX_b-300, uiY_b+24);
        ui.add(txtName);
    }
    if (typeof txtMoveCost      !== 'undefined' && txtMoveCost      !== null) {
        txtMoveCost.translation.set(uiX_b, uiY_b-24);
        ui.add(txtMoveCost);
    }
    if (typeof txtAtkBonus      !== 'undefined' && txtAtkBonus      !== null) {
        txtAtkBonus.translation.set(uiX_b, uiY_b+6);
        ui.add(txtAtkBonus);
    }
    if (typeof txtDefBonus      !== 'undefined' && txtDefBonus      !== null) {
        txtDefBonus.translation.set(uiX_b, uiY_b+36);
        ui.add(txtDefBonus);
    }    

    two.render();
}
function removeUIBottom() {
    if (typeof bgSpriteBottom   !== 'undefined' && bgSpriteBottom   !== null)   ui.remove(bgSpriteBottom);
    if (typeof lgSprite         !== 'undefined' && lgSprite         !== null)   ui.remove(lgSprite);
    if (typeof txtName          !== 'undefined' && txtName          !== null)   ui.remove(txtName);
    if (typeof txtMoveCost      !== 'undefined' && txtMoveCost      !== null)   ui.remove(txtMoveCost);
    if (typeof txtAtkBonus      !== 'undefined' && txtAtkBonus      !== null)   ui.remove(txtAtkBonus);
    if (typeof txtDefBonus      !== 'undefined' && txtDefBonus      !== null)   ui.remove(txtDefBonus);
}


// LEFT UI
let uiX_l = 150;
let uiY_l = height -64;
let bgSpriteLeft1 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l, 1, 1, 1, false); 
let bgSpriteLeft2 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l-80, 1, 1, 1, false);
let bgSpriteLeft3 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l-160, 1, 1, 1, false);
let bgSpriteLeft4 = two.makeSprite(PATH_IMG_PANEL_SQUARE, uiX_l, uiY_l-264, 1, 1, 1, false);
let fgSpriteCoin = two.makeSprite(PATH_IMG_ANIM_COIN, uiX_l-64, uiY_l-160, 4, 1, 4, true); 
let fgSpriteFood = two.makeSprite(PATH_IMG_ICON_FOOD, uiX_l+18, uiY_l-160, 1, 1, 1, false);
let fgSpriteHourglass = two.makeSprite(PATH_IMG_ICON_HOURGLASS, uiX_l, uiY_l-264, 1, 1, 1, false);
let txtGold = two.makeText("200", uiX_l-48, uiY_l-156, {                 
    size: 14,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'left'
});
let txtFood = two.makeText("200", uiX_l+36, uiY_l-156, {                 
    size: 14,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'left'
});
let txtSave = two.makeText("Save Quest", uiX_l-69, uiY_l-77, {                 
    size: 14,
    fill: '#808080',
    family: 'Press Start 2P',
    stroke: '',
    decoration: 'line-through',
    alignment: 'left'
});
let txtQuit = two.makeText("Leave Quest", uiX_l-76, uiY_l+3, {                 
    size: 14,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'left'
});
function drawUILeft() {
    //create ui panel sprite(s)
    ui.add(bgSpriteLeft1);
    ui.add(bgSpriteLeft2);
    ui.add(bgSpriteLeft3);
    ui.add(bgSpriteLeft4);
    ui.add(fgSpriteCoin);
    ui.add(fgSpriteFood);
    ui.add(fgSpriteHourglass);
    ui.add(txtFood);
    ui.add(txtGold);
    ui.add(txtSave);
    ui.add(txtQuit);

    two.add(ui);
}
function redrawUILeft() {    
    uiX_l = 150;
    uiY_l = window.innerHeight -64;
    bgSpriteLeft1.translation.set(uiX_l, uiY_l);
    bgSpriteLeft2.translation.set(uiX_l, uiY_l-80);
    bgSpriteLeft3.translation.set(uiX_l, uiY_l-160);
    bgSpriteLeft4.translation.set(uiX_l, uiY_l-264);
    fgSpriteCoin.translation.set(uiX_l-64, uiY_l-160);
    fgSpriteFood.translation.set(uiX_l+18, uiY_l-160);
    fgSpriteHourglass.translation.set(uiX_l, uiY_l-264);
    txtQuit.translation.set(uiX_l-76, uiY_l+3);
    txtSave.translation.set(uiX_l-69, uiY_l-77);
    txtFood.translation.set(uiX_l+36, uiY_l-156);
    txtGold.translation.set(uiX_l-48, uiY_l-156);

    drawUILeft();
}


// RIGHT UI
let uiX_r = width - 220;
let uiY_r = height - 330;
let bgSpriteRight = two.makeSprite(PATH_IMG_PANEL_RIGHT, uiX_r, uiY_r, 1, 1, 1, false);
bgSpriteRight.visible = false;
let selectSprite = two.makeSprite(PATH_IMG_CASTLE_SELECT, uiX_r, uiY_r-333, 1, 1, 1, false); //TODO: sprite depending on tile
selectSprite.visible = false;
selectSprite.scale = 4;
let rndTblSprite = two.makeSprite(PATH_IMG_ICON_RNDTABLE, uiX_r, uiY_r+250, 1, 1, 1, false);
rndTblSprite.visible = false;
let txtSelectedName = two.makeText(selectedTileTxt, uiX_r, uiY_r-190, {                 
    size: 22,
    fill: '#FFFF00',
    family: 'Press Start 2P',
    alignment: 'center'
});
function drawUIRight(desc) {
    bgSpriteRight.visible = true;
    selectSprite.visible = true;
    rndTblSprite.visible = true;
    txtSelectedName.value = desc;

    ui.add(bgSpriteRight);
    ui.add(selectSprite);
    ui.add(rndTblSprite);
    ui.add(txtSelectedName);
    two.add(ui);    
}
function redrawUIRight(desc) {
    uiX_r = window.innerWidth - 220;
    uiY_r = window.innerHeight - 330;
    
    bgSpriteRight.translation.set(uiX_r, uiY_r);
    selectSprite.translation.set(uiX_r, uiY_r-333);
    rndTblSprite.translation.set(uiX_r, uiY_r+250);
    txtSelectedName.translation.set(uiX_r, uiY_r-190);

    drawUIRight(desc);
}
function removeUIRight() {
    ui.remove(bgSpriteRight);
    ui.remove(selectSprite);
    ui.remove(rndTblSprite);
    ui.remove(txtSelectedName);
}

function updateUIPositions() {
    redrawUILeft();
    redrawUIBottom();
    redrawUIRight();
}

function fadeToBlack() {
  let overlay = document.getElementById("fadeOverlay");
  // fade to black
  overlay.style.opacity = "1";
  // prevents clicks while blacked out
  overlay.style.pointerEvents = "auto";
}

function fadeToNormal() {
    let overlay = document.getElementById("fadeOverlay");
    overlay.style.opacity = "0";
    setTimeout(() => {
        // allow clicks again after fading out
        // overlay.style.pointerEvents = "none";
        overlay.style.setProperty("pointer-events", "none", "important");
    }, 2000); 
}