class Light extends Mesh {
    constructor(props) {
        super(props);
        this.color = props.color;
        this.position = props.position;
        this.rotateMatrix = mat4.create();
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        mat4.fromRotation(this.rotateMatrix, Math.PI * 0.015, [0, 1, 0]);
    }

    orbit() {
        mat4.multiply(this.modelMatrix, this.rotateMatrix, this.modelMatrix);
        vec3.transformMat4(this.position, this.position, this.rotateMatrix);
    }
}