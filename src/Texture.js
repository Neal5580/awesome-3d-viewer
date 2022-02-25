class Texture {
    constructor({ path, textureSlot, textureType }) {
        this.path = path;
        this.textureSlot = textureSlot;
        this.textureType = textureType;
    }

    // Active texture
    active() {
        const image = loadTexture(this.path);
        gl.activeTexture(this.textureSlot);
        gl.bindTexture(this.textureType, image);
    }
}