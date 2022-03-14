const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2 not supported');

const modelFiles = ['f22', 'f117', 'efa', 'drone', 'crab', 'runway'];
const shaderFiles = [
    'vertexShader',
    'fragmentShader',
    'vertexShaderWithLights',
    'fragmentShaderWithLights'
];

// App states
let models = {};
let shaders = {};
let meshes = [];
let selectMeshes = [];
let light;
let drawMode = gl.TRIANGLES;
let stopRotate = false;
let disableLight = true;
let camera;
let selectedObjectId = 0; // Highlight object ID (pick feature)

// Config
const ENABLE_LOOKAT = false; // To enable camera lookAt function instead of orbit (Mouse right button + drag )

modelFiles.forEach(e => models[e] = { name: e });
shaderFiles.forEach(e => shaders[e] = '');

Promise.all([
    // Load .glsl shader files
    Promise.all(shaderFiles.map(e =>
        fetch(`./shaders/${e}.glsl`)
            .then(response => response.text())))
        .then(list => list.map((t, i) => shaders[shaderFiles[i]] = t)),
    // Load .obj model files
    Promise.all(modelFiles.map(e =>
        fetch(`./assets/models/${e}.obj`)
            .then(response => response.text())))
        .then(list => list.map((t, i) => {
            const data = parseOBJ(t);
            // Fix texture coordinates issue to avoid flipping horizontally
            data.texcoord = data.texcoord.map((e, i) => i % 2 !== 0 ? 1 - e : e);
            models[modelFiles[i]] = { ...models[modelFiles[i]], ...data }
        })),
    // Load .png textures
    Promise.all(modelFiles.map(e => new Promise((resolve, reject) => {
        const textureFile = new Image();
        textureFile.onload = () => {
            models[e]['textureFile'] = textureFile;
            resolve();
        }
        textureFile.onerror = e => reject(e);
        textureFile.src = `assets/textures/${e}.png`;
    })))
])
    .then(() => main()) // Start
    .catch(e => console.error(e));

function main() {
    // Create camera 
    camera = new Camera({ canvasId: 'canvas', position: [5, 5, 5] })

    // Create shader for light
    const lightShaderProgram = new ShaderProgram({
        vertexCode: shaders.vertexShader,
        fragmentCode: shaders.fragmentShader
    })
    lightShaderProgram.init()

    // Create mesh for light  
    light = new Light({
        color: vec4.fromValues(1, 1, 1, 1),
        position: vec3.fromValues(0, 2, 2),
        vertices: new Vertex({ position: lightVertexData }),
        indices,
        shaderProgram: lightShaderProgram.program
    })
    light.init();
    gl.uniform4f(light.uniformLocations.staticColor, ...light.color);

    initAircrafts();

    function animate() {
        requestAnimationFrame(animate);
        resizeCanvas(canvas);
        camera.updateCameraMatrix();

        // Only show it when user has disable light (loadAircrafts scene)
        if (camera?.mouse?.offsetY && camera?.mouse?.offsetX && disableLight) {
            updateSelectedObjectId();
        }

        if (drawMode === gl.TRIANGLES && !disableLight) {
            light.orbit();
            light.draw({ camera });
        }

        for (const mesh of meshes) {
            mesh.rotate();
            mesh.draw({ camera, light });
        }
    }

    animate();
}
