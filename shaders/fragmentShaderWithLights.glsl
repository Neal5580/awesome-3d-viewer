#version 300 es
precision mediump float;

in vec2 vUV;
in vec3 vNormal;
in vec3 vCurrentPosition; 

uniform sampler2D textureID;
uniform bool isTriangle;
uniform mat4 normalMatrix;
uniform vec4 lightColor;
uniform vec3 lightPosition;
uniform vec3 cameraPosition;

out vec4 myOutputColor;

void main() {
    if(!isTriangle == true) {
        // Output yellow points / lines
        myOutputColor = vec4(1, 1, 0, 1);
    } else {
        // Ambient lighting
	    float ambient = 0.2;

        // Diffuse lighting
        vec3 worldNormal = (normalMatrix * vec4(vNormal, 1.0)).xyz;
	    vec3 normal = normalize(vNormal);
	    vec3 lightDirection = normalize(lightPosition - vCurrentPosition);
	    float diffuse = max(0.0, dot(worldNormal, lightDirection));
 
        // Specular lighting
	    float specularLight = 5.0;
	    vec3 viewDirection = normalize(cameraPosition - vCurrentPosition); 
	    vec3 reflectionDirection = reflect(-lightDirection, worldNormal);
	    float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0), 16.0);
	    float specular = specAmount * specularLight;
 
        float vBrightness = diffuse + ambient + specular;
 
        // Outputs final color
        vec4 texel = texture(textureID, vUV);
        texel *= lightColor;
        texel.xyz *= vBrightness;
        myOutputColor  = texel; 
    } 
}