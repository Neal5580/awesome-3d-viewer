## Awesome 3D Viewer ##
 
This is my homemade WebGL 3D engine with vanilla JavaScript. It does not use any 3D library like Three.js.

It requires using a basic HTTP web server (a NodeJS Express server) since it loads resources via Fetch API (AJAX).

### How do I start locally? ###  
* Site: localhost:3000
* Command: $ node server.js
    
### Here are tips on how to play it: ### 
* Key "1" to "5" to change models
* Key "W", "A", "S", "D" to move camera position
* Key "Z" to switch camera mode (orthographic / perspective)
* Key "X" to switch mode (line / triangle)
* Mouse wheel to zoom in / out
* Mouse right button + drag to change camera's lookAt point
* Mouse left click to stop model rotation

### Demo site: ### 
https://neal5580.github.io/awesome-3d-viewer/
