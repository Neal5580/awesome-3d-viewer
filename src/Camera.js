class Camera {
    constructor({ canvasId, position, isPerspective = true }) {
        this.isPerspective = isPerspective;
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId)
        this.position = vec3.fromValues(...position);
        this.rotation = vec3.fromValues(0, 0, -1);
        this.up = vec3.fromValues(0, 1, 0);
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        this.ortho_fov = 100; // static fov factor
        this.yaw = -135; // camera rotation horizontal angle in degree
        this.pitch = -35; // camera rotation vertcial angle in degree
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('wheel', this.handleMouseWheel.bind(this));
        document.addEventListener('mousedown', this.handleMouseDown.bind(this))
        document.addEventListener('mousemove', this.handleMouseMove.bind(this))
        document.addEventListener('mouseup', this.handleMouseUp.bind(this))
        document.addEventListener("contextmenu", e => e.preventDefault());
        document.addEventListener('click', this.handleClick.bind(this))
    }

    updateCameraMatrix() {
        // Get camera rotation from yaw (horizontal angle) and pitch (vertcial angle)
        const x = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        const y = Math.sin(glMatrix.toRadian(this.pitch));
        const z = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        vec3.normalize(this.rotation, [x, y, z]);

        const targetPoint = vec3.fromValues(0, 0, 0);
        vec3.add(targetPoint, this.position, this.rotation);

        mat4.lookAt(this.viewMatrix, this.position, targetPoint, this.up);
        if (this.isPerspective) {
            mat4.perspective(
                this.projectionMatrix,
                55 * Math.PI / 180, // vertical fov (angle, radians)
                this.canvas.width / this.canvas.height, // aspect W/H
                0.1, // near cull distance
                1000 // far cull distance
            )
        } else {
            const w = this.canvas.width / this.ortho_fov
            const h = this.canvas.height / this.ortho_fov
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

        if (e.keyCode === 87) { // W key
            vec3.sub(this.position, this.position, this.up);
        } else if (e.keyCode === 83) { // S key
            vec3.add(this.position, this.position, this.up);
        } else if (e.keyCode === 65) { // A key
            vec3.add(this.position, this.position, cross);
        } else if (e.keyCode === 68) {// D key
            vec3.sub(this.position, this.position, cross);
        } else if (e.keyCode === 90) {// Z key
            this.isPerspective = !this.isPerspective;
        } else if (e.keyCode === 49) {// 1 key
            modelIndex = 0
            load_mesh(light)
        } else if (e.keyCode === 50) {// 2 key
            modelIndex = 1
            load_mesh(light)
        } else if (e.keyCode === 51) {// 3 key
            modelIndex = 2
            load_mesh(light)
        } else if (e.keyCode === 52) {// 4 key
            modelIndex = 3
            load_mesh(light)
        } else if (e.keyCode === 53) {// 5 key
            modelIndex = 4
            load_mesh(light)
        } else if (e.keyCode === 88) {// X key
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
            if (e.deltaY < 0) {
                vec3.add(this.position, this.position, this.rotation);
            } else {
                vec3.sub(this.position, this.position, this.rotation);
            }
        } else {
            if (e.deltaY < 0) {
                this.ortho_fov += 50
            } else {
                this.ortho_fov -= 50
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
        if (this.mouseDown) {
            const deltaX = this.offsetX - e.offsetX;
            const deltaY = this.offsetY - e.offsetY;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;

            const mouseSensitivity = 0.1
            this.yaw += deltaX * mouseSensitivity;
            this.pitch -= deltaY * mouseSensitivity;
            if (this.pitch > 89) this.pitch = 89;
            if (this.pitch < -89) this.pitch = -89;
        }
    }

    handleMouseUp(e) {
        e.preventDefault();
        this.mouseDown = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }
}