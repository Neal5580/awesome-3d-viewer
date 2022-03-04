class Texture {
    constructor({ textureFile, textureSlot, textureType, textureIndex }) {
        this.textureFile = textureFile;
        this.textureSlot = textureSlot;
        this.textureType = textureType;
        this.textureIndex = textureIndex;
    }

    // Active texture
    active() {
        gl.activeTexture(gl.TEXTURE0 + this.textureIndex);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureFile);
        gl.generateMipmap(gl.TEXTURE_2D);
    }
}