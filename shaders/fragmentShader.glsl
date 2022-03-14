#version 300 es
precision mediump float;
  
uniform vec4 staticColor;

out vec4 myOutputColor;

void main() {
    myOutputColor = staticColor;
}