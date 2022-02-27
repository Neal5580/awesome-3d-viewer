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

// Load texture
function loadTexture(textureFile) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureFile);
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

// Active texture
function activeTexture({ path, textureSlot, textureType }) {
    const brick = loadTexture(`textures/invent-box-logo-512px.jpg`);
    gl.activeTexture(gl.TEXTURE0); // active texture slot 0
    gl.bindTexture(gl.TEXTURE_2D, brick);
}

const resizeCanvas = (canvas) => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        canvas.height = displayHeight;
        canvas.width = displayWidth;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
};

function load_mesh(light) {
    // Create shader for main object
    const shaderProgram = new ShaderProgram({
        vertexCode: shaderObject.vertexShaderWithLights,
        fragmentCode: shaderObject.fragmentShaderWithLights
    })
    shaderProgram.init()

    // Create mesh for main object
    mesh = new Mesh({
        vertices: new Vertex({
            position: models[files[modelIndex]].position, // vertexData,  
            normal: models[files[modelIndex]].normal,// normalData,   
            textureUV: models[files[modelIndex]].texcoord // uvData    
        }),
        texture: new Texture({
            textureFile: models[files[modelIndex]].textureFile,
            textureSlot: gl.TEXTURE0,
            textureType: gl.TEXTURE_2D
        }),
        shaderProgram: shaderProgram.program
    })
    mesh.init();
    gl.uniform4f(mesh.uniformLocations.lightColor, ...light.color);
}