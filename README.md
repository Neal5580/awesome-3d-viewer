## Awesome 3D Viewer ##
This is my homemade WebGL2 3D engine with vanilla JavaScript. It loads several .obj model files and textures with lights. More importantly, it does not use any 3D libraries like Three.js and babylon.js.

The main purpose of this application is to demonstrate my strong understanding of the fundamentals of computer graphics and how to use modern graphics API to build an interactive web application.

### How do I start locally? ###  
It requires using a basic HTTP web server (a NodeJS Express server) since it loads resources via Fetch API (AJAX).
* Site: localhost:3000
* Command: `$ node server.js`
    
### Here are tips on how to play it: ### 
* Key "1" to "6" to change models
* Key "W", "A", "S", "D" to move camera position
* Key "Z" to switch camera mode (orthographic/perspective)
* Key "X" to switch mode (triangles/points/lines)
* Scroll wheel in/out
* Right mouse button drag to change camera's arcball rotation (orbit)
* Left mouse button click to stop main model rotation

### Configeration:
`ENABLE_LOOKAT` flag can be used to enable camera lookAt function instead of orbit. (Right mouse button drag) It defaults to false.

### Demo site: ### 
https://neal5580.github.io/awesome-3d-viewer/
