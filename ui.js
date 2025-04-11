// initial UI params
let width = window.innerWidth;
let height = window.innerHeight;
let hoverTileTxt = "Unknown Tile";
let selectedTileTxt = "";
let somethingSelected = false;
let isDialogOpen = false;
let isUnitMoving = false;

//#region TOP UI
let uiX_t = width/2;
let uiY_t = 80;
let bgSpriteTop = two.makeSprite(PATH_IMG_PANEL_TOP, uiX_t, uiY_t, 1, 1, 1, false);
bgSpriteTop.opacity = .9;
let bgSpriteTopChevronUp = two.makeSprite(PATH_IMG_CHEVRON_UP, uiX_t+540, uiY_t-20, 1, 1, 1, false);
let bgSpriteTopChevronDown = two.makeSprite(PATH_IMG_CHEVRON_DOWN, uiX_t+540, uiY_t+20, 1, 1, 1, false);
bgSpriteTopChevronUp.opacity = .9;
bgSpriteTopChevronDown.opacity = .9;
let txtLog01 = two.makeText(shownLog[0] ?? "", uiX_t-580, uiY_t-30, { size: 14, fill: '#D3D3D3', family: 'Press Start 2P', alignment: 'left' });
let txtLog02 = two.makeText(shownLog[1] ?? "", uiX_t-580, uiY_t, { size: 14, fill: '#D3D3D3', family: 'Press Start 2P', alignment: 'left' });
let txtLog03 = two.makeText(shownLog[2] ?? "", uiX_t-580, uiY_t+30, { size: 14, fill: '#D3D3D3', family: 'Press Start 2P', alignment: 'left' });
function drawUITop() {
    ui.add(bgSpriteTop);
    ui.add(bgSpriteTopChevronUp);
    ui.add(bgSpriteTopChevronDown);
    ui.add(txtLog01);    
    ui.add(txtLog02);    
    ui.add(txtLog03);    
    two.add(ui);
}
function redrawUITop() {  
    uiX_t = window.innerWidth/2;
    uiY_t = 80;
    bgSpriteTop.translation.set(uiX_t, uiY_t);
    bgSpriteTopChevronUp.translation.set(uiX_t+540, uiY_t-20);
    bgSpriteTopChevronDown.translation.set(uiX_t+540, uiY_t+20);
    txtLog01.translation.set(uiX_t-580, uiY_t-30);
    txtLog02.translation.set(uiX_t-580, uiY_t);
    txtLog03.translation.set(uiX_t-580, uiY_t+30);
    txtLog01.value = shownLog[0] ?? "";
    txtLog02.value = shownLog[1] ?? "";
    txtLog03.value = shownLog[2] ?? "";

    drawUITop();
}
function removeUITop() {
    if (typeof bgSpriteTop !== 'undefined' && bgSpriteTop !== null) ui.remove(bgSpriteTop);
    if (typeof bgSpriteTopChevronUp !== 'undefined' && bgSpriteTopChevronUp !== null) ui.remove(bgSpriteTopChevronUp);
    if (typeof bgSpriteTopChevronDown !== 'undefined' && bgSpriteTopChevronDown !== null) ui.remove(bgSpriteTopChevronDown);
    if (typeof txtLog01    !== 'undefined' && txtLog01    !== null) ui.remove(txtLog01);
    if (typeof txtLog02    !== 'undefined' && txtLog02    !== null) ui.remove(txtLog02);
    if (typeof txtLog03    !== 'undefined' && txtLog03    !== null) ui.remove(txtLog03);
}
//#endregion 

//#region BOTTOM UI
let uiX_b = width/2;
let uiY_b = height-90;
let bgSpriteBottom = two.makeSprite(PATH_IMG_PANEL_BOTTOM, uiX_b, uiY_b, 1, 1, 1, false);
let lgSprite = two.makeSprite(PATH_IMG_HEX_GRASS01, uiX_b-305, uiY_b+4, 1, 1, 1, false);
bgSpriteBottom.visible = false;
bgSpriteBottom.opacity = .9;
lgSprite.visible = false;
let moveCost, atkBonus, defBonus = 0;

let txtName = two.makeText(hoverTileTxt, uiX_b-305, uiY_b + 24, { size: 20, fill: '#FFFFFF', family: 'Press Start 2P', alignment: 'left' });
let txtMoveCost = two.makeText(" " + moveCost, uiX_b-76, uiY_b - 24, { size: 14, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let txtAtkBonus = two.makeText("" + atkBonus, uiX_b-76, uiY_b + 6, { size: 14, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' }); 
let txtDefBonus = two.makeText("" + defBonus, uiX_b-76, uiY_b + 36, { size: 14, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });

//longDesc
let txtlongDesc1 = two.makeText("", uiX_b+40, uiY_b-26, { size: 13, fill: '#D3D3D3', family: 'Press Start 2P', alignment: 'left' });
let txtlongDesc2 = two.makeText("", uiX_b+40, uiY_b- 4, { size: 13, fill: '#D3D3D3', family: 'Press Start 2P', alignment: 'left' });
let txtlongDesc3 = two.makeText("", uiX_b+40, uiY_b+18, { size: 13, fill: '#D3D3D3', family: 'Press Start 2P', alignment: 'left' });
let txtlongDesc4 = two.makeText("", uiX_b+40, uiY_b+40, { size: 13, fill: '#D3D3D3', family: 'Press Start 2P', alignment: 'left' });

function drawUIBottom (gridX, gridY, hexColour, elem) {
    // clear existing ui elements before drawing new ones (will have ghosting otherwise)
    // not needed and hides other ui elements so TODO : remove?
    // ui.remove(...ui.children);  
    removeUIBottom();
    
    bgSpriteBottom.visible = true;
    ui.add(bgSpriteBottom);

    //lg icon + text based on tile
    if (hexColour === COLOUR_GRASS) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Grassland";
    }
    else if (hexColour === COLOUR_FOREST) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Forest";
    }
    else if (hexColour === COLOUR_FARM) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Farmland";
    }
    else if (hexColour === COLOUR_COAST) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Forest";
    }
    else if (hexColour === COLOUR_WATER) {
        //lgSprite.path = PATH_IMG_HEX_WATER01;
        lgSprite = two.makeSprite(PATH_IMG_HEX_WATER01, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Water";
    }
    else if (hexColour === COLOUR_WATER_DEEP) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Water (Deep)";
    }
    else if (hexColour === COLOUR_MOUNTAIN) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Mountain";
    }
    else if (hexColour === COLOUR_MOUNTAIN_PEAK) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Peak";
    }
    else if (hexColour === COLOUR_MARSH) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Marsh";
    }
    else if (hexColour === COLOUR_SETTLEMENT) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Settlement";
    }
    else if (hexColour === COLOUR_CURSEDABBEY) {
        lgSprite = two.makeSprite(elem.path, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = "Abbey";
    }
    else {
        //lgSprite.path = PATH_IMG_HEX_GRASS01;
        lgSprite = two.makeSprite(PATH_IMG_HEX_GRASS01, uiX_b-305, uiY_b+4, 1, 1, 1, false);
        hoverTileTxt = hexColour;//"Unknown";
    }
    lgSprite.scale = 2;
    lgSprite.visible = true;
    ui.add(lgSprite);

    txtName.value = hoverTileTxt;
    ui.add(txtName);

    moveCost = HEX_ARR[gridY][gridX].moveCost !== undefined ? HEX_ARR[gridY][gridX].moveCost + 1:1;
    atkBonus = HEX_ARR[gridY][gridX].atkBonus !== undefined ? HEX_ARR[gridY][gridX].atkBonus:0;
    defBonus = HEX_ARR[gridY][gridX].defBonus !== undefined ? HEX_ARR[gridY][gridX].defBonus:0;

    txtMoveCost.value = "MOV: " + moveCost;    
    ui.add(txtMoveCost);  
    txtAtkBonus.value = "ATK: " + atkBonus;   
    ui.add(txtAtkBonus);    
    txtDefBonus.value = "DEF: " + defBonus;   
    ui.add(txtDefBonus);   

    //longDesc
    let longDescArr = wrapText(elem.params.descLong, 25);
    txtlongDesc1.value = longDescArr[0] ?? "";
    txtlongDesc2.value = longDescArr[1] ?? "";
    txtlongDesc3.value = longDescArr[2] ?? "";
    txtlongDesc4.value = longDescArr[3] ?? "";
    ui.add(txtlongDesc1);
    ui.add(txtlongDesc2);
    ui.add(txtlongDesc3);
    ui.add(txtlongDesc4);

    two.add(ui);
}
function redrawUIBottom() {    
    removeUIBottom();

    if (!isDialogOpen) {
        uiX_b = window.innerWidth/2;
        uiY_b = window.innerHeight-90;
    
        if (typeof bgSpriteBottom !== 'undefined' && bgSpriteBottom !== null) {
               bgSpriteBottom.translation.set(uiX_b, uiY_b);
               ui.add(bgSpriteBottom);
        }
        if (typeof lgSprite       !== 'undefined' && lgSprite       !== null) {
            lgSprite.translation.set(uiX_b-305, uiY_b+4);
            ui.add(lgSprite);
        }
        if (typeof txtName        !== 'undefined' && txtName        !== null) {
            txtName.translation.set(uiX_b-305, uiY_b+24);
            ui.add(txtName);
        }
        if (typeof txtMoveCost    !== 'undefined' && txtMoveCost    !== null) {
            txtMoveCost.translation.set(uiX_b-76, uiY_b-24);
            ui.add(txtMoveCost);
        }
        if (typeof txtAtkBonus    !== 'undefined' && txtAtkBonus    !== null) {
            txtAtkBonus.translation.set(uiX_b-76, uiY_b+6);
            ui.add(txtAtkBonus);
        }
        if (typeof txtDefBonus    !== 'undefined' && txtDefBonus    !== null) {
            txtDefBonus.translation.set(uiX_b-76, uiY_b+36);
            ui.add(txtDefBonus);
        }    

        if (typeof txtlongDesc1    !== 'undefined' && txtlongDesc1    !== null) {
            txtlongDesc1.translation.set(uiX_b+40, uiY_b-26);
            ui.add(txtlongDesc1);
        }    
        if (typeof txtlongDesc2    !== 'undefined' && txtlongDesc2    !== null) {
            txtlongDesc2.translation.set(uiX_b+40, uiY_b- 4);
            ui.add(txtlongDesc2);
        }    
        if (typeof txtlongDesc3    !== 'undefined' && txtlongDesc3    !== null) {
            txtlongDesc3.translation.set(uiX_b+40, uiY_b+18);
            ui.add(txtlongDesc3);
        }
        if (typeof txtlongDesc4    !== 'undefined' && txtlongDesc4    !== null) {
            txtlongDesc4.translation.set(uiX_b+40, uiY_b+40);
            ui.add(txtlongDesc4);
        }
    }
}
function removeUIBottom() {
    if (typeof bgSpriteBottom !== 'undefined' && bgSpriteBottom !== null) ui.remove(bgSpriteBottom);
    if (typeof lgSprite       !== 'undefined' && lgSprite       !== null) ui.remove(lgSprite);
    if (typeof txtName        !== 'undefined' && txtName        !== null) ui.remove(txtName);
    if (typeof txtMoveCost    !== 'undefined' && txtMoveCost    !== null) ui.remove(txtMoveCost);
    if (typeof txtAtkBonus    !== 'undefined' && txtAtkBonus    !== null) ui.remove(txtAtkBonus);
    if (typeof txtDefBonus    !== 'undefined' && txtDefBonus    !== null) ui.remove(txtDefBonus);    
    if (typeof txtlongDesc1   !== 'undefined' && txtlongDesc1   !== null) ui.remove(txtlongDesc1);
    if (typeof txtlongDesc2   !== 'undefined' && txtlongDesc2   !== null) ui.remove(txtlongDesc2);
    if (typeof txtlongDesc3   !== 'undefined' && txtlongDesc3   !== null) ui.remove(txtlongDesc3);
    if (typeof txtlongDesc4   !== 'undefined' && txtlongDesc4   !== null) ui.remove(txtlongDesc4);
}
//#endregion 

//#region LEFT UI
let uiX_l = 150;
let uiY_l = height -64;
let bgSpriteLeft1 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l, 1, 1, 1, false); 
bgSpriteLeft1.opacity = .9;
bgSpriteLeft1.addEventListener('click', () => {
    quitToMenu();
});
let bgSpriteLeft2 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l-80, 1, 1, 1, false);
bgSpriteLeft2.opacity = .9;
let bgSpriteLeft3 = two.makeSprite(PATH_IMG_PANEL_SMALL, uiX_l, uiY_l-160, 1, 1, 1, false);
bgSpriteLeft3.opacity = .9;
let bgSpriteLeft4 = two.makeSprite(PATH_IMG_PANEL_SQUARE, uiX_l, uiY_l-264, 1, 1, 1, false);
let fgSpriteCoin = two.makeSprite(PATH_IMG_ANIM_COIN, uiX_l-64, uiY_l-160, 4, 1, 4, true); 
let fgSpriteFood = two.makeSprite(PATH_IMG_ICON_FOOD, uiX_l+18, uiY_l-160, 1, 1, 1, false);
let fgSpriteHourglass = two.makeSprite(PATH_IMG_ICON_HOURGLASS, uiX_l, uiY_l-264, 1, 1, 1, false);
let txtGold = two.makeText(totGold.toString().padStart(2, '0'), uiX_l-48, uiY_l-156, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let txtFood = two.makeText(totFood.toString().padStart(2, '0'), uiX_l+36, uiY_l-156, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let txtSave = two.makeText("Save Quest", uiX_l-69, uiY_l-77, { size: 14, fill: '#808080', family: 'Press Start 2P', stroke: '', decoration: 'line-through', alignment: 'left' });
let txtQuit = two.makeText("Leave Quest", uiX_l-76, uiY_l+3, { size: 14, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
function drawUILeft() {
    //create ui panel sprite(s)
    ui.add(bgSpriteLeft1);
    bgSpriteLeft1 ?? document.getElementById(bgSpriteLeft1._id).classList.add('hover-hl');
    ui.add(bgSpriteLeft2);
    ui.add(bgSpriteLeft3);
    ui.add(bgSpriteLeft4);
    bgSpriteLeft4 ?? document.getElementById(bgSpriteLeft4._id).classList.add('hover-hl');
    ui.add(fgSpriteCoin);
    ui.add(fgSpriteFood);
    ui.add(fgSpriteHourglass);
    txtFood.value = totFood.toString().padStart(2, '0');
    txtGold.value = totGold.toString().padStart(2, '0');
    ui.add(txtFood);
    ui.add(txtGold);
    ui.add(txtSave);
    ui.add(txtFood);
    ui.add(txtQuit);

    two.add(ui);
    console.log("🚀 ~ drawUILeft ~ totFood:", totFood)
    console.log("🚀 ~ drawUILeft ~ totGold:", totGold)
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
//#endregion 

//#region RIGHT UI
let uiX_r = width - 220;
let uiY_r = height - 330;
let rUI_bgSpriteRight = two.makeSprite(PATH_IMG_PANEL_RIGHT, uiX_r, uiY_r, 1, 1, 1, false);
rUI_bgSpriteRight.opacity = .9;
rUI_bgSpriteRight.visible = false;
let rUI_selectSprite = two.makeSprite(PATH_IMG_HEX_CASTLE01, uiX_r, uiY_r-353, 1, 1, 1, false);
rUI_selectSprite.visible = false;
rUI_selectSprite.scale = 4;
let rUI_txtSelectedName = two.makeText(selectedTileTxt, uiX_r, uiY_r-210, { size: 22, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'center' });
//coin/bread
let rUI_SpriteCoin = two.makeSprite(PATH_IMG_ANIM_COIN, uiX_r-123, uiY_r-160, 4, 1, 4, true);
let rUI_SpriteBread = two.makeSprite(PATH_IMG_ICON_FOOD, uiX_r-20, uiY_r-160, 1, 1, 1, true);
let rUI_txtGold = two.makeText("", uiX_r-99, uiY_r-154, { size: 14, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let rUI_txtFood = two.makeText("", uiX_r+1, uiY_r-154, { size: 14, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
rUI_SpriteCoin.visible = false;
rUI_SpriteBread.visible = false;
//sword/shield/medal/eye
let rUI_SpriteSword = two.makeSprite(PATH_IMG_ICON_SWORD, uiX_r-125, uiY_r-167, 1, 1, 1, false);
let rUI_SpriteShield = two.makeSprite(PATH_IMG_ICON_SHIELD, uiX_r-55, uiY_r-167, 1, 1, 1, false);
let rUI_SpriteMedal = two.makeSprite(PATH_IMG_ICON_MEDAL, uiX_r+15, uiY_r-167, 1, 1, 1, false);
let rUI_SpriteEye = two.makeSprite(PATH_IMG_ICON_EYE, uiX_r+85, uiY_r-167, 1, 1, 1, false);
let rUI_txtAtk = two.makeText("", uiX_r-104, uiY_r-162, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let rUI_txtDef = two.makeText("", uiX_r-31, uiY_r-162, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let rUI_txtVrt = two.makeText("", uiX_r+36, uiY_r-162, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let rUI_txtEye = two.makeText("", uiX_r+106, uiY_r-162, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
rUI_SpriteSword.visible = false;
rUI_SpriteShield.visible = false;
rUI_SpriteMedal.visible = false;
rUI_SpriteEye.visible = false;
//hp cur/max, ap cur/max
let rUI_SpriteHealth = two.makeSprite(PATH_IMG_ICON_HEART, uiX_r-125, uiY_r-124, 1, 1, 1, false);
let rUI_SpriteAction = two.makeSprite(PATH_IMG_ICON_BOOTS, uiX_r+15, uiY_r-124, 1, 1, 1, false);
let rUI_txtHP = two.makeText("", uiX_r-104, uiY_r-121, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
let rUI_txtAP = two.makeText("", uiX_r+36, uiY_r-121, { size: 16, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
rUI_SpriteHealth.visible = false;
rUI_SpriteAction.visible = false;
//first aid btn
let rUI_aidBtn = two.makeSprite(PATH_IMG_PANEL_SMALLWIDE, uiX_r-1, uiY_r-19, 1, 1, 1, false);
rUI_aidBtn.visible = false;
let rUI_SpriteAid = two.makeSprite(PATH_IMG_ICON_AID, uiX_r-120, uiY_r-19, 1, 1, 1, false);
rUI_SpriteAid.visible = false;
let rUI_txtAid = two.makeText("", uiX_r-99, uiY_r-19, { size: 14, fill: '#FFFF00', family: 'Press Start 2P', alignment: 'left' });
//castle panel
let rUI_wideBtn01 = two.makeSprite(PATH_IMG_PANEL_SMALLWIDE, uiX_r-1, uiY_r-19, 1, 1, 1, false);
let rUI_wideBtn02 = two.makeSprite(PATH_IMG_PANEL_SMALLWIDE, uiX_r-1, uiY_r-87, 1, 1, 1, false);
let rUI_smolBtn01 = two.makeSprite(PATH_IMG_PANEL_SMALLER, uiX_r-84, uiY_r+185, 1, 1, 1, false);
let rUI_smolBtn02 = two.makeSprite(PATH_IMG_PANEL_SMALLER, uiX_r+81, uiY_r+185, 1, 1, 1, false);
let rUI_smolBtn03 = two.makeSprite(PATH_IMG_PANEL_SMALLER, uiX_r-84, uiY_r+117, 1, 1, 1, false);
let rUI_smolBtn04 = two.makeSprite(PATH_IMG_PANEL_SMALLER, uiX_r+81, uiY_r+117, 1, 1, 1, false);
let rUI_smolBtn05 = two.makeSprite(PATH_IMG_PANEL_SMALLER, uiX_r-84, uiY_r+49, 1, 1, 1, false);
let rUI_smolBtn06 = two.makeSprite(PATH_IMG_PANEL_SMALLER, uiX_r+81, uiY_r+49, 1, 1, 1, false);
let rUI_rndTblSprite = two.makeSprite(PATH_IMG_ICON_RNDTABLE, uiX_r, uiY_r+264, 1, 1, 1, false);
rUI_wideBtn01.visible = false;
rUI_wideBtn02.visible = false;
rUI_smolBtn01.visible = false;
rUI_smolBtn02.visible = false;
rUI_smolBtn03.visible = false;
rUI_smolBtn04.visible = false;
rUI_smolBtn05.visible = false;
rUI_smolBtn06.visible = false;
rUI_rndTblSprite.visible = false;
let rUI_wideBtn01Txt = two.makeText("", uiX_r-1, uiY_r-16, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center' });
let rUI_wideBtn02Txt = two.makeText("", uiX_r-1, uiY_r-84, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center' });
let rUI_smolBtn01Txt = two.makeText("", uiX_r-84, uiY_r+188, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center', visible: 'false' });
let rUI_smolBtn02Txt = two.makeText("", uiX_r+81, uiY_r+188, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center' });
let rUI_smolBtn03Txt = two.makeText("", uiX_r-84, uiY_r+120, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center' });
let rUI_smolBtn04Txt = two.makeText("", uiX_r+81, uiY_r+120, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center' });
let rUI_smolBtn05Txt = two.makeText("", uiX_r-84, uiY_r+52, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center' });
let rUI_smolBtn06Txt = two.makeText("", uiX_r+81, uiY_r+52, { size: 16, fill: '#808080', family: 'Press Start 2P', alignment: 'center' });
function drawUIRight(elem) {
    removeUIRight();

    rUI_bgSpriteRight.visible = true;
    rUI_selectSprite = two.makeSprite(elem.path, uiX_r, uiY_r-353, 1, 1, 1, false);
    rUI_selectSprite.scale = elem.isHex ? 5:8;
    rUI_selectSprite.scale = elem.path===PATH_IMG_HEX_CASTLE01 ? 4:rUI_selectSprite.scale;
    rUI_selectSprite.visible = true;
    rUI_txtSelectedName.value = elem.desc;

    ui.add(rUI_bgSpriteRight);
    ui.add(rUI_selectSprite);
    ui.add(rUI_txtSelectedName);

    //if elem is camelot display specific ui
    if (elem.params.type === "castle") {
        rUI_SpriteCoin.visible = true;
        rUI_txtGold.value = "+" + elem.params.gold_per_turn ?? -1;
        rUI_SpriteBread.visible = true;
        rUI_txtFood.value = "+" + elem.params.food_per_turn ?? -1;
    
        rUI_rndTblSprite.visible = true;
        rUI_wideBtn01.visible = true;
        rUI_wideBtn02.visible = true;
        rUI_smolBtn01.visible = true;
        rUI_smolBtn02.visible = true;
        rUI_smolBtn03.visible = true;
        rUI_smolBtn04.visible = true;
        rUI_smolBtn05.visible = true;
        rUI_smolBtn06.visible = true;
        rUI_wideBtn01Txt.value = "???";
        rUI_wideBtn02Txt.value = "???";
        rUI_smolBtn01Txt.value = "???";
        rUI_smolBtn02Txt.value = "???";
        rUI_smolBtn03Txt.value = "???";
        rUI_smolBtn04Txt.value = "???";
        rUI_smolBtn05Txt.value = "???";
        rUI_smolBtn06Txt.value = "???";
    
        ui.add(rUI_rndTblSprite);
        ui.add(rUI_wideBtn01);
        ui.add(rUI_wideBtn01Txt);
        ui.add(rUI_wideBtn02);
        ui.add(rUI_wideBtn02Txt);
        ui.add(rUI_smolBtn01);
        ui.add(rUI_smolBtn01Txt);
        ui.add(rUI_smolBtn02);
        ui.add(rUI_smolBtn02Txt);
        ui.add(rUI_smolBtn03);
        ui.add(rUI_smolBtn03Txt);
        ui.add(rUI_smolBtn04);
        ui.add(rUI_smolBtn04Txt);
        ui.add(rUI_smolBtn05);
        ui.add(rUI_smolBtn05Txt);
        ui.add(rUI_smolBtn06);
        ui.add(rUI_smolBtn06Txt);
    
        ui.add(rUI_SpriteCoin);
        ui.add(rUI_txtGold);
        ui.add(rUI_SpriteBread);
        ui.add(rUI_txtFood);
    }
    //else if elem is unit
    else if (elem.params.type === "knight") {
        rUI_SpriteSword.visible = true;
        rUI_SpriteShield.visible = true;
        rUI_SpriteMedal.visible = true;
        rUI_SpriteEye.visible = true;
        rUI_SpriteHealth.visible = true;
        rUI_SpriteAction.visible = true;
        rUI_aidBtn.visible = true;
        rUI_SpriteAid.visible = true;
        rUI_txtAtk.value = elem.params.atk ?? 0;
        rUI_txtDef.value = elem.params.def ?? 0;
        rUI_txtVrt.value = elem.params.vrt ?? 0;
        rUI_txtEye.value = elem.params.eye ?? 0;
        rUI_txtHP.value  = elem.params.hp_cur + "/" + elem.params.hp_max ;
        rUI_txtAP.value  = elem.params.ap_cur + "/" + elem.params.ap_max;
        rUI_txtAid.value = "First Aid (5f)";

        ui.add(rUI_SpriteSword);
        ui.add(rUI_SpriteShield);
        ui.add(rUI_SpriteMedal);
        ui.add(rUI_SpriteEye);
        let medalDOM  = document.getElementById(rUI_SpriteMedal._id);
        if (medalDOM) medalDOM.classList.add('glowing-neutral2');
        ui.add(rUI_SpriteHealth);
        ui.add(rUI_SpriteAction);
        ui.add(rUI_aidBtn);
        ui.add(rUI_SpriteAid);
        ui.add(rUI_txtAtk);
        ui.add(rUI_txtDef);
        ui.add(rUI_txtVrt);
        ui.add(rUI_txtEye);
        ui.add(rUI_txtHP);
        ui.add(rUI_txtAP);
        ui.add(rUI_txtAid);
    }
    //else if elem is settlement
    else if (elem.params.type === "settlement") {
        rUI_SpriteCoin.visible = true;
        rUI_txtGold.value = "+" + elem.params.gold_per_turn ?? -1;
        rUI_SpriteBread.visible = true;
        rUI_txtFood.value = "+" + elem.params.food_per_turn ?? -1;

        ui.add(rUI_SpriteCoin);
        ui.add(rUI_SpriteBread);
        ui.add(rUI_txtGold);
        ui.add(rUI_txtFood);
    }

    two.add(ui);    
}
function redrawUIRight() {
    uiX_r = window.innerWidth - 220;
    uiY_r = window.innerHeight - 330;

    //TODO: redraw based on elem type
    
    rUI_SpriteCoin.translation.set(uiX_r-123, uiY_r-160);
    rUI_SpriteBread.translation.set(uiX_r-20, uiY_r-160);
    rUI_txtGold.translation.set(uiX_r-120, uiY_r-154);
    rUI_txtFood.translation.set(uiX_r+1, uiY_r-154);
    
    rUI_SpriteSword.translation.set(uiX_r-125, uiY_r-167);
    rUI_SpriteShield.translation.set(uiX_r-55, uiY_r-167);
    rUI_SpriteMedal.translation.set(uiX_r+15, uiY_r-167);
    rUI_SpriteEye.translation.set(uiX_r+85, uiY_r-167);
    rUI_SpriteHealth.translation.set(uiX_r-125, uiY_r-124);
    rUI_SpriteAction.translation.set(uiX_r+15, uiY_r-124);
    rUI_txtAtk.translation.set(uiX_r-104, uiY_r-162);
    rUI_txtDef.translation.set(uiX_r-31, uiY_r-162);
    rUI_txtVrt.translation.set(uiX_r+36, uiY_r-162);
    rUI_txtEye.translation.set(uiX_r+106, uiY_r-162);
    rUI_txtHP.translation.set(uiX_r-104, uiY_r-121);    
    rUI_txtAP.translation.set(uiX_r+36, uiY_r-121);    
    rUI_SpriteAid.translation.set(uiX_r-120, uiY_r-19);
    rUI_txtAid.translation.set(uiX_r-99, uiY_r-19);
    rUI_aidBtn.translation.set(uiX_r-1, uiY_r-19);

    rUI_bgSpriteRight.translation.set(uiX_r, uiY_r);
    rUI_selectSprite.translation.set(uiX_r, uiY_r-353);
    rUI_txtSelectedName.translation.set(uiX_r, uiY_r-210);
    rUI_wideBtn01.translation.set(uiX_r-1, uiY_r-19);
    rUI_wideBtn01Txt.translation.set(uiX_r-1, uiY_r-16);
    rUI_wideBtn02.translation.set(uiX_r-1, uiY_r-87);
    rUI_wideBtn02Txt.translation.set(uiX_r-1, uiY_r-84);
    rUI_smolBtn01.translation.set(uiX_r-84, uiY_r+185);
    rUI_smolBtn01Txt.translation.set(uiX_r-84, uiY_r+188);
    rUI_smolBtn02.translation.set(uiX_r+81, uiY_r+185);
    rUI_smolBtn02Txt.translation.set(uiX_r+81, uiY_r+188);
    rUI_smolBtn03.translation.set(uiX_r-84, uiY_r+117);
    rUI_smolBtn03Txt.translation.set(uiX_r-84, uiY_r+120);
    rUI_smolBtn04.translation.set(uiX_r+81, uiY_r+117);
    rUI_smolBtn04Txt.translation.set(uiX_r+81, uiY_r+120);
    rUI_smolBtn05.translation.set(uiX_r-84, uiY_r+49);
    rUI_smolBtn05Txt.translation.set(uiX_r-84, uiY_r+52);
    rUI_smolBtn06.translation.set(uiX_r+81, uiY_r+49);
    rUI_smolBtn06Txt.translation.set(uiX_r+81, uiY_r+52);
    rUI_rndTblSprite.translation.set(uiX_r, uiY_r+264);
}
function removeUIRight() {
    ui.remove(rUI_SpriteCoin);
    ui.remove(rUI_SpriteBread);
    ui.remove(rUI_txtGold);
    ui.remove(rUI_txtFood);

    ui.remove(rUI_SpriteSword);
    ui.remove(rUI_SpriteShield);
    ui.remove(rUI_SpriteMedal);
    ui.remove(rUI_SpriteEye);
    ui.remove(rUI_SpriteHealth);
    ui.remove(rUI_SpriteAction);
    ui.remove(rUI_SpriteAid);
    ui.remove(rUI_txtAtk);
    ui.remove(rUI_txtDef);
    ui.remove(rUI_txtVrt);
    ui.remove(rUI_txtEye);
    ui.remove(rUI_txtHP);
    ui.remove(rUI_txtAP);
    ui.remove(rUI_aidBtn);
    ui.remove(rUI_txtAid);

    ui.remove(rUI_bgSpriteRight);
    ui.remove(rUI_selectSprite);
    ui.remove(rUI_rndTblSprite);
    ui.remove(rUI_wideBtn01);
    ui.remove(rUI_wideBtn01Txt);
    ui.remove(rUI_wideBtn02);
    ui.remove(rUI_wideBtn02Txt);
    ui.remove(rUI_smolBtn01);
    ui.remove(rUI_smolBtn01Txt);
    ui.remove(rUI_smolBtn02);
    ui.remove(rUI_smolBtn02Txt);
    ui.remove(rUI_smolBtn03);
    ui.remove(rUI_smolBtn03Txt);
    ui.remove(rUI_smolBtn04);
    ui.remove(rUI_smolBtn04Txt);
    ui.remove(rUI_smolBtn05);
    ui.remove(rUI_smolBtn05Txt);
    ui.remove(rUI_smolBtn06);
    ui.remove(rUI_smolBtn06Txt);
    ui.remove(rUI_txtSelectedName);
}
//#endregion 

//#region DIALOGS
let dialog01Background = two.makeSprite(PATH_IMG_DIALOG_BG_01, width/2, height/2, 1, 1, 1, false);
let dialog01Text = two.makeText("", width/2, height/2-210, { size: 18, fill: '#5B4636', family: 'Press Start 2P', alignment: 'center' });
let dialog02Text = two.makeText("", width/2, height/2-180, { size: 18, fill: '#5B4636', family: 'Press Start 2P', alignment: 'center' });
let dialog03Text = two.makeText("", width/2, height/2-150, { size: 18, fill: '#5B4636', family: 'Press Start 2P', alignment: 'center' });
let dialog04Text = two.makeText("", width/2, height/2-120, { size: 18, fill: '#5B4636', family: 'Press Start 2P', alignment: 'center' });
let dialogOKText = two.makeText("Proceed", width/2, height/2+240, { size: 18, fill: '#5B4636', family: 'Press Start 2P', alignment: 'center', decoration: 'underline' });

dialog01Background.visible = false;
dialog01Background.scale = 2;
function dialog01(msg) {
    isDialogOpen = true;
    dialog01Text.value = msg[0];
    dialog02Text.value = msg[1];
    dialog03Text.value = msg[2];
    dialog04Text.value = msg[3];

    ui.add(dialog01Background);
    ui.add(dialog01Text);
    ui.add(dialog02Text);
    ui.add(dialog03Text);
    ui.add(dialog04Text);
    ui.add(dialogOKText);
    dialog01Background.visible = true;

    let dSprite = document.getElementById(dialogOKText._id);
    if (dSprite) {
        dSprite.addEventListener('mouseover', () => { dialogOKText.fill = '#FF0000'; });
        dSprite.addEventListener('mouseout',  () => { dialogOKText.fill = '#5B4636'; });
    }
}
function redrawUDialogs() {
    width = window.innerWidth;
    height = window.innerHeight;

    dialog01Background.translation.set(width/2, height/2);
    dialog01Text.translation.set(width/2, height/2-210);
    dialog02Text.translation.set(width/2, height/2-180);
    dialog03Text.translation.set(width/2, height/2-150);
    dialog04Text.translation.set(width/2, height/2-120);
    dialogOKText.translation.set(width/2, height/2+240);
}
function removeDialog() {
    ui.remove(dialog01Background);
    ui.remove(dialog01Text);
    ui.remove(dialog02Text);
    ui.remove(dialog03Text);
    ui.remove(dialog04Text);
    ui.remove(dialogOKText);
    isDialogOpen = false;
}
//#endregion

function updateUIPositions() {
    //removeUITop();
    //removeUILeft();
    removeUIBottom();
    //removeUIRight();
    redrawUITop();
    redrawUILeft();
    redrawUIBottom();
    redrawUIRight();
    redrawUDialogs();
}

//#region FADE EFFECTS
function fadeToDark() {
    let overlay = document.getElementById("fadeOverlay");
    overlay.style.opacity = "0.8";
    // prevents clicks while dark
    overlay.style.pointerEvents = "auto";
}
function fadeToBlack() {
    let overlay = document.getElementById("fadeOverlay");
    overlay.style.opacity = "1";
    // prevents clicks while dark
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
//#endregion

//#region EVENT LOGGER
function pushToEventLog(msg) {
    // Prevent memory overflow
    if (eventLog.length > 9999) {
        eventLog.shift();
        logIndex--;
    }
    const formattedMsg = " - " + msg;
    eventLog.push(formattedMsg);
    logIndex = eventLog.length - 1;
    shownLog = eventLog.slice(Math.max(0, logIndex - 2), logIndex + 1);
    redrawUITop();
}
function eventLogUp() {
    if (logIndex > 2) {
        logIndex--;
        shownLog = eventLog.slice(logIndex - 2, logIndex + 1);
        redrawUITop();
    }
}
function eventLogDown() {
    if (logIndex + 1 < eventLog.length) {
        logIndex++;
        shownLog = eventLog.slice(logIndex - 2, logIndex + 1);
        redrawUITop();
    }
}
//#endregion 

//when done we want to add all these elements to element map so they are included in mouse checks, etc.
setTimeout(() => {
    ui.children.forEach(shape => {
        elementMap.set(shape._id, shape);
    });
}, 0);