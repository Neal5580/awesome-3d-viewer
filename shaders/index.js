const fragmentShader = `#version 300 es
    precision mediump float;
  
    uniform vec4 lightColor;

    out vec4 myOutputColor;

    void main() {
        myOutputColor  = lightColor;
    }
`;

const vertexShader = `#version 300 es
    precision mediump float;

    layout (location = 0) in vec3 position;
 
    uniform mat4 matrix;
 
    void main() {  
        gl_Position = matrix * vec4(position, 1);
    }
`;

const vertexShaderWithLights = `#version 300 es
    precision mediump float;
 
    layout (location = 0) in vec3 position;
    layout (location = 1) in vec2 uv;
    layout (location = 2) in vec3 normal;

    out vec2 vUV;
    out vec4 vLightColor;
    out vec3 vLightPosition;
    out vec3 vCameraPosition;
    out vec3 vNormal;
    out mat4 vNormalMatrix;
    out vec3 vCurrentPosition;

    uniform mat4 matrix;
    uniform mat4 normalMatrix;
    uniform vec4 lightColor;
    uniform vec3 lightPosition;
    uniform vec3 cameraPosition;

    void main() { 
        vUV = uv;
        vLightColor = lightColor;
        vLightPosition = lightPosition;
        vCameraPosition = cameraPosition;
        vNormal = normal;
        vNormalMatrix = normalMatrix;

        // calculates current position 
        vCurrentPosition = (normalMatrix * vec4(position, 1.0)).xyz;
        gl_Position = matrix * vec4(position, 1);
    }
`;

const fragmentShaderWithLights = `#version 300 es
    precision mediump float;

    in vec2 vUV;
    in vec4 vLightColor;
    in vec3 vLightPosition;
    in vec3 vCameraPosition;
    in vec3 vNormal;
    in mat4 vNormalMatrix;
    in vec3 vCurrentPosition;

    uniform sampler2D textureID;
 
    out vec4 myOutputColor;

    void main() {
        // ambient lighting
	    float ambient = 0.2;

        // diffuse lighting
        vec3 worldNormal = (vNormalMatrix * vec4(vNormal, 1.0)).xyz;
	    vec3 normal = normalize(vNormal);
	    vec3 lightDirection = normalize(vLightPosition - vCurrentPosition);
	    float diffuse = max(0.0, dot(worldNormal, lightDirection));
 
        // specular lighting
	    float specularLight = 5.0;
	    vec3 viewDirection = normalize(vCameraPosition - vCurrentPosition); 
	    vec3 reflectionDirection = reflect(-lightDirection, worldNormal);
	    float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0), 16.0);
	    float specular = specAmount * specularLight;
 
        float vBrightness = diffuse + ambient + specular;
 
        // outputs final color
        vec4 texel = texture(textureID, vUV);
        texel *= vLightColor;
        texel.xyz *= vBrightness;
        myOutputColor  = texel;
    }
`;


const shaderObject = {
    vertexShader,
    fragmentShader,
    vertexShaderWithLights,
    fragmentShaderWithLights
}
