// simple seed-based random number generator (PRNG)
function seededRandom(seed) {
    // Use a simple pseudo-random generator based on a seed
    seed = (seed * 9301 + 49297) % 233280;  // Linear congruential generator formula
    return seed / 233280;  // Normalize to [0, 1)
}
  
// Convert hex color to RGB format
function hexToRgb(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

// calc brightness of color using luminosity formula
function brightness(rgb) {
    return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

// hex distance function using axial coordinates
function hexDistance(q1, r1, q2, r2) {
    return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((-q1 - r1) - (-q2 - r2))) / 2;
}

//get a random int from zero to max
function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

//load/save game config params from/to localStorage
function loadConfig() {
    if (localStorage.getItem("userConfig") !== null) {
        console.log("loading config from localStorage");
        userConfig = JSON.parse(localStorage.getItem("userConfig"));
        return Promise.resolve(userConfig);
    } else {
        console.log("loading config from default");
        return Promise.resolve(JSON.parse(DEFAULT_GAME_OPTIONS)).then(config => {
            console.log("Config loaded:", config);
            userConfig = config;
            localStorage.setItem("userConfig", JSON.stringify(config));
            return config;
        }).catch(() => {
            console.error("Error loading config");
        });
    }
}
function saveConfig() {
    console.log("saving config to localStorage");
    localStorage.setItem("userConfig", JSON.stringify(userConfig))
}

//load contents of a .js file
function loadScript(scriptUrl, callback) {
    let script = document.createElement("script");
    script.src = scriptUrl;
    script.onload = callback;
    document.head.appendChild(script);
}

//takes a (presumably) long string and returns an array of strings of given max length
function wrapText(text, maxChars) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
  
    for (let word of words) {
      if ((currentLine + word).length <= maxChars) {
        currentLine += word + ' ';
      } else {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      }
    }
    if (currentLine) lines.push(currentLine.trim());
  
    return lines;
}

//functions used for odd-q hexagonal grid calculations
function offsetToCube(col, row) {
    const x = col;
    const z = row - ((col & 1) ? (col - 1) / 2 : col / 2); // odd-q adjustment
    const y = -x - z;
    return { x, y, z };
}
function cubeDistance(a, b) {
    return Math.max(
        Math.abs(a.x - b.x),
        Math.abs(a.y - b.y),
        Math.abs(a.z - b.z)
    );
}