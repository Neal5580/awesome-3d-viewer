#version 300 es
precision mediump float;
 
layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;
layout (location = 2) in vec3 normal;

out vec2 vUV; 
out vec3 vNormal; 
out vec3 vCurrentPosition;

uniform mat4 matrix;
uniform mat4 normalMatrix; 
uniform bool isTriangle;

void main() {
    vUV = uv; 
    vNormal = normal;

    // Set point size for gl.POINTS draw
    if(!isTriangle == true){
        gl_PointSize = 3.0; 
    }

    // Calculates current position 
    vCurrentPosition = (normalMatrix * vec4(position, 1.0)).xyz;
    gl_Position = matrix * vec4(position, 1);
}