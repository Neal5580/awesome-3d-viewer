/**
 * color_to_id.js, By Wayne Brown, Spring 2016
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

/** =======================================================================
 *
 * @param gl WebGLRenderingContext
 * @constructor
 */
window.ColorToID = function (gl) {

    var self = this;

    // Get the precision of each color component
    var red_bits = gl.getParameter(gl.RED_BITS);
    var green_bits = gl.getParameter(gl.GREEN_BITS);
    var blue_bits = gl.getParameter(gl.BLUE_BITS);
    var alpha_bits = gl.getParameter(gl.ALPHA_BITS);
    var total_bits = red_bits + green_bits + blue_bits + alpha_bits;

    var red_scale = Math.pow(2, red_bits);
    var green_scale = Math.pow(2, green_bits);
    var blue_scale = Math.pow(2, blue_bits);
    var alpha_scale = Math.pow(2, alpha_bits);

    var red_shift = Math.pow(2, green_bits + blue_bits + alpha_bits);
    var green_shift = Math.pow(2, blue_bits + alpha_bits);
    var blue_shift = Math.pow(2, alpha_bits);

    var color = new Float32Array(4);

    /** ---------------------------------------------------------------------
     * Given a RGBA color value, where each component is in the range [0.0,1.0],
     * create a integer ID.
     * @param r Number Red component in the range [0.0,+1.0]
     * @param g Number Green component in the range [0.0,+1.0]
     * @param b Number Blue component in the range [0.0,+1.0]
     * @param a Number Alpha component in the range [0.0,+1.0]
     * @returns Number An integer ID
     */
    self.createID = function (r, g, b, a) {
        // Change the color component values from the range (0.0, 1.0) to integers
        // in the range (0, 2^bits-1).
        r = Math.round(r * (red_scale - 1));
        g = Math.round(g * (green_scale - 1));
        b = Math.round(b * (blue_scale - 1));
        a = Math.round(a * (alpha_scale - 1));

        // Shift each component to its bit position in the integer
        return (r * red_shift + g * green_shift + b * blue_shift + a);
    };

    /** ---------------------------------------------------------------------
     * Given a RGBA color value from a color buffer, where each component
     * value is an integer in the range [0,numBits-1].
     * @param r Number Red   component in the range [0,numBits-1]
     * @param g Number Green component in the range [0,numBits-1]
     * @param b Number Blue  component in the range [0,numBits-1]
     * @param a Number Alpha component in the range [0,numBits-1]
     * @returns Number An integer identifier.
     */
    self.getID = function (r, g, b, a) {
        // Shift each component to its bit position in the integer
        return (r * red_shift + g * green_shift + b * blue_shift + a);
    };

    /** ---------------------------------------------------------------------
     * Given an integer ID, convert it into an RGBA color.
     * @param id
     * @returns Float32Array An RGBA color as a 4-component array of floats.
     */
    self.createColor = function (id) {
        var r, g, b, a;

        r = Math.floor(id / red_shift);
        id = id - (r * red_shift);

        g = Math.floor(id / green_shift);
        id = id - (g * green_shift);

        b = Math.floor(id / blue_shift);
        id = id - (b * blue_shift);

        a = id;

        color[0] = r / (red_scale - 1);
        color[1] = g / (green_scale - 1);
        color[2] = b / (blue_scale - 1);
        color[3] = a / (alpha_scale - 1);

        return color;
    };
};
