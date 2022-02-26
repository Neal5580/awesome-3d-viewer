const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2 not supported');

// App states
let models;
let mesh;
let light;
let modelIndex = 0;
let drawMode = gl.TRIANGLES;
let stopRotate = false;

const files = ['f22', 'f117', 'efa', 'drone', 'crab'];

// Load .obj files and .png images beforehand
Promise.all(files.map(e =>
    fetch(`./assets/models/${e}.obj`)
        .then(response => response.text())
        .catch(e => console.error(e))))
    .then(list => Promise.all(list.map((t, i) => new Promise((resolve, reject) => {
        const data = parseOBJ(t);
        // Fix texture coordinate issue to avoid flipping horizontally
        data.texcoord = data.texcoord.map((e, i) => i % 2 !== 0 ? 1 - e : e);
        const textureFile = new Image();
        textureFile.onload = () => resolve({ name: files[i], ...data, textureFile });
        textureFile.onerror = e => reject(e);
        textureFile.src = `assets/textures/${files[i]}.png`;
    }))))
    .then(list => {
        models = list;
        main(); // Start
    })
    .catch((e) => console.error(e));

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
