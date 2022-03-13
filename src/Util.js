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

function loadMesh({
    light,
    modelIndex,
    textureIndex = 0,
    position = vec3.fromValues(0, 0, 0),
    rotation = 0,
    isRunway = false,
    shaderProgram
}) {
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
        position,
        rotation,
        isRunway
    })
    mesh.init();
    gl.uniform4f(mesh.uniformLocations.lightColor, ...light.color);
    meshes.push(mesh);
}

function loadAircrafts() {
    // Create shader for main object
    const shaderProgram = new ShaderProgram({
        vertexCode: shaders.vertexShaderWithLights,
        fragmentCode: shaders.fragmentShaderWithLights
    });
    shaderProgram.init();

    loadMesh({
        light,
        modelIndex: 0,
        textureIndex: 0,
        position: [0, 0, 0],
        shaderProgram
    }); // f22
    loadMesh({
        light,
        modelIndex: 1,
        textureIndex: 1,
        position: [3, 0, -3],
        shaderProgram
    }); // f117
    loadMesh({
        light,
        modelIndex: 2,
        textureIndex: 2,
        position: [-3, 0, 3],
        shaderProgram
    }); // efa
    loadMesh({
        light,
        modelIndex: 5,
        textureIndex: 3,
        position: [0, -0.225, 0],
        rotation: -Math.PI / 4,
        isRunway: true,
        shaderProgram
    }); // runway
}