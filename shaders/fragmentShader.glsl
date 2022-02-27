#version 300 es
precision mediump float;
  
uniform vec4 lightColor;

out vec4 myOutputColor;

void main() {
    myOutputColor = lightColor;
}