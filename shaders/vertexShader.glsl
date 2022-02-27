#version 300 es
precision mediump float;

layout (location = 0) in vec3 position;
 
uniform mat4 matrix;
 
void main() {  
    gl_Position = matrix * vec4(position, 1);
}