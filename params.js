//HEX GRID DISPLAY//  
const COLOUR_FARM               = "#DAA520";
const COLOUR_SETTLEMENT         = "#FFA07A";
const COLOUR_MOUNTAIN_PEAK      = "#F0F0F0";
const COLOUR_MOUNTAIN           = "#8B8B8B";
const COLOUR_FOREST             = "#006400";
const COLOUR_MARSH              = "#0F7650";
const COLOUR_GRASS              = "#008000";
const COLOUR_COAST              = "#269828";
const COLOUR_WATER              = "#0000FF";
const COLOUR_WATER_DEEP         = "#0818A8";
const COLOUR_CURSEDABBEY        = "#1929B9";

//MISC IMAGES
const PATH_IMG_TITLE_CREST      = './img/title_crest.png';
//HEX GRID IMGS
const PATH_IMG_HEX_GRASS01      = './img/hex_grass01.png';
const PATH_IMG_HEX_GRASS02      = './img/hex_grass02.png';
const PATH_IMG_HEX_GRASS03      = './img/hex_grass03.png';
const PATH_IMG_HEX_GRASS04      = './img/hex_grass04.png';
const PATH_IMG_HEX_GRASS05      = './img/hex_grass05.png';
const PATH_IMG_HEX_MARSH01      = './img/hex_marsh01.png';
const PATH_IMG_HEX_MARSH02      = './img/hex_marsh02.png';
const PATH_IMG_HEX_FOREST01     = './img/hex_forest01.png';
const PATH_IMG_HEX_FOREST02     = './img/hex_forest02.png';
const PATH_IMG_HEX_FOREST03     = './img/hex_forest03.png';
const PATH_IMG_HEX_FOREST04     = './img/hex_forest04.png';
const PATH_IMG_HEX_FARM01       = './img/hex_farm01.png';
const PATH_IMG_HEX_MOUNTAIN01   = './img/hex_mountain01.png';
const PATH_IMG_HEX_MOUNTAIN02   = './img/hex_mountain02.png';
const PATH_IMG_HEX_PEAK01       = './img/hex_peak01.png';
const PATH_IMG_HEX_WATER01      = './img/hex_water01.png';
const PATH_IMG_HEX_WATER_DEEP01 = './img/hex_water_deep01.png';
const PATH_IMG_HEX_CASTLE01     = './img/hex_castle01.png';
const PATH_IMG_HEX_SETTLEMENT01 = './img/hex_settlement01.png';
const PATH_IMG_HEX_SETTLEMENT02 = './img/hex_settlement02.png';
const PATH_IMG_HEX_CURSEDABBEY  = './img/hex_cursed_abbey.png';
//HEX GRID IMGS - SMALL
const PATH_IMG_CHEST_SM01       = './img/chest_sm01.png';
const PATH_IMG_CAVE_SM01        = './img/cave_sm_01.png';
const PATH_IMG_MILL_ANIM        = './img/anim_mill.png';
const PATH_IMG_WAVE_ANIM        = './img/anim_water.png';
const PATH_IMG_WAVE_ANIM_2      = './img/anim_water_2.png';
const PATH_IMG_WATER_DEEP       = './img/water_rock';
//HEX GRID IMGS - LARGE
const PATH_IMG_UNKNOWN_LG       = './img/hex_lg_unknown.png';
const PATH_IMG_GRASS_LG         = './img/hex_lg_grass.png';
const PATH_IMG_FOREST_LG        = './img/hex_lg_forest.png';
const PATH_IMG_WATER_LG         = './img/hex_lg_water.png';
const PATH_IMG_MOUNTAIN_LG      = './img/hex_lg_mountain_peak.png';
const PATH_IMG_PEAK_LG          = './img/hex_lg_mountain_peak.png';
//CHARACTERS
const PATH_IMG_NPC_KNIGHT       = './img/unit_knight.png';

//UI
const PATH_IMG_PANEL_TOP        = './img/ui_top.png';
const PATH_IMG_PANEL_BOTTOM     = './img/ui_bottom2.png';
const PATH_IMG_PANEL_RIGHT      = './img/ui_right2.png';
const PATH_IMG_PANEL_SMALL      = './img/ui_smol.png';
const PATH_IMG_PANEL_SMALLER    = './img/ui_smoller.png';
const PATH_IMG_PANEL_SMALLWIDE  = './img/ui_smol_wide.png';
const PATH_IMG_PANEL_SQUARE     = './img/ui_square.png';
const PATH_IMG_ANIM_COIN        = './img/anim_coin.png';
const PATH_IMG_ANIM_MILL_SM     = './img/anim_mill_icon.png';
const PATH_IMG_ICON_FOOD        = './img/ui_icon_food.png';
const PATH_IMG_ICON_SWORD       = './img/sword_sm.png';
const PATH_IMG_ICON_SHIELD      = './img/shield_sm.png';
const PATH_IMG_ICON_MEDAL       = './img/medal_sm.png';
const PATH_IMG_ICON_HEART       = './img/heart_sm.png';
const PATH_IMG_ICON_AID         = './img/firstaid_sm.png';
const PATH_IMG_ICON_HOURGLASS   = './img/ui_hourglass.png';
const PATH_IMG_ICON_RNDTABLE    = './img/ui_table.png';
const PATH_IMG_CASTLE_SELECT    = './img/castle_lg.png';
const PATH_IMG_PAPER_LABEL      = './img/paper.png';
const PATH_IMG_CHEVRON_UP       = './img/chevron_up_sm.png';
const PATH_IMG_CHEVRON_DOWN     = './img/chevron_down_sm.png';

//STRINGS
let possibleTownNames = [
    "Stormhearth", "Ravenshire", "Blaggerfall", "Ironwood", "Drakenshire", "Frosthelm", "Blackrock", "Wintermere", "Greymoor", "Silvermere",
    "Darkhollow", "Goldhaven", "Stonekeep", "Thunderhold", "Everfrost", "Dragonmere", "Redcliff", "Ironspire", "Grimhold",
    "Valewatch", "Shadowhelm", "Westerglen", "Gildenshire", "Blackmere", "Stormcrest", "Oathwatch", "Ebonhold", "Mournhaven", "Brightvale",
    "Thornfield", "Wyrmgate", "Stonebrook", "Stormhaven", "Bloodmoor", "Wolfgate", "Ironvale", "Coldspring", "Darkvale", "Brackenridge",
    "Ashenford", "Wyvernroost", "Highmere", "Daggerwatch", "Frostwood", "Stormglen", "Dunhollow", "Silverbrook", "Ironhollow",
    "Darkmoor", "Everhall", "Windmere", "Northwatch", "Vexholm", "Grimstead", "Harrowmere", "Oakenhold", "Wolfpine", "Thundertree",
    "Glimmerbrook", "Stormhold", "Blackpine", "Mooncliff", "Ironridge", "Valebridge", "Duskhaven", "Fallowmere", "Shadowpine", "Westreach",
    "Emberfall", "Tarnwood", "Frostgate", "Northwood", "Drakehollow", "Silverpine", "Stoneguard", "Windspire", "Ravenrock", "Glenstone",
    "Oathholm", "Fellhaven", "Thistlekeep", "Elderglen", "Darkwatch", "Mistvale", "Dragonwatch", "Torwood", "Greywatch", "Brighthold",
    "Bjornholm", "Skaldrfjord", "Norrvik", "Jorundal", "Varhjem", "Drekkaheim", "Stormfjord", "Ulfrikstead", "Havngard", "Thrymfell",
    "Ragnarsvik", "Vinterhold", "Svenholm", "Iskarl", "Frostgard", "Haldorf", "Dunfjell", "Njordhaven", "Runestone",
    "Dunscaith", "Ballyfirth", "Inverloch", "Carrickmoor", "Lochmere", "Kilvarren", "Duncraig", "Tirnoch", "Caerbaile", "Strathmore",
    "Glenroth", "Eileanholm", "Macduir", "Ardglass", "Torvalen", "Breagha", "Fionnaval", "Kildoran", "Dunhaven", "Lismore",
    "Montclair", "Riversford", "Maplewood", "Halberton", "Newhaven", "Stonemere", "Ashcroft", "Greenhaven", "Fort Aberdeen", "Kingsbury",
    "Silverpeak", "Northbay", "Elkford", "Lumberton", "Brookhaven", "Willowdale", "Foxhollow", "Redwater", "Whitestone", "Thunder Bay",
    "Lunenburg", "Stratford", "Corner Brook", "Kingston"
];
//gets a random town names that is not already in passed list
function generateTownName(selected = null) {
    if (selected === null) {
      return possibleTownNames[Math.floor(Math.random() * possibleTownNames.length)];
    }  
    // get names not already selected
    const available = possibleTownNames.filter(name => !selected.includes(name));
    // in case somehow no names left, then default
    if (available.length === 0) {
      return "MFDOOMsville"; 
    }
  
    // finally, return a random string from remaining
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

//units stats
const unitParams = {

    default: {
        type: "unset",
    },
    
    camelot: {
        type: "castle",
        gold_per_turn: 1,
        food_per_turn: 0,        
    },

    town: {
        type: "settlement",
        subtype: "town",
        gold_per_turn: 2,
        food_per_turn: 0,
    },
    village: {
        type: "settlement",
        subtype: "village",
        gold_per_turn: 1,
        food_per_turn: 0,
    },
    farm: {
        type: "settlement",
        subtype: "farm",
        gold_per_turn: 0,
        food_per_turn: 2,
    },

    knight_arthur: {
        type: "unit",
        atk: 6,
        def: 5,
        vrt: 4,
        hp_cur: 25,
        hp_max: 50,
        ap_cur: 0,
        ap_max: 3,
        sight: 1,
    },

};
  