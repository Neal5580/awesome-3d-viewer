const fragmentShader = `#version 300 es
    precision mediump float;
  
    uniform vec4 lightColor;

    out vec4 myOutputColor;

    void main() {
        myOutputColor = lightColor;
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

        // calculates current position 
        vCurrentPosition = (normalMatrix * vec4(position, 1.0)).xyz;
        gl_Position = matrix * vec4(position, 1);
    }
`;

const fragmentShaderWithLights = `#version 300 es
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
        if(!isTriangle == true){
            myOutputColor = vec4(1, 1, 0, 1); // Output yellow points / lines
        } else {
            // ambient lighting
	        float ambient = 0.2;

            // diffuse lighting
            vec3 worldNormal = (normalMatrix * vec4(vNormal, 1.0)).xyz;
	        vec3 normal = normalize(vNormal);
	        vec3 lightDirection = normalize(lightPosition - vCurrentPosition);
	        float diffuse = max(0.0, dot(worldNormal, lightDirection));
 
            // specular lighting
	        float specularLight = 5.0;
	        vec3 viewDirection = normalize(cameraPosition - vCurrentPosition); 
	        vec3 reflectionDirection = reflect(-lightDirection, worldNormal);
	        float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0), 16.0);
	        float specular = specAmount * specularLight;
 
            float vBrightness = diffuse + ambient + specular;
 
            // outputs final color
            vec4 texel = texture(textureID, vUV);
            texel *= lightColor;
            texel.xyz *= vBrightness;
            myOutputColor  = texel; 
        } 
    }
`;


const shaderObject = {
    vertexShader,
    fragmentShader,
    vertexShaderWithLights,
    fragmentShaderWithLights
}
