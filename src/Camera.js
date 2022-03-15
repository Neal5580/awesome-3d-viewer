class Camera {
    constructor({ canvasId, position, isPerspective = true }) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);

        this.position = vec3.fromValues(...position);
        this.rotation = vec3.fromValues(0, 0, -1);
        this.up = vec3.fromValues(0, 1, 0);
        this.targetPoint = vec3.fromValues(0, 0, 0);

        this.isPerspective = isPerspective;
        this.orthoFov = 260;
        this.perspFov = 55;

        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        this.prevYaw = this.yaw = -135; // Camera rotation horizontal angle in degree
        this.prevPitch = this.pitch = -37; // Camera rotation vertcial angle in degree

        this.mouse = undefined;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('mouseout', () => this.mouse = undefined);
        document.addEventListener("contextmenu", e => e.preventDefault());
        document.addEventListener('click', this.handleClick.bind(this))
    }

    updateCameraMatrix() {
        if (ENABLE_LOOKAT) {
            // Get camera rotation from yaw (horizontal angle) and pitch (vertcial angle)
            const x = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
            const y = Math.sin(glMatrix.toRadian(this.pitch));
            const z = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
            vec3.normalize(this.rotation, [x, y, z]);

            // Get target point by adding camera's position and rotation together
            vec3.add(this.targetPoint, this.position, this.rotation);
        } else {
            const rotationMatrix = mat4.create();
            const cameraDirection = vec3.create();
            const right = vec3.create();

            vec3.sub(cameraDirection, this.position, this.targetPoint); // Vector from camera position to target point
            vec3.normalize(cameraDirection, cameraDirection);
            vec3.cross(right, this.up, cameraDirection); // Right vector in camera space

            // Rotation of "right" axis in camera space
            mat4.fromRotation(
                rotationMatrix,
                -glMatrix.toRadian(this.pitch - this.prevPitch),
                [right[0], right[1], right[2]]
            );

            // Rotation of "up" axis in camera and world space
            mat4.rotate(
                rotationMatrix,
                rotationMatrix,
                glMatrix.toRadian(this.yaw - this.prevYaw),
                [this.up[0], this.up[1], this.up[2]]
            );

            vec3.transformMat4(this.position, this.position, rotationMatrix);
        }

        // Set view matrix based on camera's position and rotation
        // So that everything will be in camera space where camera is always at the origin
        mat4.lookAt(this.viewMatrix, this.position, this.targetPoint, this.up);
        if (this.isPerspective) {
            mat4.perspective(
                this.projectionMatrix,
                this.perspFov * Math.PI / 180, // vertical fov (angle, radians)
                this.canvas.width / this.canvas.height, // aspect W/H
                0.1, // near cull distance
                1000 // far cull distance
            )
        } else {
            const w = this.canvas.width / this.orthoFov
            const h = this.canvas.height / this.orthoFov
            mat4.ortho(this.projectionMatrix, -w, w, -h, h, -10, 1000);
        }
    }

    handleClick() {
        stopRotate = !stopRotate;
    }

    handleKeyDown(e) {
        // Cross vector between this.rotation and this.up
        const cross = vec3.fromValues(0, 0, 0);
        vec3.cross(cross, this.rotation, this.up);
        vec3.normalize(cross, cross);

        function updateModel(modelIndex) {
            meshes = [];
            selectMeshes = [];
            disableLight = false;

            // Create shader for main object
            const shaderProgram = new ShaderProgram({
                vertexCode: shaders.vertexShaderWithLights,
                fragmentCode: shaders.fragmentShaderWithLights
            });
            shaderProgram.init();
            loadMesh({ light, modelIndex: modelIndex, shaderProgram });
        }

        if (e.keyCode === 87) { // W key
            vec3.sub(this.position, this.position, this.up);
        } else if (e.keyCode === 83) { // S key
            vec3.add(this.position, this.position, this.up);
        } else if (e.keyCode === 65) { // A key
            vec3.add(this.position, this.position, cross);
        } else if (e.keyCode === 68) { // D key
            vec3.sub(this.position, this.position, cross);
        } else if (e.keyCode === 90) { // Z key
            this.isPerspective = !this.isPerspective;
        } else if (e.keyCode === 49) { // 1 key
            meshes = [];
            selectMeshes = [];
            disableLight = true;
            initAircrafts();
        } else if (e.keyCode === 50) { // 2 key
            updateModel(0);
        } else if (e.keyCode === 51) { // 3 key
            updateModel(1);
        } else if (e.keyCode === 52) { // 4 key
            updateModel(2);
        } else if (e.keyCode === 53) { // 5 key
            updateModel(3);
        } else if (e.keyCode === 54) { // 6 key
            updateModel(4);
        } else if (e.keyCode === 88) { // X key
            if (drawMode === gl.TRIANGLES) {
                drawMode = gl.POINTS
            } else if (drawMode === gl.POINTS) {
                drawMode = gl.LINES
            } else {
                drawMode = gl.TRIANGLES
            }
        }
    }

    handleMouseWheel(e) {
        if (this.isPerspective) {
            // Transform camera based on camera's rotation for perspective view
            if (e.deltaY < 0) {
                this.perspFov -= 5;
            } else {
                this.perspFov += 5;
            }
        } else {
            // Update fov angle for orthographic view
            if (e.deltaY < 0) {
                this.orthoFov += 50
            } else {
                this.orthoFov -= 50
            }
        }
    }

    handleMouseDown(e) {
        e.preventDefault();
        if (e.which === 3) {
            this.mouseDown = true;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;
        }
    }

    handleMouseMove(e) {
        e.preventDefault();
        // Calculate mouse move delta value
        const deltaX = this.offsetX - e.offsetX;
        const deltaY = this.offsetY - e.offsetY;
        this.offsetX = e.offsetX;
        this.offsetY = e.offsetY;

        if (this.mouseDown) {
            if (!ENABLE_LOOKAT) {
                this.prevPitch = this.pitch;
                this.prevYaw = this.yaw;
            }

            // Update camera's pitch and yaw angle 
            if (ENABLE_LOOKAT) {
                const mouseSensitivity = 0.1

                this.yaw += deltaX * mouseSensitivity;
                this.pitch -= deltaY * mouseSensitivity;

                // Avoid singularities like Looking straight down/up
                if (this.pitch > 89) this.pitch = 89;
                if (this.pitch < -89) this.pitch = -89;
            } else {
                const mouseSensitivity = 0.2

                // To calculate dot value between cameraDirection and up vector
                // If the dot value is -1 or 1, it means camera is looking straight down/up, which should be avoided
                const cameraDirection = vec3.create();
                vec3.sub(cameraDirection, this.position, this.targetPoint); // Vector from camera position to target point
                vec3.normalize(cameraDirection, cameraDirection);
                const f = vec3.dot(this.up, cameraDirection);

                // Avoid singularities like Looking straight down/up
                if (f > 0.98) {
                    this.pitch -= 0.2;
                    return;
                }
                if (f < -0.98) {
                    this.pitch -= -0.2;
                    return;
                }
                this.yaw += deltaX * mouseSensitivity;
                this.pitch -= deltaY * mouseSensitivity;
            }
        }
    }

    handleMouseUp(e) {
        e.preventDefault();
        this.mouseDown = false;
        this.offsetX = 0;
        this.offsetY = 0;

        this.prevPitch = this.pitch;
        this.prevYaw = this.yaw;
    }
}