class Mesh {
    constructor({
        vertices,
        indices,
        texture,
        shaderProgram,
        position,
        rotation,
        isRunway,
        isSelectProgram,
        modelIndex
    }) {
        this.vertices = vertices;
        this.indices = indices;
        this.texture = texture;
        this.shaderProgram = shaderProgram;
        this.position = vec3.fromValues(...position);
        this.rotation = rotation;
        this.isRunway = isRunway;
        this.isSelectProgram = isSelectProgram;
        this.modelIndex = modelIndex;

        this.modelMatrix = mat4.create();  // model matrix
        this.mvMatrix = mat4.create(); // model view matrix
        this.mvpMatrix = mat4.create(); // final matrix to shader 
        this.normalMatrix = mat4.create(); // It is same as model matrix 

        if (this.rotation) {
            mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation);
        }
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);

        // Convert ID as integter into RGBA color
        this.staticColor = colorMap[modelIndex]
    }

    init() {
        // Create Vertex Array Object (VAO)
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);

        // Create Vertex Buffer Object (VBO)
        this.positionBuffer = createBufferObject({
            target: gl.ARRAY_BUFFER,
            data: new Float32Array(this.vertices.position)
        })

        if (this.vertices.textureUV) {
            this.uvBuffer = createBufferObject({
                target: gl.ARRAY_BUFFER,
                data: new Float32Array(this.vertices.textureUV)
            })
        }

        if (this.vertices.normal) {
            this.normalBuffer = createBufferObject({
                target: gl.ARRAY_BUFFER,
                data: new Float32Array(this.vertices.normal)
            })
        }

        // Create Element Buffer Object (EBO)
        if (this.indices) {
            createBufferObject({
                target: gl.ELEMENT_ARRAY_BUFFER,
                data: new Uint16Array(this.indices)
            })
        }

        if (this.texture) {
            this.texture.active();
        }

        // Set Vertex Array Object (VAO)
        createVertexArrayObject({
            name: 'position',
            program: this.shaderProgram,
            buffer: this.positionBuffer,
            size: 3
        });

        if (this.uvBuffer && !this.isSelectProgram) {
            createVertexArrayObject({
                name: 'uv',
                program: this.shaderProgram,
                buffer: this.uvBuffer,
                size: 2
            });
        }

        if (this.normalBuffer && !this.isSelectProgram) {
            createVertexArrayObject({
                name: 'normal',
                program: this.shaderProgram,
                buffer: this.normalBuffer,
                size: 3
            })
        }

        // Always add uniform after useProgram
        this.uniformLocations = {
            matrix: gl.getUniformLocation(this.shaderProgram, 'matrix'),
            normalMatrix: gl.getUniformLocation(this.shaderProgram, 'normalMatrix'),
            textureID: gl.getUniformLocation(this.shaderProgram, 'textureID'),
            staticColor: gl.getUniformLocation(this.shaderProgram, 'staticColor'),
            lightPosition: gl.getUniformLocation(this.shaderProgram, 'lightPosition'),
            cameraPosition: gl.getUniformLocation(this.shaderProgram, 'cameraPosition'),
            disableLight: gl.getUniformLocation(this.shaderProgram, 'disableLight'),
            isTriangle: gl.getUniformLocation(this.shaderProgram, 'isTriangle'),
            isSelected: gl.getUniformLocation(this.shaderProgram, 'isSelected')
        }

        // Set texture to texture slot (0 + textureIndex)
        if (this.uniformLocations.textureID) {
            gl.uniform1i(this.uniformLocations.textureID, this.texture.textureIndex);
        }

        // Unbind all to prevent accidentally modifying them
        gl.bindVertexArray(null); // VAO
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // VBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // EBO 
    }

    draw({ camera, light }) {
        gl.useProgram(this.shaderProgram);
        gl.bindVertexArray(this.VAO); // Re-enable the current VAO

        // Get world matrix
        mat4.multiply(this.mvMatrix, camera.viewMatrix, this.modelMatrix);
        mat4.multiply(this.mvpMatrix, camera.projectionMatrix, this.mvMatrix);

        // Update uniforms for shaders
        const uniformLocations = this.uniformLocations;
        gl.uniform3f(uniformLocations.cameraPosition, ...camera.position);
        if (light) {
            gl.uniform3f(uniformLocations.lightPosition, ...light.position);
        }
        gl.uniformMatrix4fv(uniformLocations.matrix, false, this.mvpMatrix);
        gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, this.modelMatrix);
        gl.uniform1i(uniformLocations.disableLight, drawMode === gl.TRIANGLES && disableLight);
        gl.uniform1i(uniformLocations.isTriangle, drawMode === gl.TRIANGLES);
        gl.uniform1i(
            uniformLocations.isSelected,
            // If the model is selected and it is not runaway model (modelIndex: 5)
            selectedObjectId === this.modelIndex && this.modelIndex !== 5
        );

        if (this.isSelectProgram) {
            gl.uniform4f(this.uniformLocations.staticColor, ...this.staticColor);
        }

        // Set texture to texture slot (0 + textureIndex)
        if (uniformLocations.textureID) {
            gl.uniform1i(uniformLocations.textureID, this.texture.textureIndex);
        }

        if (light) {
            // Draw main model object
            gl.drawArrays(drawMode, 0, this.vertices.position.length / 3);
        } else {
            // Draw hardcoded light object
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }
    }

    rotate() {
        if (this.isRunway) return;
        if (!stopRotate) {
            mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / 2 / 70);
        }
    }
}