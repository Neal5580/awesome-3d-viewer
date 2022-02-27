class ShaderProgram {
    constructor({
        vertexCode,
        fragmentCode,
        positionBuffer,
        uvBuffer,
        normalBuffer
    }) {
        this.vertexCode = vertexCode;
        this.fragmentCode = fragmentCode;
        this.positionBuffer = positionBuffer;
        this.uvBuffer = uvBuffer;
        this.normalBuffer = normalBuffer;
    }

    init() {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, this.vertexCode)
        gl.compileShader(vertexShader);

        // Create fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, this.fragmentCode)
        gl.compileShader(fragmentShader);

        // Create  program
        this.program = gl.createProgram();

        // Attach shaders to this.program
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        gl.useProgram(this.program);
        gl.enable(gl.DEPTH_TEST);
    }
}