//#region INIT DECLARATIONS
//moose pos info
const cursorPositionDiv = document.getElementById('cursor-position');
const hexPositionDiv = document.getElementById('hex-position');
const spriteCountDiv = document.getElementById('sprite-count');
const tooltipPosition = document.getElementById('tooltip-position');
let userConfig;
let two, ui, stage;  
let MAP_SEED, FOREST_SEED, SETTLEMENT_SEED;
let GRID_X_SIZE, GRID_Y_SIZE, HEX_ARR;
let HEX_SIZE, SHOW_DEBUG, SHOW_DEBUG_OVERLAY, params;
let map_start_x, map_start_y;
let sep_x, sep_y;
let curr_x, curr_y;
let colour_hex_group, debug_hex_group;
let townNames = [];
let eventLog = [];
let shownLog = [];
let logIndex = -1;
let selectedTile;
let turnNum = 1;
let friendlyUnitSprites = [];
let enemyUnitSprites = [];
let totGold = 0, totFood = 0;
let turnGold = 0, turnFood = 0;
let animatingEnemyMovement = false;
//#endregion

//LOAD CONFIG FROM FILE
loadConfig().then(() => {
    console.log("Config Loaded, intializaing...");

    hexPositionDiv.setAttribute('hidden', 'true');
    spriteCountDiv.setAttribute('hidden', 'true');
    tooltipPosition.setAttribute('hidden', 'true');

    //SEEDS
    MAP_SEED = Math.random();
    FOREST_SEED = Math.random();
    SETTLEMENT_SEED = Math.random();

    //GRID DATA ARR
    GRID_X_SIZE = userConfig.gridSizeX;//medium
    GRID_Y_SIZE = userConfig.gridSizeY;//medium
    // HEX_ARR = [GRID_Y_SIZE];
    HEX_ARR = new Array(GRID_Y_SIZE);

    //SET HEX GRID PARAMS
    HEX_SIZE = 24;
    SHOW_DEBUG = userConfig.debug;
    SHOW_DEBUG_OVERLAY = userConfig.debug_overlay;
    params = {         
        type: Two.Types.svg,  // Use Two.Types.canvas for CanvasRenderer                                                       
        fullscreen: true,
        autostart: true
    };
    two = new Two(params); 
    ui = new Two.Group();
    stage = new Two.Group();  

    //hex starting location in px
    map_start_x = two.width * 0.03;                                                      
    map_start_y = two.height * 0.05;
    //separation between hexes
    sep_x = 1.5*HEX_SIZE;                                                     
    sep_y = .86*HEX_SIZE;
    //x,y that hex will currently be drawn at
    curr_x = map_start_x;                                                               
    curr_y = map_start_y;
    colour_hex_group = new Two.Group();
    colour_hex_group.visible = !SHOW_DEBUG;
    debug_hex_group = new Two.Group();
    debug_hex_group.visible = SHOW_DEBUG;   

    // LOAD OTHER SCRIPTS
    console.log("Now Loading Scripts...");
    loadScript("audio.js", function () {
        console.log("audio.js Loaded");
        loadScript("ui.js", function () {
            console.log("ui.js Loaded");          
            loadScript("utils.js", function () {
                console.log("utils.js Loaded");
                loadScript("utilstwo.js", function () {
                    console.log("utilstwo.js Loaded");     
                    loadScript("input.js", function () {
                        console.log("input.js Loaded");            
                    });       
                });
            });
        });
    });
});

//builds the main gameplay map of hexes, based on generated perlin noise grayscale
function buildGrid(MAP_SEED) {
  return new Promise((resolve, reject) => {  
    two.appendTo(document.body);      

    //do stuff every frame
    two.bind('update', function(frameCount) {
        const now = performance.now();
        //animate selected unit sprite
        if (selectedTile!==undefined && selectedTile.animation) {
            const { startX, startY, endX, endY, startTime, duration } = selectedTile.animation;
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const easedT = easeInOutQuad(t);
            selectedTile.translation.x = startX + (endX - startX) * easedT;
            selectedTile.translation.y = startY + (endY - startY) * easedT;

            //animation done
            if (t >= 1) { delete selectedTile.animation; }
        }

        //animate enemy sprites
        let enemyAnimsRemaining = false;
        if (animatingEnemyMovement === true) {
            enemyUnitSprites.forEach(eSpr => {
                if (eSpr!==undefined && eSpr.animation) {
                    const { startX, startY, endX, endY, startTime, duration } = eSpr.animation;
                    const elapsed = now - startTime;
                    const t = Math.min(elapsed / duration, 1);
                    const easedT = easeInOutQuad(t);
                    eSpr.translation.x = startX + (endX - startX) * easedT;
                    eSpr.translation.y = startY + (endY - startY) * easedT;
        
                    //animation done - track
                    if (t >= 1) { 
                        delete eSpr.animation; 
                        enemyAnimsRemaining = true;
                    }
                }
            });
            if (enemyAnimsRemaining = false) {
                animatingEnemyMovement = false;
            }
        }
    });

    //apply noise
    noise.seed(MAP_SEED);

    //iterate by row, col
    for (let i=0; i<GRID_Y_SIZE; i++) {
        HEX_ARR[i] = new Array(GRID_X_SIZE);                    
      
        for (let j=0; j<GRID_X_SIZE; j++) {    
            //odd col, shift down
            if (j%2!==0) curr_y += 0.86*HEX_SIZE;       
            else         curr_y -= 0.86*HEX_SIZE;

            //for each grid index, draw hex then increment by separation val
            let hex = two.makePolygon(curr_x, curr_y, HEX_SIZE, 6);

            //GENERATE NOISE & COLOUR       
            let value = (noise.perlin2(curr_x / 200, curr_y / 200) + 1) * 0.5 * 255;
            value = Math.min(255, Math.max(0, value)); // Ensure it's within the 0-255 range          
            // Apply a dark bias by using a higher exponent to squash values toward dark
            value = Math.pow(value / 255, 2.0) * 255; // Exponent greater than 1 to favor darker values          
            let grayscale = (value << 16) | (value << 8) | value; // Create the grayscale color
            let gray = '#' + grayscale.toString(16).padStart(6, '0'); // Convert to hex and pad to 6 digits        
            
            hex.visible = false;
            hex.fill = colourize(gray);
            hex.linewidth = 2;
            hex.gridX = j;
            hex.gridY = i;
            hex.moveCost = 0;
            if (SHOW_DEBUG) colour_hex_group.add(hex);   

            let moveCost, atkBonus, defBonus = 0;
                
            //DEBUG GRID
            if (SHOW_DEBUG) {
                let debugHex = hex.clone();
                debugHex.visible = true;
                debugHex.fill = gray;
                debug_hex_group.add(debugHex);               
                //add hex info text overlay to debug text group, show hex greyscale value
                let hexTxt = two.makeText(gray, curr_x, curr_y+10, {                 
                    size: 8,
                    fill: '#FFFF00'
                });
                //show grid coord
                let hexTxt2 = two.makeText(i+","+j, curr_x, curr_y-3, {               
                    size: 15,
                    fill: '#FFFF00'
                });      
                debug_hex_group.add(hexTxt, hexTxt2);     
            }

            //rules based on tile type
            if (hex.fill === COLOUR_GRASS) {
                let grassSpriteChance = Math.random();
                let thisSprite = null;

                if (grassSpriteChance < 0.7) {
                    thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS01, hex, '', 1, 1, 1, false, 3, false, true, 1, "unset", hexParams.grass);   
                    thisSprite.depth = 1;  
                }
                else if (grassSpriteChance < 0.75) {
                    thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS03, hex, '', 1, 1, 1, false, 3, false, true, 1, "unset", hexParams.grass);     
                    thisSprite.depth = 1;  
                }
                else if (grassSpriteChance < 0.8) {
                    thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS05, hex, '', 1, 1, 1, false, 3, false, true, 1, "unset", hexParams.grass);     
                    thisSprite.depth = 1;  
                }
                else {
                    thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS04, hex, '', 1, 1, 0, false, 3, false, true, 1, "unset", hexParams.grass);     
                    thisSprite.depth = 1;  
                }

            }
            else if (hex.fill === COLOUR_WATER) { 
                var randSpeed = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
                var randSpawn = Math.random();
                hex.moveCost = 98; 
                //chance for extra sprite
                if (randSpawn <= .2 && randSpawn > .1) {
                    addSpriteToTile(PATH_IMG_HEX_WATER02, hex, '', 6, 1, randSpeed, true, 3, false, true, 1, "unset", hexParams.water);   
                }
                else if (randSpawn <= .1) {
                    addSpriteToTile(PATH_IMG_HEX_WATER03, hex, '', 4, 2, randSpeed*2, true, 3, false, true, 1, "unset", hexParams.water);   
                }
                else {
                    addSpriteToTile(PATH_IMG_HEX_WATER01, hex, '', 1, 1, 1, true, 3, false, true, 1, "unset", hexParams.water);   
                }
            }
            else if (hex.fill === COLOUR_WATER_DEEP) {
                hex.moveCost = 98; 
                //chance for extra sprite, but different way
                addSpriteToTile(PATH_IMG_HEX_WATER_DEEP01, hex, 'Rocky Islets', 1, 1, 1, false, 3, false, true, 1, "unset", hexParams.water);   
                if (Math.random() < 0.4) {
                    let iconNo = getRandomInt(2)+1;
                    let imagePath = PATH_IMG_WATER_DEEP + iconNo + ".png";
                    addSpriteToTile(imagePath, hex, 'Rocky Islets');  
                }
            }
            else if (hex.fill === COLOUR_MOUNTAIN) { 
                hex.moveCost = 3; 
                let mountainSpriteChance = Math.random();
                if (mountainSpriteChance < .65) {
                    addSpriteToTile(PATH_IMG_HEX_MOUNTAIN01, hex, 'Mountain', 1, 1, 1, false, 0, false, true, 1, "unset", hexParams.mountain);
                    //chance to spawn a cave on this tile
                    let caveSpriteChance = Math.random();
                    if (caveSpriteChance < .12) {
                        caveSpr = addSpriteToTile(PATH_IMG_CAVE_SM01, hex, 'Cave', 1, 1, 1, false, 0, false, false, 99, "unset", unitParams.cave);
                    }
                }
                else {
                    addSpriteToTile(PATH_IMG_HEX_MOUNTAIN02, hex, 'Mountain', 1, 1, 1, false, -7, false, true, 1, "unset", hexParams.mountain);                
                }
            }
            else if (hex.fill === COLOUR_MOUNTAIN_PEAK) { 
                hex.moveCost = 98; 
                addSpriteToTile(PATH_IMG_HEX_PEAK01, hex, 'Peaks', 1, 1, 1, false, -10, false, true, 1, "unset", hexParams.peak);    
            }
            else if (hex.fill === COLOUR_COAST) { 
                //dont do anything b/c all coasts get overridden anyways
                //addSpriteToTile(PATH_IMG_HEX_MARSH02, hex, 'Coast??', 1, 1, 1, false, 1, false, true, 1);
            }

            // TODO: add special tiles, ie mordreds lair
            // find mountain_peak tile farthest from center, make it final_tower tile
            // if no peak, use farthest mountain - if no mountain, use farthest forest
            
            if (SHOW_DEBUG) stage.add(hex);
            
            //all done - populate data array
            HEX_ARR[i][j] = {
                "id"      : hex._id,
                "colour"  : hex.fill,
                "gridX"   : j,
                "gridY"   : i,
                "moveCost": hex.moveCost,
                "atkBonus": atkBonus,
                "defBonus": defBonus,
            }      
            
            curr_x += sep_x;      
        }

        //after every row, return to starting x, then increment y
        curr_x = map_start_x;                                                                
        curr_y += sep_y*2;
        //   if (SHOW_DEBUG) two.add(debug_hex_group);
        }   

        if (SHOW_DEBUG) stage.add(debug_hex_group);

        setTimeout(drawForests, 0);
        setTimeout(drawSettlements, 0);
        setTimeout(drawTreasure, 0);
        setTimeout(drawEnemies, 0);
        setTimeout(sortSprites, 1000);

        two.add(stage);


        if (SHOW_DEBUG_OVERLAY) {
            hexPositionDiv.removeAttribute('hidden');
            spriteCountDiv.removeAttribute('hidden');
            tooltipPosition.removeAttribute('hidden');
        }

        resolve();
    });
}

//sort sprites to prevent z-issues. removes hexes w/dupe coords first.
function sortSprites() {
    let numSpritesRemoved = 0;
    //first find all sprites with same grixX & gridY, remove grass underneath
    for (let i = 0; i < stage.children.length; i++) {
        let childA = stage.children[i];      
        for (let j = i + 1; j < stage.children.length; j++) {
            let childB = stage.children[j];
            if (childA.gridX === childB.gridX && childA.gridY === childB.gridY && childA.isHex && childB.isHex) {
                if (childA.depth === 1 && childB.depth === 99) {
                    numSpritesRemoved++;
                    stage.children.splice(i, 1);
                    i--; // step back after removal
                    break; // exit inner loop since childA is gone
                } else if (childB.depth === 1 && childA.depth === 99) {
                    numSpritesRemoved++;
                    stage.children.splice(j, 1);
                    j--; // adjust index after removal
                }
            }
        }
    }
    console.log("total sprites removed: " + numSpritesRemoved);

    stage.children.sort((a, b) => {        
        //prioritize items with depth === 1
        if ((a.depth || 0) === 1 && (b.depth || 0) !== 1) return -1;
        if ((a.depth || 0) !== 1 && (b.depth || 0) === 1) return 1;
        //move items with isHex === false to the end
        if (!!a.isHex !== !!b.isHex) return !!b.isHex - !!a.isHex;

        //sort by gridY
        return a.gridY - b.gridY;
    });
}

//adds forest sprites to stage
var lastTileWasForest = false;
function drawForests() {
    console.log("drawForests()");
    for (let i = 0; i < GRID_Y_SIZE; i++) {
        for (let j = 0; j < GRID_X_SIZE; j++) {
            //let randomValue = seededRandom(FOREST_SEED);
            let hid = HEX_ARR[i][j]['id'];
            let hiq = document.getElementById(hid);
            if (hiq===null) continue;
            let hexColour = HEX_ARR[i][j]['colour'];
            hiq.setAttribute("gridX", j);
            hiq.setAttribute("gridY", i);

            // Convert coastal tiles not beside water into forests, else %chance for coastal
            if (hexColour === COLOUR_COAST && !checkAdjacentHex(j, i, 1, COLOUR_WATER)) {
                hiq.setAttribute("fill", COLOUR_FOREST);
                hiq.setAttribute("moveCost", 1);
                HEX_ARR[i][j]['colour'] = COLOUR_FOREST;
                HEX_ARR[i][j]['moveCost'] = 1;
                lastTileWasForest = true;

                addSpriteToTile(PATH_IMG_HEX_FOREST01, hiq, 'Forest', 1, 1, 1, false, 1, false, true, 99, "unset", hexParams.forest);
            } 
            else if (hexColour === COLOUR_COAST) {
                let randomValue = Math.random();
                if (randomValue < .16) {
                    hiq.setAttribute("fill", COLOUR_MARSH);
                    HEX_ARR[i][j]['colour'] = COLOUR_MARSH;
                    HEX_ARR[i][j]['moveCost'] = 2;
                    if (Math.random() < .5) {
                        addSpriteToTile(PATH_IMG_HEX_MARSH01, hiq, 'Marsh', 1, 1, 0, false, 1, false, true, 99, "unset", hexParams.marsh);
                    }
                    else {
                        addSpriteToTile(PATH_IMG_HEX_MARSH02, hiq, 'Marsh', 1, 1, 0, false, 1, false, true, 99, "unset", hexParams.marsh);
                    }
                }
                else if (randomValue < 1/2) { // Adjust this threshold for more/less aggressive spread
                    hiq.setAttribute("fill", COLOUR_FOREST);
                    hiq.setAttribute("moveCost", 1);
                    HEX_ARR[i][j]['colour'] = COLOUR_FOREST;
                    HEX_ARR[i][j]['moveCost'] = 1;
                    lastTileWasForest = true;
                    if (Math.random() < .5) {
                        addSpriteToTile(PATH_IMG_HEX_FOREST02, hiq, 'Forest', 1, 1, 1, false, 1, false, true, 99, "unset", hexParams.forest);
                    }  
                    else {            
                        addSpriteToTile(PATH_IMG_HEX_FOREST04, hiq, 'Forest', 1, 1, 1, false, -2, false, true, 99, "unset", hexParams.forest);
                    }
                }
                else  {
                    hiq.setAttribute("fill", COLOUR_FOREST);
                    hiq.setAttribute("moveCost", 1);
                    HEX_ARR[i][j]['colour'] = COLOUR_FOREST;
                    HEX_ARR[i][j]['moveCost'] = 1;
                    lastTileWasForest = true;
                    addSpriteToTile(PATH_IMG_HEX_FOREST03, hiq, 'Forest', 1, 1, 1, false, -2, false, true, 99, "unset", hexParams.forest);
                }
            }

            // Check if this tile is a forest, then attempt to spread to neighbors
            if (HEX_ARR[i][j]['colour'] === COLOUR_FOREST) {
                // Try spreading forest to adjacent tiles (1 tile away in all directions).
                const evenQNeighbors = [
                    [+1,  0], [0, -1], [-1, -1],
                    [-1,  0], [-1, +1], [0, +1]
                ];            
                const oddQNeighbors = [
                    [+1,  0], [+1, -1], [0, -1],
                    [-1,  0], [0, +1], [+1, +1]
                ];
                let directions = (j % 2 === 0) ? evenQNeighbors : oddQNeighbors;


                for (let [dx, dy] of directions) {
                    let nx = j + dx;
                    let ny = i + dy;

                    // Ensure the neighbor coordinates are within bounds
                    if (nx >= 0 && nx < GRID_X_SIZE && ny >= 0 && ny < GRID_Y_SIZE) {
                        let neighborColour = HEX_ARR[ny][nx]['colour'];

                        // If the neighbor is grass, give it a chance to become a forest
                        if (neighborColour === COLOUR_GRASS) {
                            let neighborHex = document.getElementById(HEX_ARR[ny][nx]['id']);
                            if (neighborHex===null) continue;
                            neighborHex.setAttribute("gridX", nx);
                            neighborHex.setAttribute("gridY", ny);
                            if (Math.random() < 0.35) { // Adjust this threshold for more/less aggressive spread
                                neighborHex.setAttribute("fill", COLOUR_FOREST);
                                neighborHex.setAttribute("moveCost", 1);
                                HEX_ARR[ny][nx]['colour'] = COLOUR_FOREST;
                                HEX_ARR[ny][nx]['moveCost'] = 1;
                                addSpriteToTile(PATH_IMG_HEX_FOREST02, neighborHex, 'Forest', 1, 1, 1, false, 1, false, true, 99, "unset", hexParams.forest);
                            }
                        }
                    }
                }
            }
        }
    }
}

//adds castle/towns/farms sprites to stage
function drawSettlements() {   
    console.log("drawSettlements()");   
    let centerX = Math.floor(GRID_X_SIZE / 2);
    let centerY = Math.floor(GRID_Y_SIZE / 2);  
    let hexList = [];
    let isFirst = true;
    let numSpecialAbbeys = 0;

    // Collect all hexes with their distances
    for (let i = 0; i < GRID_Y_SIZE; i++) {    
        for (let j = 0; j < GRID_X_SIZE; j++) {    
            let distance = Math.sqrt(Math.pow(j - centerX, 2) + Math.pow(i - centerY, 2));
            hexList.push({ i, j, distance });
        }
    }

    // Sort hexes by distance from center
    hexList.sort((a, b) => a.distance - b.distance);

    // Now iterate over hexes in distance order
    for (let { i, j } of hexList) {
      let hid = HEX_ARR[i][j]['id'];
      let hiq = document.getElementById(hid);      
      if (hiq===null) continue;
      let hexColour = HEX_ARR[i][j]['colour'];

      // Determine if valid tile for a settlement to be placed
      if (hexColour !== COLOUR_WATER && 
          hexColour !== COLOUR_WATER_DEEP && 
          hexColour !== COLOUR_MOUNTAIN && 
          hexColour !== COLOUR_MOUNTAIN_PEAK && 
          hexColour !== COLOUR_COAST && 
          hexColour !== COLOUR_FOREST && 
          checkAdjacentHex(j, i, 3, COLOUR_WATER)) {
            //if first valid tile, make capital city
            if (isFirst) {
                //console.log("CAPITAL MARKED: " + i + ", " + j);
                hiq.setAttribute("fill", COLOUR_SETTLEMENT);
                hiq.setAttribute("gridX", j);
                hiq.setAttribute("gridY", i);
                HEX_ARR[i][j]['colour'] = COLOUR_SETTLEMENT;
                addSpriteToTile(PATH_IMG_HEX_CASTLE01, hiq, 'Castle Camelot', 1, 1, 1, false, -4, true, false, 99, "friendly", hexParams.camelot);
                isFirst = false;

                // spawn starting unit on valid tile - checks grass first, then forest
                validTiles = checkAllAdjacentHex(j, i, 1, COLOUR_GRASS) || checkAllAdjacentHex(j, i, 1, COLOUR_FOREST);
                let randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];

                let kid = randomTile['id'];
                let kiq = document.getElementById(kid);
                let arthurSpr = addSpriteToTile(PATH_IMG_NPC_KNIGHT, kiq, 'King Arthur', 1, 1, 1, false, 0, true, false, 99, "friendly", unitParams.knight_arthur);   
                friendlyUnitSprites.push(arthurSpr);
            }
            else {
                // If not % chance pass, and not within x tiles of another settlement
                if (Math.random() < 0.18 && !checkAdjacentHex(j, i, 9, COLOUR_SETTLEMENT) && !checkAdjacentHex(j, i, 9, COLOUR_CURSEDABBEY)) {
                    //splash in abbeys (closer to home): chance to make this an abbey (up to 4), else settlement
                    if (Math.random() < 0.1 && numSpecialAbbeys<4) {
                        //console.log("SPECIAL ABBEY MARKED: " + i + ", " + j);
                        hiq.setAttribute("fill", COLOUR_CURSEDABBEY);
                        HEX_ARR[i][j]['colour'] = COLOUR_CURSEDABBEY;
                        addSpriteToTile(PATH_IMG_HEX_CURSEDABBEY, hiq, 'Abbey', 1, 1, 1, false, 1, false, true, 99, "hostile", hexParams.abbey);
                        numSpecialAbbeys++;
                    }
                    else {
                        //console.log("SETTLEMENT MARKED: " + i + ", " + j);
                        hiq.setAttribute("fill", COLOUR_SETTLEMENT);
                        HEX_ARR[i][j]['colour'] = COLOUR_SETTLEMENT;
                        
                        //generate windmill(s) - up to 2
                        numMills = getRandomInt(2);
                        let validTiles = []
                        //if 2 is rolled, another 50% chance to become 1
                        if (numMills === 2 && Math.random() < 0.5) { numMills = 1; }
                        // console.log(numMills + " mills generated for this settlement.");
                        if (numMills > 0) { 
                            validTiles = checkAllAdjacentHex(j, i, 3, COLOUR_GRASS);
                        }
                        //place mills
                        for (let k = 1; k <= numMills; k++) {
                            //console.log("FARM MARKED: " + i + ", " + j);
                            let randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];
                            let mid = randomTile['id'];
                            let miq = document.getElementById(mid);

                            miq.setAttribute("fill", COLOUR_FARM);
                            // hiq.setAttribute("fill", COLOUR_FARM);
                            //miq.setAttribute("gridX", randomTile.gridX);
                            //miq.setAttribute("gridY", randomTile.gridY);
                            HEX_ARR[randomTile.gridY][randomTile.gridX]['colour'] = COLOUR_FARM;

                            let randSpeed = Math.floor(Math.random() * (8 - 1 + 2)) + 2;
                            if (Math.random() < 0.5) {
                                addSpriteToTile(PATH_IMG_HEX_FARM01, miq, 'Farmland', 1, 1, 1, false, 3, true, true, 99, "hostile", hexParams.farm);
                                let millSprite = addSpriteToTile(PATH_IMG_MILL_ANIM, miq, 'Mill', 4, 1, randSpeed, true, 0, false, false, 99, "hostile", unitParams.mill);
                                millSprite.scale = .7;
                            }
                            else {
                                addSpriteToTile(PATH_IMG_HEX_FARM02, miq, 'Farmland', 1, 1, 1, false, 3, true, true, 99, "hostile", unitParams.farm);
                                let millSprite = addSpriteToTile(PATH_IMG_ANIM_MILL_SM, miq, 'Mill', 4, 1, randSpeed-1, true, 0, false, hexParams, 99, "hostile", unitParams.mill);
                                // millSprite.scale = .8;
                            }                            
                        }
                    
                        //add settlement sprite after so it renders on top?
                        if (Math.random() < 0.5) {
                            addSpriteToTile(PATH_IMG_HEX_SETTLEMENT01, hiq, 'Town', 1, 1, 1, true, -2, true, true, 99, "hostile", hexParams.town);
                        }
                        else {
                            addSpriteToTile(PATH_IMG_HEX_SETTLEMENT02, hiq, 'Village', 1, 1, 1, true, -1, true, true, 99, "hostile", hexParams.village);
                        }     
                    }        
                }
            }
        }
    }
}

//adds treasure sprites to stage
function drawTreasure() {
    console.log("drawTreasure()");   
    let centerX = Math.floor(GRID_X_SIZE / 2);
    let centerY = Math.floor(GRID_Y_SIZE / 2);  
    let hexList = [];
    let placedTreasures = []; // Store placed chest coordinates
    let numTreasure = 0;

    // Collect all hexes with their distances
    for (let i = 0; i < GRID_Y_SIZE; i++) {    
        for (let j = 0; j < GRID_X_SIZE; j++) {    
            let centerDistance = Math.sqrt(Math.pow(j - centerX, 2) + Math.pow(i - centerY, 2));
            hexList.push({ i, j, centerDistance });
        }
    }
    // Sort hexes by distance from center
    hexList.sort((a, b) => a.centerDistance - b.centerDistance);

    // Function to check if a new chest is at least x tiles away from all placed chests
    function isFarEnough(x, y) {
        for (let { i, j } of placedTreasures) {
            let trDistance = Math.sqrt(Math.pow(j - x, 2) + Math.pow(i - y, 2));
            if (trDistance < 12) return false;
        }
        return true;
    }

    // Now iterate over hexes in distance order
    for (let { i, j, centerDistance } of hexList) {
        if (numTreasure >= 9) break; // Stop when 9 treasures are placed
        if (centerDistance < 6) continue; // Skip hexes too close to center

        let hid = HEX_ARR[i][j]['id'];
        let hiq = document.getElementById(hid);
        if (hiq===null) continue;
        let hexColour = HEX_ARR[i][j]['colour'];

        // Determine if valid tile for a treasure to be placed
        if (hexColour !== COLOUR_WATER && 
            hexColour !== COLOUR_WATER_DEEP && 
            hexColour !== COLOUR_MOUNTAIN && 
            hexColour !== COLOUR_MOUNTAIN_PEAK && 
            hexColour !== COLOUR_SETTLEMENT && 
            hexColour !== COLOUR_CURSEDABBEY && 
            hexColour !== COLOUR_FARM &&
        checkAllAdjacentHex(j, i, 8, COLOUR_SETTLEMENT) &&
            isFarEnough(j, i)) {  // Ensure no nearby chests
                
            // Place chest with a 10% chance
            if (Math.random() < 0.05) {
                addSpriteToTile(PATH_IMG_CHEST_SM01, hiq, 'Treasure?', 1, 1, 1, false, 12, false, false, 99, "neutral", unitParams.chest);
                placedTreasures.push({ i, j }); // Store the placed chest location
                numTreasure++;
            }
        }
    }
}

//adds enemy unit sprites to stage
function drawEnemies() {
    console.log("drawEnemies()");
    let centerX = Math.floor(GRID_X_SIZE / 2);
    let centerY = Math.floor(GRID_Y_SIZE / 2);  
    let hexList = [];
    let placedEnemies = []; // track placed enmy coords
    let numEnemies = 0;

    // Collect all hexes with their distances
    for (let i = 0; i < GRID_Y_SIZE; i++) {    
        for (let j = 0; j < GRID_X_SIZE; j++) {    
            let centerDistance = Math.sqrt(Math.pow(j - centerX, 2) + Math.pow(i - centerY, 2));
            hexList.push({ i, j, centerDistance });
        }
    }
    // Sort hexes by distance from center
    hexList.sort((a, b) => b.centerDistance - a.centerDistance);

    // Function to check if an enemy is at least x tiles away from all placed chests
    function isFarEnough(x, y) {
        for (let { i, j } of placedEnemies) {
            let trDistance = Math.sqrt(Math.pow(j - x, 2) + Math.pow(i - y, 2));
            if (trDistance < 9) return false;
        }
        return true;
    }

    // Now iterate over hexes in distance order
    for (let { i, j, centerDistance } of hexList) {
        if (numEnemies >= 20) break; // Stop when x treasures are placed
        if (centerDistance < 12) continue; // Skip hexes too close to center

        let hid = HEX_ARR[i][j]['id'];
        let hiq = document.getElementById(hid);
        if (hiq===null) continue;
        let hexColour = HEX_ARR[i][j]['colour'];

        // Determine if valid tile for an enemy to be placed
        if (hexColour !== COLOUR_WATER && 
            hexColour !== COLOUR_WATER_DEEP && 
            hexColour !== COLOUR_MOUNTAIN && 
            hexColour !== COLOUR_MOUNTAIN_PEAK && 
            hexColour !== COLOUR_SETTLEMENT && 
            hexColour !== COLOUR_CURSEDABBEY && 
            hexColour !== COLOUR_FARM &&
        checkAllAdjacentHex(j, i, 8, COLOUR_SETTLEMENT) &&
            isFarEnough(j, i)) {  // Ensure no nearby enemies
                
            // Place enemy with a % chance
            if (Math.random() < 0.15) {
                skellySpr = addSpriteToTile(PATH_IMG_NPC_SKELLY, hiq, 'Skeletons', 1, 1, 1, false, 2, false, false, 99, "hostile", unitParams.skelly);
                placedEnemies.push({ i, j }); // Store the placed enemy location                
                enemyUnitSprites.push(skellySpr);
                numEnemies++;
            }
        }
    }

    console.log("Enemies spawned: " + numEnemies);
}

//adds a sprite on top of passed hex
function addSpriteToTile(path, tile, desc, rows = 1, cols = 1, framerate = 1, start = false, yOffset = 0, clickable = false, isHex = false, depth = 99, friendly = "unset", params = unitParams.default) {
    // Get the bounding box to determine center
    let bbox = tile.getBoundingClientRect();
    let center_x = bbox.left + bbox.width / 2;
    let center_y = bbox.top + bbox.height / 2;      
    let imgOffsetY = (-HEX_SIZE * 0.2) +2 +yOffset;
    
    let sprite = two.makeSprite(path, center_x, center_y + imgOffsetY, rows, cols, framerate, start);
    if (typeof tile.getAttribute === "function") {
      sprite.gridX = parseInt(tile.getAttribute("gridX"), 10);
      sprite.gridY = parseInt(tile.getAttribute("gridY"), 10);
      sprite.moveCost = parseInt(tile.getAttribute("moveCost"), 10);
    }
    else if (tile.gridX !== undefined) {
      sprite.gridX = tile.gridX;
      sprite.gridY = tile.gridY;
      sprite.moveCost = tile.moveCost;
    }

    sprite.path = path;
    sprite.desc = desc ?? '';
    sprite.clickable = clickable;
    sprite.isHex = isHex;
    sprite.depth = depth;
    sprite.params = structuredClone(params);
    //% chance that sprite will be flipped horizontally (for variety)
    if (Math.random()<0.5) sprite.scale = new Two.Vector(-1, 1);
    stage.add(sprite);

    if (friendly !== "unset") two.update();
    let spriteDOM  = document.getElementById(sprite._id);
    if (spriteDOM) {
        switch(friendly) {
            case "friendly":
                spriteDOM.classList.add('glowing-friendly');
                break;
            case "hostile":
                spriteDOM.classList.add('glowing-hostile');
                break;
            case "neutral":
                spriteDOM.classList.add('glowing-neutral');
                break;
            case "unset":
            default:
                break;
        }
    }

    //if a poi, randomly choose one event text from default array
    if (params.eventText !== undefined) {
        let chosenEventText = params.eventText[Math.floor(Math.random() * params.eventText.length)];        
        sprite.params.eventText = [chosenEventText];
    }

    //draw paper labels for certain sprites (ie settlements)
    if (params.type === "castle") {
        let paperSprite = two.makeSprite(PATH_IMG_PAPER_LABEL, center_x, center_y + 20, 1, 1, 1, false);
        let paperText = two.makeText("Camelot", center_x, center_y + 21, { size: 7, fill: '#000000', family: 'Press Start 2P', alignment: 'center' });
        paperSprite.scale = 0.5;
        paperSprite.depth = 99;
        paperText.linewidth = 1;
        paperSprite.noPointerEvents = true;
        paperText.noPointerEvents = true;
        stage.add(paperSprite); 
        stage.add(paperText); 
    }
    else if (params.subtype === "town" || params.subtype === "village") {
        let randomTownName = generateTownName(townNames);
        let paperSprite = two.makeSprite(PATH_IMG_PAPER_LABEL, center_x, center_y + 20, 1, 1, 1, false);
        let paperText = two.makeText(randomTownName, center_x, center_y + 21, { size: 6, fill: '#4f4f4f', family: 'Press Start 2P', alignment: 'center' });
        paperSprite.scale = 0.5;
        paperSprite.depth = 99;
        paperSprite.noPointerEvents = true;
        townNames.push(randomTownName);
        stage.add(paperSprite); 
        stage.add(paperText); 
    }    

    return sprite;
}

//check adjacent tiles, within given range, by given colour. returns true on first found, false if none adjacent matching range & colour.
function checkAdjacentHex(x, y, range, colour) {    
    for (let i = Math.max(0, y - range); i <= Math.min(GRID_Y_SIZE - 1, y + range); i++) {
        for (let j = Math.max(0, x - range); j <= Math.min(GRID_X_SIZE - 1, x + range); j++) {
            // Check if tile is within the correct range
            if (Math.abs(i - y) + Math.abs(j - x) <= range * 2) {  
                // Check if colour matches      
                if (HEX_ARR[i][j]['colour'] === colour) {          
                    return true;
                }
            }
        }
    }
  
    return false;
}
//check adjacent tiles, within given range, by given colour. returns array of all matching tiles, false if none adjacent matching range & colour.
function checkAllAdjacentHex(x, y, range, colour) {
    let foundArr = [];    
    for (let i=0; i<GRID_Y_SIZE; i++) {
        for (let j=0; j<GRID_X_SIZE; j++) {
            //first check if tile coord is within range
            if (Math.abs(i-y)+Math.abs(j-x) <= range*2 &&
                Math.abs(i-y) <= range &&
                Math.abs(j-x) <= range      
            ) {  
                // then check if colour matches      
                if (HEX_ARR[i][j]['colour'] === colour) {          
                    foundArr.push(HEX_ARR[i][j]);
                }
            }
        }
    }
  
    if (foundArr.length > 0) {
        return foundArr;
    } 
    else {
        return false;
    }
}
//returns all sprites within a given range - excludes center tile. matches colour or returns all if colour is null.
function getAdjacentHexSprites(x, y, range, colour = null) {
	let foundArr = [];
    const origin = offsetToCube(x, y);
    for (let row = 0; row < GRID_Y_SIZE; row++) {
        for (let col = 0; col < GRID_X_SIZE; col++) {
			//odd-q grid maths
            const target = offsetToCube(col, row);
            const dist = cubeDistance(origin, target);
            if (dist > 0 && dist <= range) {
                const hex = HEX_ARR[row][col];
                if (!colour || hex.colour === colour) {
                    foundArr.push(hex);
                }
            }
        }
    }

    if (foundArr.length === 0) return false;

    // Match sprites based on gridX/gridY
    let spriteArr = [];
    foundArr.forEach(hex => {
		const sprite = stage.children.find(child =>
			child.gridX === hex.gridX && child.gridY === hex.gridY
		);
		if (sprite && sprite.isHex) {
            //sprite.moveCost = hex.moveCost;
			spriteArr.push(sprite);
		}
	});

    return spriteArr;
}

//find colour designated for submitted grayscale value
function colourize(grayscale) {
    if (grayscale.length < 7) return COLOUR_GRASS; // If invalid, return grass

    let rgb = hexToRgb(grayscale);
    let bright = brightness(rgb);

    // Define the thresholds for various terrain types  
    // High brightness -> Deep water (light shades)
    if (bright >= 180) {
        return COLOUR_WATER_DEEP; // Deep water
    }
    else if (bright >= 110) {  
        return COLOUR_WATER; // Shallow water
    }
    else if (bright >=95) { 
        return COLOUR_COAST; 
    }
    else if (bright < 20 &&  bright > 7) {  // Low brightness -> Mountains (dark shades)
        return COLOUR_MOUNTAIN;  // EMountain color for very dark regions
    }
    else if (bright < 8) {
        return COLOUR_MOUNTAIN_PEAK; 
    }
    else {  // Default for middle-range brightness -> Grass
        return COLOUR_GRASS;
    }
}

//move a sprite from one location to another. takes two sprites: moving spr and dest spr
function moveUnitToSpriteLocation(movingElem, destinationElem) {
    movingElem.animation = {
        startX: movingElem.translation.x,
        startY: movingElem.translation.y,
        endX: destinationElem._position._x,
        endY: destinationElem._position._y,
        startTime: performance.now(),
        duration: 600
    };

    //update sprite position data
    if (typeof destinationElem.getAttribute === "function") {
        movingElem.params.ap_cur -= parseInt(destinationElem.getAttribute("moveCost"), 10) +1;
    }
    else if (destinationElem.moveCost !== undefined) {
        movingElem.params.ap_cur -= destinationElem.moveCost +1;
    }
    movingElem.gridX = destinationElem.gridX;
    movingElem.gridY = destinationElem.gridY;

    //collide with poi
    if (movingElem.params.type === "knight") {
        //search stage.children for marching gridX, gridY. 
        let poi = stage.children.find(shape =>
            shape._id   !== movingElem._id        &&
            shape.gridX === destinationElem.gridX &&
            shape.gridY === destinationElem.gridY &&
            shape.isHex === false
        );
        if (poi!==undefined && poi.params.type==="poi") {
            //get type and open dialog
            switch (poi.params.poi) {
                case "chest":
                    dialog01([poi.params.dialogText]);
                    stage.remove(poi);
                    break;
                case "cave":
                    if (!poi.params.explored) {
                        dialog01([poi.params.dialogText]);
                        poi.params.explored = true;
                    }
                    else {                    
                        dialog01(["This cave has already been cleared out."]);
                    }
                    break;
                case "mill":
                    if (!poi.params.explored) {
                        dialog01([poi.params.dialogText]);
                        poi.params.explored = true;
                    }
                    else {                    
                        dialog01(["This farm has already been reclaimed."]);
                    }
                    break;
                default:
                    dialog01(["*unknown poi*"]);
                    break;
            }
        }
    }

}

//TODO: move enemy pieces
function moveEnemiesEoT() {    
    console.log("moving enemy sprites");
    animatingEnemyMovement = true;
    enemyUnitSprites.forEach(eSpr => {
        //apply pathfinding rules for each enemy on map
        if (eSpr.params.ai === "stupid") {
            //stupid ai - moves to a random adjacent tile
            let adjHexSprites = getAdjacentHexSprites(eSpr.gridX, eSpr.gridY, 1);
            const adjHexSprite = adjHexSprites[Math.floor(Math.random() * adjHexSprites.length)];
            moveUnitToSpriteLocation(eSpr, adjHexSprite);
        }
        else {
            console.log("Enemy has no brain: ", eSpr);
        }
    });
}

//do some stuff when page loads
document.addEventListener("DOMContentLoaded", () => {
    const clouds = document.querySelectorAll(".cloud");

    clouds.forEach(cloud => {
        // Set a random top position between 1% and 99% of the viewport height
        let randomTop = Math.floor(Math.random() * 99) + 1;
        cloud.style.top = `${randomTop}%`;
    });
});