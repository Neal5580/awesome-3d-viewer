class Texture {
    constructor({ textureFile, textureSlot, textureType }) {
        this.textureFile = textureFile;
        this.textureSlot = textureSlot;
        this.textureType = textureType;
    }

    // Active texture
    active() {
        const image = loadTexture(this.textureFile);
        gl.activeTexture(this.textureSlot);
        gl.bindTexture(this.textureType, image);
    }
}