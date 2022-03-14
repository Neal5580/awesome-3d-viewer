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

// Load everything that mesh needs
function loadMesh({
    light,
    modelIndex,
    textureIndex = 0,
    position = vec3.fromValues(0, 0, 0),
    rotation = 0,
    isRunway = false,
    shaderProgram,
    isSelectProgram = false
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
        isRunway,
        isSelectProgram,
        modelIndex
    })
    mesh.init();
    if (isSelectProgram) {
        selectMeshes.push(mesh)
    } else {
        gl.uniform4f(mesh.uniformLocations.staticColor, ...light.color);
        meshes.push(mesh)
    }
}

// Prepare and initialize Aircrafts scene
function initAircrafts() {
    // Create shader for select program (pick highlight feature)
    const selectProgram = new ShaderProgram({
        vertexCode: shaders.vertexShader,
        fragmentCode: shaders.fragmentShader
    })
    selectProgram.init()

    loadAircrafts({ shaderProgram: selectProgram, isSelectProgram: true });

    // Create shader for main object
    const shaderProgram = new ShaderProgram({
        vertexCode: shaders.vertexShaderWithLights,
        fragmentCode: shaders.fragmentShaderWithLights
    });
    shaderProgram.init();

    loadAircrafts({ shaderProgram });
}

// Load Aircrafts scene
function loadAircrafts({ shaderProgram, isSelectProgram = false }) {
    loadMesh({
        light,
        modelIndex: 0,
        textureIndex: 0,
        position: [0, 0, 0],
        shaderProgram,
        isSelectProgram
    }); // f22
    loadMesh({
        light,
        modelIndex: 1,
        textureIndex: 1,
        position: [3, 0, -3],
        shaderProgram,
        isSelectProgram
    }); // f117
    loadMesh({
        light,
        modelIndex: 2,
        textureIndex: 2,
        position: [-3, 0, 3],
        shaderProgram,
        isSelectProgram
    }); // efa
    loadMesh({
        light,
        modelIndex: 5,
        textureIndex: 3,
        position: [0, -0.225, 0],
        rotation: -Math.PI / 4,
        isRunway: true,
        shaderProgram,
        isSelectProgram
    }); // runway
}

// A list of colors for selected object
const COLOR_MAP = [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 1],
    [0, 0, 1, 1],
    [0, 1, 0, 1],
]

// Compare if two arrays has the same values
function compareArrays(a, b) {
    return a.every((e, i) => e === b[i])
}

//This method is used to update selected object from mouse position
function updateSelectedObjectId() {
    // Draw scene by selectProgram shader to get pick object from mouse poisition
    // And reset depth and color buffer after it is done
    for (const mesh of selectMeshes) {
        mesh.rotate();
        mesh.draw({ camera, light });
    }

    // Stop execution if there is no mouse event
    if (!camera?.mouse?.offsetY || !camera?.mouse?.offsetX) {
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        return;
    };

    const pixel = new window.Uint8Array(4);

    // Convert the canvas coordinate system into an image coordinate system.
    const mouse_y = canvas.clientHeight - camera.mouse.offsetY;
    const mouse_x = camera.mouse.offsetX;

    // Get the color value from the rendered color buffer.
    gl.readPixels(mouse_x, mouse_y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    // Convert RGBA color as pixel into integter to get ID of the selected object 
    selectedObjectId = COLOR_MAP.findIndex(
        e => compareArrays(
            e.map(e => e * 255), // Convert RGBA channels from [0-1] to [0-255]
            pixel
        ));

    // Clear depth and color buffer
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
}

