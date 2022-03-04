// Create Vertex Attribute Object (VAO)  
function createVertexArrayObject({ name, program, buffer, size }) {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return location
}

// Create Vertex Buffer Object (VBO) or Element Buffer Object (EBO)
function createBufferObject({ target, data }) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return buffer
}

// Resize canvas to avoid canvas distortion
const resizeCanvas = (canvas) => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        canvas.height = displayHeight;
        canvas.width = displayWidth;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
};

function load_mesh({ light, modelIndex, textureIndex = 0, position = vec3.fromValues(0, 0, 0) }) {
    // Create shader for main object
    const shaderProgram = new ShaderProgram({
        vertexCode: shaders.vertexShaderWithLights,
        fragmentCode: shaders.fragmentShaderWithLights
    });
    shaderProgram.init();
    // Create mesh for main object
    const mesh = new Mesh({
        vertices: new Vertex({
            position: models[modelFiles[modelIndex]].position, // vertexData,  
            normal: models[modelFiles[modelIndex]].normal,// normalData,   
            textureUV: models[modelFiles[modelIndex]].texcoord // uvData    
        }),
        texture: new Texture({
            textureFile: models[modelFiles[modelIndex]].textureFile,
            textureSlot: gl.TEXTURE0,
            textureType: gl.TEXTURE_2D,
            textureIndex
        }),
        shaderProgram: shaderProgram.program,
        position
    })
    mesh.init();
    gl.uniform4f(mesh.uniformLocations.lightColor, ...light.color);
    meshes.push(mesh);
}

function load_military_aircrafts() {
    load_mesh({ light, modelIndex: 0, textureIndex: 0, position: [0, 0, 0] });
    load_mesh({ light, modelIndex: 1, textureIndex: 1, position: [3, 0, -3] });
    load_mesh({ light, modelIndex: 2, textureIndex: 2, position: [-3, 0, 3] });
}