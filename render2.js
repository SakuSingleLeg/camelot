//#region INIT DECLARATIONS
// moose pos info
const cursorPositionDiv = document.getElementById('cursor-position');
const hexPositionDiv     = document.getElementById('hex-position');
const spriteCountDiv     = document.getElementById('sprite-count');
const tooltipPosition    = document.getElementById('tooltip-position');

const elementMap = new Map();

let userConfig;
let two, ui, stage;
let MAP_SEED, FOREST_SEED, SETTLEMENT_SEED;
let GRID_X_SIZE, GRID_Y_SIZE, HEX_ARR;
let HEX_SIZE, SHOW_DEBUG, SHOW_DEBUG_OVERLAY, params;
let map_start_x, map_start_y;
let sep_x, sep_y;
let curr_x, curr_y;
let colour_hex_group, debug_hex_group;
let townNames    = [];
let eventLog     = [];
let shownLog     = [];
let logIndex     = -1;
let selectedTile;
let turnNum      = 1;
let friendlyUnitSprites = [];
let enemyUnitSprites    = [];
let totGold = 0, totFood = 0;
let turnGold = 0, turnFood = 0;
let animatingEnemyMovement = false;
//#endregion

// LOAD CONFIG FROM FILE
loadConfig().then(() => {
  console.log("Config Loaded. Initializing...");

  // Toggle UI FX based on config
  $("#menuFog")[0].hidden   = (userConfig.showFog === false);
  $("#mapFog")[0].hidden    = (userConfig.showFog === false);
  $("#scanlines")[0].hidden = (userConfig.showScanlines === false);

  hexPositionDiv.setAttribute('hidden', 'true');
  spriteCountDiv.setAttribute('hidden', 'true');
  tooltipPosition.setAttribute('hidden', 'true');

  // Seeds
  MAP_SEED       = Math.random();
  FOREST_SEED    = Math.random();
  SETTLEMENT_SEED= Math.random();

  // Grid data array
  GRID_X_SIZE = userConfig.gridSizeX; // e.g. "medium"
  GRID_Y_SIZE = userConfig.gridSizeY; // e.g. "medium"
  HEX_ARR     = new Array(GRID_Y_SIZE);

  // Set hex grid params
  HEX_SIZE = 24;
  SHOW_DEBUG = userConfig.debug;
  SHOW_DEBUG_OVERLAY = userConfig.debug_overlay;
  params = {
    type: Two.Types.svg, // or Two.Types.canvas
    fullscreen: true,
    autostart: true
  };

  two   = new Two(params);
  ui    = new Two.Group();
  stage = new Two.Group();

  // Hex starting location in px
  map_start_x = two.width  * 0.03;
  map_start_y = two.height * 0.05;

  // Separation between hexes
  sep_x = 1.5 * HEX_SIZE;
  sep_y = 0.86 * HEX_SIZE;

  // X, Y at which hex will currently be drawn
  curr_x = map_start_x;
  curr_y = map_start_y;

  colour_hex_group      = new Two.Group();
  colour_hex_group.visible = !SHOW_DEBUG;
  debug_hex_group       = new Two.Group();
  debug_hex_group.visible  = SHOW_DEBUG;

  // Load other scripts
  console.log("Now Loading Scripts...");
  loadScript("audio.js", function() {
    console.log("audio.js Loaded.");
    loadScript("ui.js", function() {
      console.log("ui.js Loaded.");
      loadScript("utils.js", function() {
        console.log("utils.js Loaded.");
        loadScript("utilstwo.js", function() {
          console.log("utilstwo.js Loaded.");
          loadScript("input.js", function() {
            console.log("input.js Loaded.");
          });
        });
      });
    });
  });
});

// Builds the main gameplay map of hexes, based on generated Perlin noise
function buildGrid(MAP_SEED) {
  return new Promise((resolve, reject) => {
    two.appendTo(document.body);

    // Do stuff every frame
    two.bind('update', function(frameCount) {
      const now = performance.now();

      // Animate selected unit sprite
      if (selectedTile !== undefined && selectedTile.animation) {
        const { startX, startY, endX, endY, startTime, duration } = selectedTile.animation;
        const elapsed = now - startTime;
        const t       = Math.min(elapsed / duration, 1);
        // Simple linear movement (could add an ease function if you want)
        selectedTile.translation.x = startX + (endX - startX) * t;
        selectedTile.translation.y = startY + (endY - startY) * t;

        // Animation done
        if (t >= 1) {
          delete selectedTile.animation;
        }
      }

      // Animate enemy sprites
      // FIX: changed from `if (enemyAnimsRemaining = false)` to a proper check
      let enemyAnimsRemaining = false;
      if (animatingEnemyMovement === true) {
        enemyUnitSprites.forEach(eSpr => {
          if (eSpr !== undefined && eSpr.animation) {
            const { startX, startY, endX, endY, startTime, duration } = eSpr.animation;
            const elapsed = now - startTime;
            const t       = Math.min(elapsed / duration, 1);
            eSpr.translation.x = startX + (endX - startX) * t;
            eSpr.translation.y = startY + (endY - startY) * t;

            // If not finished, keep animating
            if (t < 1) {
              enemyAnimsRemaining = true;
            } else {
              // Animation done for this sprite
              delete eSpr.animation;
            }
          }
        });
        if (!enemyAnimsRemaining) {
          animatingEnemyMovement = false;
        }
      }
    });

    // Apply noise
    noise.seed(MAP_SEED);

    // Iterate by row, col
    for (let i = 0; i < GRID_Y_SIZE; i++) {
      HEX_ARR[i] = new Array(GRID_X_SIZE);

      for (let j = 0; j < GRID_X_SIZE; j++) {
        // Odd col → shift down, else shift up
        if (j % 2 !== 0) curr_y += 0.86 * HEX_SIZE;
        else             curr_y -= 0.86 * HEX_SIZE;

        // For each grid index, draw hex
        let hex = two.makePolygon(curr_x, curr_y, HEX_SIZE, 6);

        // Generate noise & color
        let value = (noise.perlin2(curr_x / 200, curr_y / 200) + 1) * 0.5 * 255;
        value = Math.min(255, Math.max(0, value));
        // Exponent > 1 to favor darker values
        value = Math.pow(value / 255, 2.0) * 255;
        let grayscale = (value << 16) | (value << 8) | value; 
        let gray = '#' + grayscale.toString(16).padStart(6, '0');

        // Default tile moves
        hex.visible   = false;
        hex.fill      = colourize(gray);
        hex.linewidth = 2;
        hex.gridX     = j;
        hex.gridY     = i;
        hex.moveCost  = 0;  // default (overridden below if needed)

        // Show color group or debug group
        if (SHOW_DEBUG) {
          colour_hex_group.add(hex);
        }

        // For storing bonuses etc. (initialize to 0)
        let moveCost  = 0;
        let atkBonus  = 0;
        let defBonus  = 0;

        // Debug overlay
        if (SHOW_DEBUG) {
          let debugHex = hex.clone();
          debugHex.visible = true;
          debugHex.fill    = gray;
          debug_hex_group.add(debugHex);
          // add hex info text
          let hexTxt  = two.makeText(gray, curr_x, curr_y + 10, {
            size: 4, family: 'Press Start 2P', fill: '#FFFF00'
          });
          let hexTxt2 = two.makeText(i + "," + j, curr_x, curr_y - 3, {
            size: 6, family: 'Press Start 2P', fill: '#FFFF00'
          });
          debug_hex_group.add(hexTxt, hexTxt2);
        }

        // Example of setting specialized moveCost, sprite, etc.:
        if (hex.fill === COLOUR_GRASS) {
          // ...
          addRandomGrassSprite(hex);

        } else if (hex.fill === COLOUR_WATER) {
          hex.moveCost = 98;
          // ...
          addRandomWaterSprite(hex);

        } else if (hex.fill === COLOUR_WATER_DEEP) {
          hex.moveCost = 98;
          // ...
          addDeepWaterSprite(hex);

        } else if (hex.fill === COLOUR_MOUNTAIN) {
          hex.moveCost = 3;
          // ...
          addMountainSprite(hex);

        } else if (hex.fill === COLOUR_MOUNTAIN_PEAK) {
          hex.moveCost = 98;
          // ...
          addPeakSprite(hex);

        } else if (hex.fill === COLOUR_COAST) {
          // ...
          // Sometimes replaced by forest or marsh below
        }

        // Populate data array
        HEX_ARR[i][j] = {
          id:      hex._id,
          colour:  hex.fill,
          gridX:   j,
          gridY:   i,
          moveCost: hex.moveCost,
          atkBonus,
          defBonus
        };

        // Move next column
        curr_x += sep_x;
      }

      // After each row, go back to start X
      curr_x = map_start_x;
      curr_y += sep_y * 2;
    }

    if (SHOW_DEBUG) stage.add(debug_hex_group);

    // Defer some heavier loops
    setTimeout(drawForests, 0);
    setTimeout(drawSettlements, 0);
    setTimeout(drawTreasure, 0);
    setTimeout(drawEnemies, 0);
    setTimeout(sortSprites, 1000);

    console.log("reticulating splines...");
    two.add(stage);

    if (SHOW_DEBUG_OVERLAY) {
      hexPositionDiv.removeAttribute('hidden');
      spriteCountDiv.removeAttribute('hidden');
      tooltipPosition.removeAttribute('hidden');
    }

    // Build a map of all sprites
    setTimeout(() => {
      stage.children.forEach(shape => {
        elementMap.set(shape._id, shape);
      });
    }, 0);

    resolve();
  });
}

// Sort sprites to prevent z‐issues. Removes duplicate hexes first.
function sortSprites() {
  let numSpritesRemoved = 0;
  // First, find all sprites with same gridX & gridY, remove grass duplicates
  for (let i = 0; i < stage.children.length; i++) {
    let childA = stage.children[i];
    for (let j = i + 1; j < stage.children.length; j++) {
      let childB = stage.children[j];
      if (childA.gridX === childB.gridX &&
          childA.gridY === childB.gridY &&
          childA.isHex  && childB.isHex)
      {
        if (childA.depth === 1 && childB.depth === 99) {
          numSpritesRemoved++;
          stage.children.splice(i, 1);
          i--;
          break;
        } else if (childB.depth === 1 && childA.depth === 99) {
          numSpritesRemoved++;
          stage.children.splice(j, 1);
          j--;
        }
      }
    }
  }
  console.log("Total sprites removed: " + numSpritesRemoved);

  // Then sort them by depth, isHex, and row
  stage.children.sort((a, b) => {
    // Prioritize items with depth === 1
    if ((a.depth || 0) === 1 && (b.depth || 0) !== 1) return -1;
    if ((a.depth || 0) !== 1 && (b.depth || 0) === 1) return 1;

    // Move hex shapes first if desired
    if (!!a.isHex !== !!b.isHex) {
      return +b.isHex - +a.isHex;
    }

    // Finally, sort by gridY
    return (a.gridY || 0) - (b.gridY || 0);
  });
}

// ----- Forest logic -----
function drawForests() {
  console.log("drawForests()");

  for (let i = 0; i < GRID_Y_SIZE; i++) {
    for (let j = 0; j < GRID_X_SIZE; j++) {
      let hid = HEX_ARR[i][j].id;
      let hiq = document.getElementById(hid);
      if (!hiq) continue;

      let hexColour = HEX_ARR[i][j].colour;
      hiq.setAttribute("gridX", j);
      hiq.setAttribute("gridY", i);

      // Convert coastal tiles not beside water → forest; else random
      if (hexColour === COLOUR_COAST && !checkAdjacentHex(j, i, 1, COLOUR_WATER)) {
        hiq.setAttribute("fill", COLOUR_FOREST);
        hiq.setAttribute("moveCost", 1);
        HEX_ARR[i][j].colour   = COLOUR_FOREST;
        HEX_ARR[i][j].moveCost = 1;
        addSpriteToTile(PATH_IMG_HEX_FOREST01, hiq, 'Forest', 1, 1, 1, false, 1, false, true, 99, "unset", hexParams.forest);

      } else if (hexColour === COLOUR_COAST) {
        let randomValue = Math.random();
        if (randomValue < 0.16) {
          // Marsh
          hiq.setAttribute("fill", COLOUR_MARSH);
          HEX_ARR[i][j].colour   = COLOUR_MARSH;
          HEX_ARR[i][j].moveCost = 2;
          if (Math.random() < 0.5) {
            addSpriteToTile(PATH_IMG_HEX_MARSH01, hiq, 'Marsh', 1, 1, 0, false, 1, false, true, 99, "unset", hexParams.marsh);
          } else {
            addSpriteToTile(PATH_IMG_HEX_MARSH02, hiq, 'Marsh', 1, 1, 0, false, 1, false, true, 99, "unset", hexParams.marsh);
          }
        } else if (randomValue < 0.5) {
          // Forest
          hiq.setAttribute("fill", COLOUR_FOREST);
          hiq.setAttribute("moveCost", 1);
          HEX_ARR[i][j].colour   = COLOUR_FOREST;
          HEX_ARR[i][j].moveCost = 1;
          if (Math.random() < 0.5) {
            addSpriteToTile(PATH_IMG_HEX_FOREST02, hiq, 'Forest', 1, 1, 1, false, 1, false, true, 99, "unset", hexParams.forest);
          } else {
            addSpriteToTile(PATH_IMG_HEX_FOREST04, hiq, 'Forest', 1, 1, 1, false, -2, false, true, 99, "unset", hexParams.forest);
          }
        } else {
          hiq.setAttribute("fill", COLOUR_FOREST);
          hiq.setAttribute("moveCost", 1);
          HEX_ARR[i][j].colour   = COLOUR_FOREST;
          HEX_ARR[i][j].moveCost = 1;
          addSpriteToTile(PATH_IMG_HEX_FOREST03, hiq, 'Forest', 1, 1, 1, false, -2, false, true, 99, "unset", hexParams.forest);
        }
      }

      // Spread forest to neighbors
      if (HEX_ARR[i][j].colour === COLOUR_FOREST) {
        const directions = (j % 2 === 0)
          ? [ [ +1,  0], [ 0, -1], [-1, -1],
              [ -1,  0], [ -1, +1], [ 0, +1] ]
          : [ [ +1,  0], [ +1, -1], [ 0, -1],
              [ -1,  0], [ 0,  +1], [ +1, +1] ];

        directions.forEach(([dx, dy]) => {
          let nx = j + dx;
          let ny = i + dy;
          if (nx >= 0 && nx < GRID_X_SIZE && ny >= 0 && ny < GRID_Y_SIZE) {
            if (HEX_ARR[ny][nx].colour === COLOUR_GRASS) {
              let neighborHex = document.getElementById(HEX_ARR[ny][nx].id);
              if (neighborHex && Math.random() < 0.35) {
                neighborHex.setAttribute("fill", COLOUR_FOREST);
                neighborHex.setAttribute("moveCost", 1);
                HEX_ARR[ny][nx].colour   = COLOUR_FOREST;
                HEX_ARR[ny][nx].moveCost = 1;
                addSpriteToTile(PATH_IMG_HEX_FOREST02, neighborHex, 'Forest', 1, 1, 1, false, 1, false, true, 99, "unset", hexParams.forest);
              }
            }
          }
        });
      }
    }
  }
}

// ----- Settlement logic -----
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
      let distance = Math.sqrt((j - centerX)**2 + (i - centerY)**2);
      hexList.push({ i, j, distance });
    }
  }

  // Sort by distance from center
  hexList.sort((a, b) => a.distance - b.distance);

  for (let { i, j } of hexList) {
    let hid = HEX_ARR[i][j].id;
    let hiq = document.getElementById(hid);
    if (!hiq) continue;

    let hexColour = HEX_ARR[i][j].colour;

    // A valid tile for a settlement (avoid water, mountains, forest, etc.):
    if (hexColour !== COLOUR_WATER        &&
        hexColour !== COLOUR_WATER_DEEP   &&
        hexColour !== COLOUR_MOUNTAIN     &&
        hexColour !== COLOUR_MOUNTAIN_PEAK&&
        hexColour !== COLOUR_COAST        &&
        hexColour !== COLOUR_FOREST       &&
        checkAdjacentHex(j, i, 3, COLOUR_WATER))
    {
      // If first valid tile → capital city
      if (isFirst) {
        hiq.setAttribute("fill", COLOUR_SETTLEMENT);
        HEX_ARR[i][j].colour = COLOUR_SETTLEMENT;
        addSpriteToTile(PATH_IMG_HEX_CASTLE01, hiq, 'Castle Camelot', 1, 1, 1, false, -4, true, false, 99, "friendly", hexParams.camelot);
        isFirst = false;

        // Spawn starting unit on a grass or forest tile next to the castle
        let validTiles = checkAllAdjacentHex(j, i, 1, COLOUR_GRASS) ||
                         checkAllAdjacentHex(j, i, 1, COLOUR_FOREST);
        if (validTiles) {
          let randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];
          let kid = randomTile.id;
          let kiq = document.getElementById(kid);
          if (kiq) {
            let arthurSpr = addSpriteToTile(PATH_IMG_NPC_KNIGHT, kiq, 'King Arthur',
              1, 1, 1, false, 0, true, false, 99, "friendly", unitParams.knight_arthur);
            friendlyUnitSprites.push(arthurSpr);
          }
        }
      }
      else {
        // Must not be near an existing settlement/cursed abbey
        if (Math.random() < 0.18 &&
            !checkAdjacentHex(j, i, 9, COLOUR_SETTLEMENT) &&
            !checkAdjacentHex(j, i, 9, COLOUR_CURSEDABBEY))
        {
          // Maybe create a cursed abbey
          if (Math.random() < 0.1 && numSpecialAbbeys < 4) {
            hiq.setAttribute("fill", COLOUR_CURSEDABBEY);
            HEX_ARR[i][j].colour = COLOUR_CURSEDABBEY;
            addSpriteToTile(PATH_IMG_HEX_CURSEDABBEY, hiq, 'Abbey', 1, 1, 1, false, 1, false, true, 99, "hostile", hexParams.abbey);
            numSpecialAbbeys++;
          } else {
            // Normal settlement
            hiq.setAttribute("fill", COLOUR_SETTLEMENT);
            HEX_ARR[i][j].colour = COLOUR_SETTLEMENT;

            // Possibly place farmland/mills around
            let numMills = getRandomInt(2);
            if (numMills === 2 && Math.random() < 0.5) {
              numMills = 1;
            }
            let validTiles = checkAllAdjacentHex(j, i, 3, COLOUR_GRASS);
            for (let k = 0; k < numMills && validTiles; k++) {
              let randomTile = validTiles[Math.floor(Math.random() * validTiles.length)];
              let mid = randomTile.id;
              let miq = document.getElementById(mid);
              if (miq) {
                miq.setAttribute("fill", COLOUR_FARM);
                HEX_ARR[randomTile.gridY][randomTile.gridX].colour = COLOUR_FARM;

                let randSpeed = Math.floor(Math.random() * 7) + 2;
                if (Math.random() < 0.5) {
                  addSpriteToTile(PATH_IMG_HEX_FARM01, miq, 'Farmland', 1, 1, 1, false, 3, true, true, 99, "hostile", hexParams.farm);
                  let millSprite = addSpriteToTile(PATH_IMG_MILL_ANIM, miq, 'Mill',
                    4, 1, randSpeed, true, 0, false, false, 99, "hostile", unitParams.mill);
                  millSprite.scale = 0.7;
                } else {
                  addSpriteToTile(PATH_IMG_HEX_FARM02, miq, 'Farmland', 1, 1, 1, false, 3, true, true, 99, "hostile", unitParams.farm);
                  let millSprite = addSpriteToTile(PATH_IMG_ANIM_MILL_SM, miq, 'Mill',
                    4, 1, randSpeed - 1, true, 0, false, false, 99, "hostile", unitParams.mill);
                }
              }
            }

            // Settlement sprite
            if (Math.random() < 0.5) {
              addSpriteToTile(PATH_IMG_HEX_SETTLEMENT01, hiq, 'Town', 1, 1, 1, true, -2, true, true, 99, "hostile", hexParams.town);
            } else {
              addSpriteToTile(PATH_IMG_HEX_SETTLEMENT02, hiq, 'Village', 1, 1, 1, true, -1, true, true, 99, "hostile", hexParams.village);
            }
          }
        }
      }
    }
  }
}

// ----- Treasure logic -----
function drawTreasure() {
  console.log("drawTreasure()");
  let centerX = Math.floor(GRID_X_SIZE / 2);
  let centerY = Math.floor(GRID_Y_SIZE / 2);

  let hexList = [];
  let placedTreasures = [];
  let numTreasure = 0;

  // Example thresholds
  let distanceLimit = SHOW_DEBUG ? 4 : 12;
  let treasureLimit = SHOW_DEBUG ? 180 : 10;
  let distFromCenter= SHOW_DEBUG ? 0 : 6;

  // Collect hexes, measure distance
  for (let i = 0; i < GRID_Y_SIZE; i++) {
    for (let j = 0; j < GRID_X_SIZE; j++) {
      let centerDistance = Math.sqrt((j - centerX)**2 + (i - centerY)**2);
      hexList.push({ i, j, centerDistance });
    }
  }
  // Sort ascending by distance from center
  hexList.sort((a, b) => a.centerDistance - b.centerDistance);

  function isFarEnough(x, y) {
    for (let pos of placedTreasures) {
      let trDist = Math.sqrt((pos.j - x)**2 + (pos.i - y)**2);
      if (trDist < distanceLimit) return false;
    }
    return true;
  }

  // Now iterate
  for (let { i, j, centerDistance } of hexList) {
    if (numTreasure >= treasureLimit) break;
    if (centerDistance < distFromCenter && !SHOW_DEBUG) continue;

    let hid = HEX_ARR[i][j].id;
    let hiq = document.getElementById(hid);
    if (!hiq) continue;

    let hexColour = HEX_ARR[i][j].colour;

    // FIX: If you intended “not near settlement,” use !checkAllAdjacentHex here
    if (hexColour !== COLOUR_WATER &&
        hexColour !== COLOUR_WATER_DEEP &&
        hexColour !== COLOUR_MOUNTAIN &&
        hexColour !== COLOUR_MOUNTAIN_PEAK &&
        hexColour !== COLOUR_SETTLEMENT &&
        hexColour !== COLOUR_CURSEDABBEY &&
        hexColour !== COLOUR_FARM &&
        !checkAllAdjacentHex(j, i, 8, COLOUR_SETTLEMENT) && // <--- FIXED for clarity
        isFarEnough(j, i))
    {
      // 5% chance to place treasure
      if (Math.random() < 0.05) {
        addSpriteToTile(PATH_IMG_CHEST_SM01, hiq, 'Treasure?', 1, 1, 1, false, 12, false, false, 99, "neutral", unitParams.chest);
        placedTreasures.push({ i, j });
        numTreasure++;
      }
    }
  }
}

// ----- Enemies logic -----
function drawEnemies() {
  console.log("drawEnemies()");
  let centerX = Math.floor(GRID_X_SIZE / 2);
  let centerY = Math.floor(GRID_Y_SIZE / 2);

  let hexList = [];
  let placedEnemies = [];
  let numEnemies = 0;

  // Example thresholds
  let distanceLimit = SHOW_DEBUG ? 4 : 12;
  let enemyLimit    = SHOW_DEBUG ? 120 : 20;
  let distFromCenter= SHOW_DEBUG ? 0  : 20;

  // Collect hexes, measure distance
  for (let i = 0; i < GRID_Y_SIZE; i++) {
    for (let j = 0; j < GRID_X_SIZE; j++) {
      let centerDistance = Math.sqrt((j - centerX)**2 + (i - centerY)**2);
      hexList.push({ i, j, centerDistance });
    }
  }
  // Sort descending so we place enemies far out first
  hexList.sort((a, b) => b.centerDistance - a.centerDistance);

  function isFarEnough(x, y) {
    for (let pos of placedEnemies) {
      let enDist = Math.sqrt((pos.j - x)**2 + (pos.i - y)**2);
      if (enDist < distanceLimit) return false;
    }
    return true;
  }

  // Now iterate
  for (let { i, j, centerDistance } of hexList) {
    if (numEnemies >= enemyLimit) break;
    if (centerDistance < distFromCenter && !SHOW_DEBUG) continue;

    let hid = HEX_ARR[i][j].id;
    let hiq = document.getElementById(hid);
    if (!hiq) continue;

    let hexColour = HEX_ARR[i][j].colour;

    // FIX: previously `(j, i, 8, COLOUR_SETTLEMENT) && isFarEnough(...)` was just a comma expression bug
    // if we want them “not near settlement,” do !checkAllAdjacentHex
    if (hexColour !== COLOUR_WATER &&
        hexColour !== COLOUR_WATER_DEEP &&
        hexColour !== COLOUR_MOUNTAIN &&
        hexColour !== COLOUR_MOUNTAIN_PEAK &&
        hexColour !== COLOUR_SETTLEMENT &&
        hexColour !== COLOUR_CURSEDABBEY &&
        hexColour !== COLOUR_FARM &&
        !checkAllAdjacentHex(j, i, 8, COLOUR_SETTLEMENT) &&
        isFarEnough(j, i))
    {
      // 15% chance for an enemy
      if (Math.random() < 0.15) {
        let skellySpr = addSpriteToTile(PATH_IMG_NPC_SKELLY, hiq, 'Skeletons',
          1, 1, 1, false, 2, false, false, 99, "hostile", unitParams.skelly);
        placedEnemies.push({ i, j });
        enemyUnitSprites.push(skellySpr);
        numEnemies++;
      }
    }
  }
  console.log("Enemies spawned: " + numEnemies);
}

// Move a sprite from one location to another
function moveUnitToSpriteLocation(movingElem, destinationElem) {
  movingElem.animation = {
    startX:    movingElem.translation.x,
    startY:    movingElem.translation.y,
    endX:      destinationElem._position._x,
    endY:      destinationElem._position._y,
    startTime: performance.now(),
    duration:  600
  };

  // Adjust AP
  let cost = 1;
  if (typeof destinationElem.getAttribute === "function") {
    cost += parseInt(destinationElem.getAttribute("moveCost"), 10) || 0;
  } else {
    cost += destinationElem.moveCost || 0;
  }
  movingElem.params.ap_cur -= cost;

  // Update grid coords
  movingElem.gridX = destinationElem.gridX;
  movingElem.gridY = destinationElem.gridY;

  // Example: collide with a "poi"
  if (movingElem.params.type === "knight") {
    let poi = stage.children.find(shape =>
      shape._id   !== movingElem._id &&
      shape.gridX === destinationElem.gridX &&
      shape.gridY === destinationElem.gridY &&
      shape.isHex === false
    );
    if (poi && poi.params.type === "poi") {
      // E.g. handle chest/cave/mill
      switch (poi.params.poi) {
        case "chest":
          // ...
          break;
        case "cave":
          // ...
          break;
        case "mill":
          // ...
          break;
        default:
          // ...
          break;
      }
    }
  }
}

// Move enemy pieces
function moveEnemiesEoT() {
  console.log("moving enemy sprites");
  animatingEnemyMovement = true;

  enemyUnitSprites.forEach(eSpr => {
    if (eSpr.params.ai === "stupid") {
      // Stupid AI: move to random adjacent tile
      let adjHexSprites = getAdjacentHexSprites(eSpr.gridX, eSpr.gridY, 1);
      if (adjHexSprites && adjHexSprites.length) {
        const adjHexSprite = adjHexSprites[Math.floor(Math.random() * adjHexSprites.length)];
        moveUnitToSpriteLocation(eSpr, adjHexSprite);
      }
    } else {
      console.log("Enemy has no AI defined: ", eSpr);
    }
  });
}

// Example sprite-adding function
function addSpriteToTile(
  path, tile, desc,
  rows = 1, cols = 1, framerate = 1, start = false,
  yOffset = 0, clickable = false, isHex = false,
  depth = 99, faction = "unset", params = unitParams.default
) {
  let bbox = tile.getBoundingClientRect();
  let center_x = bbox.left + bbox.width / 2;
  let center_y = bbox.top  + bbox.height / 2;

  // Slight shift
  let imgOffsetY = (-HEX_SIZE * 0.2) + 2 + yOffset;

  let sprite = two.makeSprite(path, center_x, center_y + imgOffsetY, rows, cols, framerate, start);

  if (typeof tile.getAttribute === "function") {
    sprite.gridX    = parseInt(tile.getAttribute("gridX"), 10);
    sprite.gridY    = parseInt(tile.getAttribute("gridY"), 10);
    sprite.moveCost = parseInt(tile.getAttribute("moveCost"), 10) || 0;
  } else if (tile.gridX !== undefined) {
    sprite.gridX    = tile.gridX;
    sprite.gridY    = tile.gridY;
    sprite.moveCost = tile.moveCost || 0;
  }

  sprite.path      = path;
  sprite.desc      = desc || "";
  sprite.clickable = clickable;
  sprite.isHex     = isHex;
  sprite.depth     = depth;
  sprite.params    = structuredClone(params);

  // 50% chance to flip horizontally for variety
  if (Math.random() < 0.5) {
    sprite.scale = new Two.Vector(-1, 1);
  }

  stage.add(sprite);

  // Glow highlights
  let spriteDOM = document.getElementById(sprite._id);
  if (spriteDOM) {
    switch (faction) {
      case "friendly":
        spriteDOM.classList.add('glowing-friendly');
        break;
      case "hostile":
        spriteDOM.classList.add('glowing-hostile');
        break;
      case "neutral":
        spriteDOM.classList.add('glowing-neutral');
        break;
      default:
        // no glow
        break;
    }
  }

  // If it's a “poi,” you could randomly choose from an eventText array
  if (params.eventText) {
    let chosen = params.eventText[Math.floor(Math.random() * params.eventText.length)];
    sprite.params.eventText = [chosen];
  }

  // Example: add label for towns
  if (params.type === "castle") {
    let paperSprite = two.makeSprite(PATH_IMG_PAPER_LABEL, center_x, center_y + 20, 1, 1, 1, false);
    let paperText   = two.makeText("Camelot", center_x, center_y + 21, {
      size: 7, fill: '#000', family: 'Press Start 2P', alignment: 'center'
    });
    paperSprite.scale     = 0.5;
    paperSprite.depth     = 99;
    paperSprite.noPointerEvents = true;
    paperText.noPointerEvents   = true;
    stage.add(paperSprite);
    stage.add(paperText);
  }
  else if (params.subtype === "town" || params.subtype === "village") {
    let randomTownName = generateTownName(townNames);
    let paperSprite = two.makeSprite(PATH_IMG_PAPER_LABEL, center_x, center_y + 20, 1, 1, 1, false);
    let paperText   = two.makeText(randomTownName, center_x, center_y + 21, {
      size: 6, fill: '#4f4f4f', family: 'Press Start 2P', alignment: 'center'
    });
    paperSprite.scale     = 0.5;
    paperSprite.depth     = 99;
    paperSprite.noPointerEvents = true;
    paperText.noPointerEvents   = true;

    townNames.push(randomTownName);
    stage.add(paperSprite);
    stage.add(paperText);
  }

  return sprite;
}

// Check adjacent tiles within given range by color. Returns `true` on the first found, false if none.
function checkAdjacentHex(x, y, range, colour) {
  for (let i = Math.max(0, y - range); i <= Math.min(GRID_Y_SIZE - 1, y + range); i++) {
    for (let j = Math.max(0, x - range); j <= Math.min(GRID_X_SIZE - 1, x + range); j++) {
      // Basic bounding check (Manhattan or hex distance logic can vary)
      if (Math.abs(i - y) + Math.abs(j - x) <= range * 2) {
        if (HEX_ARR[i][j].colour === colour) {
          return true;
        }
      }
    }
  }
  return false;
}

// Check adjacent tiles within given range by color. Returns an array of all matching tiles, or false if none.
function checkAllAdjacentHex(x, y, range, colour) {
  let foundArr = [];
  for (let i = 0; i < GRID_Y_SIZE; i++) {
    for (let j = 0; j < GRID_X_SIZE; j++) {
      if ((Math.abs(i - y) + Math.abs(j - x) <= range * 2) &&
          (Math.abs(i - y) <= range) &&
          (Math.abs(j - x) <= range))
      {
        if (HEX_ARR[i][j].colour === colour) {
          foundArr.push(HEX_ARR[i][j]);
        }
      }
    }
  }
  return foundArr.length > 0 ? foundArr : false;
}

// Return all sprites within a given hex range. Excludes center tile. If `colour` is null, returns all.
function getAdjacentHexSprites(x, y, range, colour = null) {
  let foundArr = [];
  const origin = offsetToCube(x, y);

  for (let row = 0; row < GRID_Y_SIZE; row++) {
    for (let col = 0; col < GRID_X_SIZE; col++) {
      const target = offsetToCube(col, row);
      const dist   = cubeDistance(origin, target);
      if (dist > 0 && dist <= range) {
        let hex = HEX_ARR[row][col];
        if (!colour || hex.colour === colour) {
          foundArr.push(hex);
        }
      }
    }
  }

  if (!foundArr.length) return false;

  // Match sprite objects on stage
  let spriteArr = [];
  foundArr.forEach(hex => {
    const sprite = stage.children.find(child =>
      child.gridX === hex.gridX && child.gridY === hex.gridY
    );
    if (sprite && sprite.isHex) {
      spriteArr.push(sprite);
    }
  });
  return spriteArr;
}

// Turn a grayscale to terrain color
function colourize(grayscale) {
  if (grayscale.length < 7) return COLOUR_GRASS;
  let rgb = hexToRgb(grayscale);
  let bright = brightness(rgb);

  // Basic thresholding
  if      (bright >= 180) return COLOUR_WATER_DEEP;
  else if (bright >= 110) return COLOUR_WATER;
  else if (bright >= 95)  return COLOUR_COAST;
  else if (bright < 20 && bright > 7)  return COLOUR_MOUNTAIN;
  else if (bright <= 7)   return COLOUR_MOUNTAIN_PEAK;
  else                    return COLOUR_GRASS;
}

// Example stubs for “random sprite” additions
function addRandomGrassSprite(hex) {
  let r = Math.random();
  if      (r < 0.7)  addSpriteToTile(PATH_IMG_HEX_GRASS01, hex, '', 1, 1, 1, false, 3, false, true, 1, "unset", hexParams.grass);
  else if (r < 0.75) addSpriteToTile(PATH_IMG_HEX_GRASS03, hex, '', 1, 1, 1, false, 3, false, true, 1, "unset", hexParams.grass);
  else if (r < 0.8)  addSpriteToTile(PATH_IMG_HEX_GRASS05, hex, '', 1, 1, 1, false, 3, false, true, 1, "unset", hexParams.grass);
  else               addSpriteToTile(PATH_IMG_HEX_GRASS04, hex, '', 1, 1, 0, false, 3, false, true, 1, "unset", hexParams.grass);
}
function addRandomWaterSprite(hex) {
  let randSpeed = Math.floor(Math.random() * 3) + 1;
  let randSpawn= Math.random();
  // ...
}
function addDeepWaterSprite(hex) {
  hex.moveCost = 98;
  // ...
}
function addMountainSprite(hex) {
  // ...
}
function addPeakSprite(hex) {
  // ...
}

// Example DOM event
document.addEventListener("DOMContentLoaded", () => {
  const clouds = document.querySelectorAll(".cloud");
  clouds.forEach(cloud => {
    let randomTop = Math.floor(Math.random() * 99) + 1;
    cloud.style.top = `${randomTop}%`;
  });
});
