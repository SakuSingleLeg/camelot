// MOUSE POS INFO
const cursorPositionDiv = document.getElementById('cursor-position');
const hexPositionDiv = document.getElementById('hex-position');
const spriteCountDiv = document.getElementById('sprite-count');
const tooltipPosition = document.getElementById('tooltip-position');

//INIT DECLARATIONS
let userConfig;
let two, ui, stage;  
let MAP_SEED, FOREST_SEED, SETTLEMENT_SEED;
let GRID_X_SIZE, GRID_Y_SIZE, HEX_ARR;
let HEX_SIZE, SHOW_DEBUG, params;
let map_start_x, map_start_y;
let sep_x, sep_y;
let curr_x, curr_y;
let colour_hex_group, debug_hex_group;


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
    HEX_ARR = [GRID_X_SIZE];

    //SET HEX GRID PARAMS
    HEX_SIZE = 24;
    SHOW_DEBUG = userConfig.debug;
    params = {                                                                
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
    loadScript("ui.js", function () {
        console.log("ui.js Loaded");        
        loadScript("utils.js", function () {
            console.log("utils.js Loaded");
            loadScript("input.js", function () {
                console.log("input.js Loaded");            
            });
        });
    });
});


//FUNCTIONS//
function buildGrid(MAP_SEED) {
  return new Promise((resolve, reject) => {  
    two.appendTo(document.body);      

    //do stuff every frame
    two.bind('update', function(frameCount) {
    });

    //apply noise
    noise.seed(MAP_SEED);

    //iterate by row, col
    for (let i=0; i<GRID_Y_SIZE; i++) {
      HEX_ARR[i] = [];                         
      
      for (let j=0; j<GRID_X_SIZE; j++) {    
          //odd col, shift down
          if (j%2!==0) { 
            curr_y += 0.86*HEX_SIZE; 
          }       
          else {
            curr_y -= 0.86*HEX_SIZE; 
          }

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
          hex.gridX = i;
          hex.gridY = j;
          if (SHOW_DEBUG) colour_hex_group.add(hex);   

          let moveCost, atkBonus, defBonus = 0;
            
          //DEBUG GRID
          if (SHOW_DEBUG) {
              let debugHex = hex.clone();
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
                let thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS01, hex, '', 1, 1, 1, false, 3, false, true);   
                thisSprite.depth = 1;  
              }
              else if (grassSpriteChance < 0.75) {
                let thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS03, hex, '', 1, 1, 1, false, 3, false, true);     
                thisSprite.depth = 1;  
              }
              else if (grassSpriteChance < 0.8) {
                let thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS05, hex, '', 1, 1, 1, false, 3, false, true);     
                thisSprite.depth = 1;  
              }
              else {
                let thisSprite = addSpriteToTile(PATH_IMG_HEX_GRASS04, hex, '', 1, 1, 1, false, 3, false, true);     
                thisSprite.depth = 1;  
              }

          }
          else if (hex.fill === COLOUR_WATER) { 
              var randSpeed = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
              var randSpawn = Math.random();
              addSpriteToTile(PATH_IMG_HEX_WATER01, hex, '', 1, 1, 1, true, 2, false, true);   
              moveCost = 99; 
              //chance for extra sprite
              if (randSpawn <= .2 && randSpawn > .1) {
                addSpriteToTile(PATH_IMG_WAVE_ANIM, hex, '', 6, 1, randSpeed, true, 0, false, false);   
              }
              else if (randSpawn <= .1) {
                addSpriteToTile(PATH_IMG_WAVE_ANIM_2, hex, '', 4, 2, randSpeed*2, true, 0, false, false);   
              }
          }
          else if (hex.fill === COLOUR_WATER_DEEP) {
              //chance for extra sprite, but different way
              addSpriteToTile(PATH_IMG_HEX_WATER_DEEP01, hex, 'Rocky Islets', 1, 1, 1, true, 3, false, true);   
              if (Math.random() < 0.4) {
                let iconNo = getRandomInt(2)+1;
                let imagePath = PATH_IMG_WATER_DEEP + iconNo + ".png";
                addSpriteToTile(imagePath, hex, 'Rocky Islets');  
              }
              moveCost = 99; 
          }
          else if (hex.fill === COLOUR_MOUNTAIN) { 
              let mountainSpriteChance = Math.random();
              if (mountainSpriteChance < .65) {
                addSpriteToTile(PATH_IMG_HEX_MOUNTAIN01, hex, 'Mountain', 1, 1, 1, false, 0, false, true);
                //chance to spawn a cave on this tile
                let caveSpriteChance = Math.random();
                if (caveSpriteChance < .14) {
                    caveSpr = addSpriteToTile(PATH_IMG_CAVE_SM01, hex, 'Cave', 1, 1, 1, false, 0, false, false);
                }
              }
              else {
                addSpriteToTile(PATH_IMG_HEX_MOUNTAIN02, hex, 'Mountain', 1, 1, 1, false, -7, false, true);                
              }

              moveCost = 3;
          }
          else if (hex.fill === COLOUR_MOUNTAIN_PEAK) { 
              addSpriteToTile(PATH_IMG_HEX_PEAK01, hex, 'Peaks', 1, 1, 1, false, -10, false, true);    
              moveCost = 99; 
          }
          else if (hex.fill === COLOUR_COAST) { 
            //dont do anything b/c all coasts get overridden anyways
            // addSpriteToTile(PATH_IMG_HEX_MARSH02, hex, 'Coast??', 1, 1, 1, false, 1, false, true);
        }

          // TODO: add special tiles, ie mordreds lair
          // find mountain_peak tile farthest from center, make it final_tower tile
          // if no peak, use farthest mountain - if no mountain, use farthest forest
          
          // TODO: spawn enemies

        //   stage.add(hex);
          two.update();  
          
          //all done - populate data array
          HEX_ARR[i][j] = {
            "id"      : hex._id,
            "colour"  : hex.fill,
            "gridX"   : i,
            "gridY"   : j,
            "moveCost": moveCost,
            "atkBonus": atkBonus,
            "defBonus": defBonus,
          }      
          
          curr_x += sep_x;      
      }

      //after every row, return to starting x, then increment y
      curr_x = map_start_x;                                                                
      curr_y += sep_y*2;
      if (SHOW_DEBUG) two.add(debug_hex_group);
    }   

    if (SHOW_DEBUG)  {
      stage.add(colour_hex_group);
      stage.add(debug_hex_group);
    }

    setTimeout(drawForests, 0);
    setTimeout(drawSettlements, 0);
    setTimeout(sortSprites, 1000);

    two.add(stage);

    hexPositionDiv.removeAttribute('hidden');
    spriteCountDiv.removeAttribute('hidden');
    tooltipPosition.removeAttribute('hidden');

    resolve();
  });
}

//sort sprites to prevent z-issues
function sortSprites() {
    stage.children.sort((a, b) => {
        // Prioritize items with depth === 1
        if ((a.depth || 0) === 1 && (b.depth || 0) !== 1) return -1;
        if ((a.depth || 0) !== 1 && (b.depth || 0) === 1) return 1;

        // Move items with isHex === false to the end
        if (!!a.isHex !== !!b.isHex) return !!b.isHex - !!a.isHex;

        // Sort by gridY
        return a.gridY - b.gridY;
    });
}
// function sortSprites() {
//     // Sort sprites by y-axis, depth, and isHex status
//     stage.children.sort((a, b) => {
//         // if ((a.depth || 0) === 1 && (b.depth || 0) !== 1) return -1;
//         // if ((a.depth || 0) !== 1 && (b.depth || 0) === 1) return 1;
//         // if (!!a.isHex !== !!b.isHex) return !!b.isHex - !!a.isHex;
//         return a.gridY - b.gridY;
//     });

//     // Cleanup tiles under other tiles
//     const seenTiles = new Map();
//     let numTilesRemoved = 0;

//     stage.children.forEach(sprite => {
//         const key = `${sprite.gridX},${sprite.gridY}`;

//         if (!seenTiles.has(key)) {
//             seenTiles.set(key, sprite);
//         } else {
//             const existingSprite = seenTiles.get(key);

//             // Only process if both are hex tiles
//             if (sprite.isHex && existingSprite.isHex) {
//                 if (sprite.depth > existingSprite.depth) {  
//                     // New tile has higher depth, so it replaces old tile
//                     numTilesRemoved++;
//                     stage.remove(existingSprite);
//                     seenTiles.set(key, sprite);
//                     console.log("removing new " + sprite.desc + "|" + sprite.path + "|Depth:" + sprite.depth)
//                 } else {
//                     // Otherwise, keep the existing tile and remove the new one
//                     numTilesRemoved++;
//                     stage.remove(sprite);
//                     console.log("removing existing " + sprite.desc + "|" + sprite.path + "|Depth:" + sprite.depth)
//                 }
//             }
//         }
//     });

//     console.log("🚀 ~ sortSprites ~ numTilesRemoved:", numTilesRemoved);
//     two.update(); // Ensure changes are applied
// }

var lastTileWasForest = false;
function drawForests() {
  //let randomValue = seededRandom(FOREST_SEED);
  for (let i = 0; i < GRID_Y_SIZE; i++) {
    for (let j = 0; j < GRID_X_SIZE; j++) {
      randomValue = Math.random();
      let hid = HEX_ARR[i][j]['id'];
      let hiq = document.getElementById(hid);
      let hexColour = HEX_ARR[i][j]['colour'];
      hiq.setAttribute("gridX", i);
      hiq.setAttribute("gridY", j);

      // Convert coastal tiles not beside water into forests, else %chance for coastal
      if (hexColour === COLOUR_COAST && !checkAdjacentHex(j, i, 1, COLOUR_WATER)) {
        hiq.setAttribute("fill", COLOUR_FOREST);
        HEX_ARR[i][j]['colour'] = COLOUR_FOREST;
        lastTileWasForest = true;

        addSpriteToTile(PATH_IMG_HEX_FOREST01, hiq, 'Forest', 1, 1, 1, false, 1, false, true);
      } 
      else if (hexColour === COLOUR_COAST) {
        if (randomValue < .16) {
          hiq.setAttribute("fill", COLOUR_MARSH);
          HEX_ARR[i][j]['colour'] = COLOUR_MARSH;
          if (Math.random() < .5) {
            addSpriteToTile(PATH_IMG_HEX_MARSH01, hiq, 'Marsh', 1, 1, 1, false, 1, false, true);      
          }
          else {
            addSpriteToTile(PATH_IMG_HEX_MARSH02, hiq, 'Marsh', 1, 1, 1, false, 1, false, true);      
          }
        }

        else if (randomValue < 1/2) { // Adjust this threshold for more/less aggressive spread
          hiq.setAttribute("fill", COLOUR_FOREST);
          HEX_ARR[i][j]['colour'] = COLOUR_FOREST;
          lastTileWasForest = true;
          if (Math.random() < .5) {
            addSpriteToTile(PATH_IMG_HEX_FOREST02, hiq, 'Forest', 1, 1, 1, false, 0, false, true);   
          }  
          else {            
            addSpriteToTile(PATH_IMG_HEX_FOREST04, hiq, 'Forest', 1, 1, 1, false, 0, false, true);   
          }
        }
        else  {
            addSpriteToTile(PATH_IMG_HEX_FOREST03, hiq, 'Forest', 1, 1, 1, false, 0, false, true);     
        }
      }

      // Check if this tile is a forest, then attempt to spread to neighbors
      if (HEX_ARR[i][j]['colour'] === COLOUR_FOREST) {
        // Try spreading forest to adjacent tiles (1 tile away in all directions)
        let directions = [
          [-1, 0], [1, 0],    // Left and Right
          [0, -1], [0, 1],    // Down and Up
          [-1, 1], [1, -1]    // Bottom-left and Top-right
        ];

        for (let [dx, dy] of directions) {
          let nx = j + dx;
          let ny = i + dy;

          // Ensure the neighbor coordinates are within bounds
          if (nx >= 0 && nx < GRID_X_SIZE && ny >= 0 && ny < GRID_Y_SIZE) {
              let neighborColour = HEX_ARR[ny][nx]['colour'];

              // If the neighbor is grass, give it a chance to become a forest
              if (neighborColour === COLOUR_GRASS) {
                  let neighborHex = document.getElementById(HEX_ARR[ny][nx]['id']);
                  neighborHex.setAttribute("gridX", i);
                  neighborHex.setAttribute("gridY", j);
                  if (randomValue < 0.4) { // Adjust this threshold for more/less aggressive spread
                    neighborHex.setAttribute("fill", COLOUR_FOREST);
                    HEX_ARR[ny][nx]['colour'] = COLOUR_FOREST;
                    addSpriteToTile(PATH_IMG_HEX_FOREST02, neighborHex, 'Forest', 1, 1, 1, false, 0, false, true); 
                  }
              }
          }
        }
      }
    }
  }
}

function drawSettlements() {      
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
                console.log("CAPITAL MARKED: " + i + ", " + j);
                hiq.setAttribute("fill", COLOUR_SETTLEMENT);
                hiq.setAttribute("gridX", i);
                hiq.setAttribute("gridY", j);
                HEX_ARR[i][j]['colour'] = COLOUR_SETTLEMENT;
                addSpriteToTile(PATH_IMG_HEX_CASTLE01, hiq, 'Castle Camelot', 1, 1, 1, false, -4, true);
                isFirst = false;

                // spawn starting unit on valid tile - checks grass first, then forest
                validTiles = checkAllAdjacentHex(j, i, 1, COLOUR_GRASS) || checkAllAdjacentHex(j, i, 1, COLOUR_FOREST);
                let randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];

                let kid = randomTile['id'];
                let kiq = document.getElementById(kid);
                addSpriteToTile(PATH_IMG_NPC_KNIGHT, kiq, 'King Arthur', 1, 1, 1, false);   
            }
            else {
                // If not % chance pass, and not within x tiles of another settlement
                if (Math.random() < 0.18 && !checkAdjacentHex(j, i, 9, COLOUR_SETTLEMENT)) {
                    //splash in abbeys (closer to home): chance to make this a cursed abbey (up to 4), else settlement
                    if (Math.random() < 0.1 && numSpecialAbbeys<4) {
                        console.log("SPECIAL ABBEY MARKED: " + i + ", " + j);
                        hiq.setAttribute("fill", COLOUR_CURSEDABBEY);
                        HEX_ARR[i][j]['colour'] = COLOUR_CURSEDABBEY;
                        addSpriteToTile(PATH_IMG_HEX_CURSEDABBEY, hiq, 'Cursed Abbey', 1, 1, 1, false, 1);  
                        numSpecialAbbeys++;
                    }
                    else {
                        console.log("SETTLEMENT MARKED: " + i + ", " + j);
                        hiq.setAttribute("fill", COLOUR_SETTLEMENT);
                        HEX_ARR[i][j]['colour'] = COLOUR_SETTLEMENT;
                    
                        if (Math.random() < 0.5) {
                            addSpriteToTile(PATH_IMG_HEX_SETTLEMENT01, hiq, 'Town', 1, 1, 1, true, -8);     
                        }
                        else {
                            addSpriteToTile(PATH_IMG_HEX_SETTLEMENT02, hiq, 'Village', 1, 1, 1, true, -8);  
                        }
                        
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
                            console.log("FARM MARKED: " + i + ", " + j);
                            let randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];
                            let mid = randomTile['id'];
                            let miq = document.getElementById(mid);

                            miq.setAttribute("fill", COLOUR_FARM);
                            // hiq.setAttribute("fill", COLOUR_FARM);
                            // miq.setAttribute("gridX", i);
                            // miq.setAttribute("gridY", j);
                            HEX_ARR[randomTile.gridX][randomTile.gridY]['colour'] = COLOUR_FARM;
                            addSpriteToTile(PATH_IMG_HEX_FARM01, miq, 'Farmland', 1, 1, 1, false, 3, false, true);
                            let randSpeed = Math.floor(Math.random() * (8 - 1 + 2)) + 2;
                            let millSprite = addSpriteToTile(PATH_IMG_MILL_ANIM, miq, 'Mill', 4, 1, randSpeed, true, 0, false, false);
                            millSprite.scale = .8;
                        }
                    }             
                }
            }
        }
    }
}

function addSpriteToTile(path, tile, desc = '', rows = 1, cols = 1, framerate = 1, start = false, yOffset = 0, clickable = false, isHex = false, depth = 99) {
    // Get the bounding box to determine center
    let bbox = tile.getBoundingClientRect();
    let center_x = bbox.left + bbox.width / 2;
    let center_y = bbox.top + bbox.height / 2;      
    let imgOffsetY = (-HEX_SIZE * 0.2) +2 +yOffset;
    
    let sprite = two.makeSprite(path, center_x, center_y + imgOffsetY, rows, cols, framerate, start);
    if (typeof tile.getAttribute === "function") {
      sprite.gridX = parseInt(tile.getAttribute("gridX"), 10);
      sprite.gridY = parseInt(tile.getAttribute("gridY"), 10);
    }
    else if (tile.gridX !== undefined) {
      sprite.gridX = tile.gridX;
      sprite.gridY = tile.gridY;
    }

    sprite.path = path;
    sprite.desc = desc;
    sprite.clickable = clickable;
    sprite.isHex = isHex;
    sprite.depth = depth;
    // colour_hex_group.add(sprite);        
    stage.add(sprite); 

    return sprite;
}

//check adjacent tiles, within given range, by given colour
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
  
function colourize(grayscale) {
    // Convert the hex color to RGB
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

// Function to get a shape by ID
function getShapeById(id) {
    return stage.children.find(shape => shape._id === id);
}

document.addEventListener("DOMContentLoaded", () => {
  const clouds = document.querySelectorAll(".cloud");

  clouds.forEach(cloud => {
      // Set a random top position between 1% and 99% of the viewport height
      let randomTop = Math.floor(Math.random() * 99) + 1;
      cloud.style.top = `${randomTop}%`;
  });
});