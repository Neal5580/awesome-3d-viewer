const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('WebGL2 not supported');

let models;
let mesh;
let light;
let modelIndex = 0;
let is_lines = false;

const files = ['f22', 'f117', 'efa', 'drone', 'crab'];

Promise.all(files.map((e) =>
    fetch(`./assets/models/${e}.obj`)
        .then(response => response.text())
        .catch((e) => console.error(e))))
    .then(list => {
        models = list.map((text, index) => {
            const data = parseOBJ(text);
            // Fix texture coordinate issue to avoid flipping horizontally
            data.texcoord = data.texcoord.map((e, i) => i % 2 !== 0 ? 1 - e : e);
            return { name: files[index], ...data }
        });
        main();
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

        // mat4.rotateZ(mesh.modelMatrix, mesh.modelMatrix, Math.PI / 2 / 70);
        // mat4.rotateX(mesh.modelMatrix, mesh.modelMatrix, Math.PI / 2 / 70);
        mat4.rotateY(mesh.modelMatrix, mesh.modelMatrix, Math.PI / 2 / 70);
        light.orbit()

        mesh.draw({ camera, light });
        light.draw({ camera });
    }

    animate();
}
