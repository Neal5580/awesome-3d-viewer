// F|L|B|R|T|U
const vertexData = [
    // Front
    0.5, 0.5, 0.5, // top right 
    0.5, -.5, 0.5, // bottom right
    -.5, 0.5, 0.5, // top left 
    -.5, -.5, 0.5, // bottom left

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, -.5,

    // Underside
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,
];

const lightVertexData = vertexData.map(e => e / 3);

// Indices for vertices order
const indices = [
    // Front
    0, 1, 2,
    2, 1, 3,

    // Left
    4, 5, 6,
    6, 5, 7,

    // Back
    8, 9, 10,
    10, 9, 11,

    // Right
    12, 13, 14,
    14, 13, 15,

    // Top
    16, 17, 18,
    18, 17, 19,

    // Underside
    20, 21, 22,
    22, 21, 23,
];

// Construct an Array by repeating `pattern` n times
function repeat(n, pattern) {
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}

const uvData = repeat(6, [ // 6 means 6 faces
    1, 1, // top right
    1, 0, // bottom right
    0, 1, // top left 
    0, 0  // bottom left
]);

// F|L|B|R|T|U
const normalData = [
    ...repeat(4, [0, 0, 1]),    // Z+ (4 means 4 vertex)
    ...repeat(4, [-1, 0, 0]),   // X-
    ...repeat(4, [0, 0, -1]),   // Z-
    ...repeat(4, [1, 0, 0]),    // X+
    ...repeat(4, [0, 1, 0]),    // Y+
    ...repeat(4, [0, -1, 0]),   // Y-
]
