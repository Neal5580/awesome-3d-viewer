const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2 not supported');

const files = ['f22', 'f117', 'efa', 'drone', 'crab'];

// App states
let models = {};
let mesh;
let light;
let modelIndex = 0;
let drawMode = gl.TRIANGLES;
let stopRotate = false;

files.forEach(e => models[e] = { name: e });

Promise.all([
    // Load .obj files
    Promise.all(files.map(e =>
        fetch(`./assets/models/${e}.obj`)
            .then(response => response.text())))
        .then(list => {
            list.map((t, i) => {
                const data = parseOBJ(t);
                // Fix texture coordinates issue to avoid flipping horizontally
                data.texcoord = data.texcoord.map((e, i) => i % 2 !== 0 ? 1 - e : e);
                models[files[i]] = { ...models[files[i]], ...data }
            })
        }),
    // Load .png textures
    Promise.all(files.map(e => new Promise((resolve, reject) => {
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
    const camera = new Camera({ canvasId: 'canvas', position: [5, 5, 5] })

    // Create shader for light
    const lightShaderProgram = new ShaderProgram({
        vertexCode: shaderObject.vertexShader,
        fragmentCode: shaderObject.fragmentShader
    })
    lightShaderProgram.init()

    // Create mesh for light  
    light = new Light({
        color: vec4.fromValues(1, 1, 1, 1),
        position: vec3.fromValues(0, 2, 1.5),
        vertices: new Vertex({ position: lightVertexData }),
        indices,
        shaderProgram: lightShaderProgram.program
    })
    light.init();
    gl.uniform4f(light.uniformLocations.lightColor, ...light.color);

    load_mesh(light);

    function animate() {
        requestAnimationFrame(animate);
        resizeCanvas(canvas);
        camera.updateCameraMatrix()

        if (!stopRotate) {
            mat4.rotateY(mesh.modelMatrix, mesh.modelMatrix, Math.PI / 2 / 70);
        }
        if (drawMode === gl.TRIANGLES) {
            light.orbit()
        }

        mesh.draw({ camera, light });
        if (drawMode === gl.TRIANGLES) {
            light.draw({ camera });
        }
    }

    animate();
}
