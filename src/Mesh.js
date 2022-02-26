class Mesh {
    constructor({
        vertices,
        indices,
        texture,
        shaderProgram
    }) {
        this.vertices = vertices;
        this.indices = indices;
        this.texture = texture;
        this.shaderProgram = shaderProgram;

        this.modelMatrix = mat4.create();  // model matrix
        this.mvMatrix = mat4.create(); // model view matrix
        this.mvpMatrix = mat4.create(); // final matrix to shader 
        this.normalMatrix = mat4.create(); // It is same as model matrix
    }

    init() {
        // Vertex Array Object
        this.VAO = gl.createVertexArray();
        gl.bindVertexArray(this.VAO);

        // Vertex Buffer Object (VBO)
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

        // Element Buffer Object (EBO)
        if (this.indices) {
            createBufferObject({
                target: gl.ELEMENT_ARRAY_BUFFER,
                data: new Uint16Array(this.indices)
            })
        }

        if (this.texture) {
            this.texture.active();
        }

        createVertexArrayObject({
            name: 'position',
            program: this.shaderProgram,
            buffer: this.positionBuffer,
            size: 3
        });

        if (this.uvBuffer) {
            createVertexArrayObject({
                name: 'uv',
                program: this.shaderProgram,
                buffer: this.uvBuffer,
                size: 2
            });
        }

        if (this.normalBuffer) {
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
            lightColor: gl.getUniformLocation(this.shaderProgram, 'lightColor'),
            lightPosition: gl.getUniformLocation(this.shaderProgram, 'lightPosition'),
            cameraPosition: gl.getUniformLocation(this.shaderProgram, 'cameraPosition'),
            isTriangle: gl.getUniformLocation(this.shaderProgram, 'isTriangle')
        }

        // Set texture to texture slot 0
        if (this.uniformLocations.textureID) {
            gl.uniform1i(this.uniformLocations.textureID, 0);
        }

        // Unbind all to prevent accidentally modifying them
        gl.bindVertexArray(null); // VAO
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // VBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); // EBO 
    }

    draw({ camera, light }) {
        gl.useProgram(this.shaderProgram);
        gl.bindVertexArray(this.VAO); // Re-enable the current VAO

        mat4.multiply(this.mvMatrix, camera.viewMatrix, this.modelMatrix);
        mat4.multiply(this.mvpMatrix, camera.projectionMatrix, this.mvMatrix);

        const uniformLocations = this.uniformLocations;
        gl.uniform3f(uniformLocations.cameraPosition, ...camera.position);
        if (light) {
            gl.uniform3f(uniformLocations.lightPosition, ...light.position);
        }
        gl.uniformMatrix4fv(uniformLocations.matrix, false, this.mvpMatrix);
        gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, this.modelMatrix);
        gl.uniform1i(uniformLocations.isTriangle, drawMode === gl.TRIANGLES);

        if (light) {
            gl.drawArrays(drawMode, 0, this.vertices.position.length / 3);
        } else {
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }
    }
}