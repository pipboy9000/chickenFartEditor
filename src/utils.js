function getRandomHexColor() {
    // Generate a random number between 0 and 16777215 (which is 0xFFFFFF).
    const randomColor = Math.floor(Math.random() * 16777215);

    // Convert the number to a hexadecimal string.
    let hexString = randomColor.toString(16);

    // Pad the string with leading zeros if it's less than 6 characters long.
    // This ensures we always get a 6-digit hex code.
    while (hexString.length < 6) {
        hexString = "0" + hexString;
    }

    // Prepend the '#' symbol to the hex string and return it.
    return "#" + hexString;
}

export function getEntitiesDistance(entityA, entityB) {
    const dx = entityA.x - entityB.x;
    const dy = entityA.y - entityB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function getEntitiesDistanceSqr(entityA, entityB) {
    const dx = entityA.x - entityB.x;
    const dy = entityA.y - entityB.y;
    return dx * dx + dy * dy;
}

/**
 * Creates a seeded pseudo-random number generator (sfc32 algorithm).
 * @param {string} seedString - The string used to initialize the generator.
 * @returns {function(): number} - A function that returns a repeatable random number (0 <= x < 1).
 */
export function seededRandom(seedString) {
    // A simple hash function to turn the seed string into initial numbers
    function mash(data) {
        let n = 0xefc8249d;
        for (let i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h *= 9.375477040683075e-10;
        }
        return n;
    }

    let seed = mash(seedString);
    let a = seed;
    let b = seed;
    let c = seed;
    let d = 1; // Initial state variables

    // The actual random number function
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0; 
        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296; // Normalize to 0-1 range
    };
}