
let width = window.innerWidth;  // Get the window width
let height = window.innerHeight; // Get the window height
let message = "Unknown Tile";


// BOTTOM UI
let uiX_b = width / 2;
let uiY_b = height - 90;
let bgSpriteBottom = two.makeSprite(PATH_IMG_PANEL_BOTTOM, uiX_b, uiY_b, 1, 1, 1, false);
bgSpriteBottom.visible = false;
function drawUIBottom (gridX, gridY, hexColour) {
    // clear existing ui elements before drawing new ones (will have ghosting otherwise)
    // not needed and hides other ui elements so TODO : remove?
    //ui.remove(...ui.children);  
    
    bgSpriteBottom.visible = true;
    ui.add(bgSpriteBottom);

    //lg icon + text based on tile
    if (hexColour === COLOUR_GRASS) {
        let lgSprite = two.makeSprite(PATH_IMG_GRASS_LG, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        ui.add(lgSprite);
        message = "Grassy Field";
    }
    else if (hexColour === COLOUR_FOREST) {
        let lgSprite = two.makeSprite(PATH_IMG_FOREST_LG, uiX_b-300, uiY_b+4, 1, 1, 1, false);
      ui.add(lgSprite);
      message = "Forest";
    }
    else if (hexColour === COLOUR_WATER) {
        let lgSprite = two.makeSprite(PATH_IMG_WATER_LG, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        ui.add(lgSprite);
        message = "Water";
    }
    else if (hexColour === COLOUR_MOUNTAIN) {
        let lgSprite = two.makeSprite(PATH_IMG_MOUNTAIN_LG, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        ui.add(lgSprite);
        message = "Mountain";
    }
    else if (hexColour === COLOUR_MOUNTAIN_PEAK) {
        let lgSprite = two.makeSprite(PATH_IMG_MOUNTAIN_LG, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        ui.add(lgSprite);
        message = "Peak";
    }
    else {
        let lgSprite = two.makeSprite(PATH_IMG_UNKNOWN_LG, uiX_b-300, uiY_b+4, 1, 1, 1, false);
        ui.add(lgSprite);
    }

    let txtName = two.makeText(message, uiX_b-300, uiY_b + 24, {                 
        size: 20,
        fill: '#FFFF00',
        family: 'Press Start 2P',
        alignment: 'left'
    });
    ui.add(txtName);

    moveCost = HEX_ARR[gridX][gridY].moveCost !== undefined ? HEX_ARR[gridX][gridY].moveCost + 1:1;
    atkBonus = HEX_ARR[gridX][gridY].atkBonus !== undefined ? HEX_ARR[gridX][gridY].atkBonus:0;
    defBonus = HEX_ARR[gridX][gridY].defBonus !== undefined ? HEX_ARR[gridX][gridY].defBonus:0;
    
    let txtMoveCost = two.makeText("Movement Cost: " + moveCost, uiX_b, uiY_b - 24, {                 
        size: 14,
        fill: '#FFFF00',
        family: 'Press Start 2P',
        alignment: 'left'
    });
    ui.add(txtMoveCost);  
    let txtAtkBonus = two.makeText("Attack Bonus: " + atkBonus, uiX_b, uiY_b + 6, {                 
        size: 14,
        fill: '#FFFF00',
        family: 'Press Start 2P',
        alignment: 'left'
    });
    ui.add(txtAtkBonus);    
    let txtDefBonus = two.makeText("Defence Bonus: " + defBonus, uiX_b, uiY_b + 36, {                 
        size: 14,
        fill: '#FFFF00',
        family: 'Press Start 2P',
        alignment: 'left'
    });
    ui.add(txtDefBonus);     

    two.add(ui);
}
function removeUIBottom() {
    ui.remove(bgSpriteBottom);
    ui.remove(txtName);
    ui.remove(txtMoveCost);
    ui.remove(txtAtkBonus);
    ui.remove(txtDefBonus);
}


// RIGHT UI
let uiX_r = width - 220;
let uiY_r = height - 330;
let bgSpriteRight = two.makeSprite(PATH_IMG_PANEL_RIGHT, uiX_r, uiY_r, 1, 1, 1, false);
bgSpriteRight.visible = false;
function drawUIRight() {
  uiX_r = width - 220;
  uiY_r = height - 330;
  bgSpriteRight.x = uiX_r;
    bgSpriteRight.visible = true;
    console.log("draw right ui");
    //create ui panel sprite
    ui.add(bgSpriteRight);
    two.add(ui);
}
function removeUIRight() {
    ui.remove(bgSpriteRight);
}


// LEFT UI
let uiX_l = 150;
let uiY_l = height -64;
let bgSpriteLeft1 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l, 1, 1, 1, false); 
let bgSpriteLeft2 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l-80, 1, 1, 1, false);
let bgSpriteLeft3 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l-160, 1, 1, 1, false);
let bgSpriteLeft4 = two.makeSprite(PATH_IMG_PANEL_SQUARE, uiX_l, uiY_l-264, 1, 1, 1, false);
let fgSpriteCoin = two.makeSprite(PATH_IMG_ANIM_COIN, uiX_l-64, uiY_l-160, 4, 1, 4, true); 
let fgSpriteFood = two.makeSprite(PATH_IMG_ANIM_MILL_SM, uiX_l+20, uiY_l-160, 4, 1, 5, true);
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
    console.log("draw left ui");
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

// clears ui elements
function removeUI() {
    console.log("removeUI()");
    // var child = ui.children[0];
    // if (child) {
    //   child.remove();
    //   //dispose of any references
    //   two.release(child);
    // }
    
    // removeUIBottom();
    removeUIRight();
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