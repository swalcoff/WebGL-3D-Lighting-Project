// PointLightedCube_perFragment.js (c) 2012 matsuda and kanda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' + // Defined constant in main()
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  // '  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);\n' + // Sphere color
  '  gl_Position = u_MvpMatrix * u_ModelMatrix * a_Position;\n' +
     // Calculate the vertex position in the world coordinate
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'uniform vec3 u_CameraPosition;\n' +
  'uniform float u_LightSwitch;\n'+
  'uniform float u_NormalVision;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
     // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  vec3 reflect = reflect(-lightDirection, normal);\n' +
  '  vec3 vE      = normalize(u_CameraPosition - v_Position);\n' +
  '  float cos    = dot(vE, reflect);\n' + 
  '  float specular = pow(max(cos, 0.0), 27.0);\n' +
  '  if(u_NormalVision != 1.0){\n' +
  '  	gl_FragColor = u_LightSwitch * vec4(diffuse + ambient + u_LightColor * specular, 1.0) + (1.0 - u_LightSwitch) * v_Color;\n' +
  '  } else {\n' +
  '  	gl_FragColor = vec4(v_Normal, 1.0);\n' +
  '	 }\n' +
  '}\n';

let ASPECT_RATIO = 1.0
let gl = null;
let onOff = 1;
let normalVis = 0;
let u_CameraPosition = null;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  ASPECT_RATIO = canvas.width/canvas.height;

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // WASD event handler
  document.onkeydown = function(ev){ keydown(ev, gl); }
  //button handlers
  var lightButton = document.getElementById("light");
  var normalButton = document.getElementById("normal");
  lightButton.addEventListener('click', lightfunc);
  normalButton.addEventListener('click',normalfunc);

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }


  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  update();

}

function lightfunc()
{
	onOff = (onOff + 1) % 2;
}

function normalfunc()
{
	normalVis = (normalVis + 1) % 2;
}

function renderScene(gl)
{
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  var matrix = new Matrix4();
  // draw sky front
  matrix.setIdentity();
  matrix.translate(0,0,-8);
  matrix.scale(4,4,-0.1);
  drawCube1(gl,matrix,0.25,0.6,0.96);
  // draw sky left
  matrix.setIdentity();
  matrix.translate(-8,0,0);
  matrix.rotate(90,0,1,0);
  matrix.scale(4,4,-0.1);
  drawCube1(gl,matrix,0.25,0.6,0.96);
  // draw sky right
  matrix.setIdentity();
  matrix.translate(8,0,0);
  matrix.rotate(90,0,1,0);
  matrix.scale(4,4,-0.1);
  drawCube1(gl,matrix,0.25,0.6,0.96);
  // draw ground
  matrix.setIdentity();
  matrix.translate(0,-1,0);
  matrix.rotate(90,1,0,0);
  matrix.scale(4,4,-0.1);
  drawCube1(gl,matrix,0.02,0.38,0.12);
  // draw square
  matrix.setIdentity();
  matrix.translate(0,1,-4);
  matrix.rotate(55,1,0,0);
  matrix.rotate(45,0,1,0);
  matrix.scale(0.2,0.2,0.2);
  drawCube(gl,matrix,1,0,0);
  // left sphere
  matrix.setIdentity();
  matrix.translate(-0.82,1,1);
  matrix.scale(-0.5,-0.5,-0.5);
  drawSphere(gl,matrix,14/255,122/255,9/255);
  // right sphere
  matrix.setIdentity();
  matrix.translate(0.82,1,1);
  matrix.scale(-0.5,-0.5,-0.5);
  drawSphere(gl,matrix,0,0,1);
  //top sphere
  matrix.setIdentity();
  matrix.translate(0,1.85,1);
  matrix.scale(-0.5,-0.5,-0.5);
  drawSphere(gl,matrix,252/255,8/255,24/255);
  //bottom sphere
  matrix.setIdentity();
  matrix.translate(0,0.15,1);
  matrix.scale(-0.5,-0.5,-0.5);
  drawSphere(gl,matrix,252/255,248/255,8/255);

  var tempAngle = currentAngle;
  if (tempAngle > 45)
  {
   var tempAngle = 45 - (tempAngle - 45);
  }

  // body
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.scale(0.15, 0.15, 0.4);
  var n = drawCube(gl, matrix, 0.37,0.21,0.06);

  //neck
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0, 0.22, -0.34);
  matrix.rotate(45, 1, 0, 0);
  matrix.scale(0.05, 0.1, 0.2);
  n = drawCube(gl, matrix, 0.37,0.21,0.06);

  //upper head
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0, 0.32, -0.46);
  matrix.rotate(-45, 1, 0, 0);
  matrix.scale(0.08, 0.08, 0.1);
  n = drawCube(gl, matrix, 0.37,0.21,0.06);

  //snout
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0, 0.23, -0.57);
  matrix.rotate(-45, 1, 0, 0);
  matrix.scale(0.055, 0.065, 0.1);
  n = drawCube(gl, matrix, 0.37,0.21,0.06);

  // front left leg
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0.09, -0.15, -0.35);
  matrix.rotate(90, 1, 0, 0);
  matrix.scale(0.05, 0.05, 0.2);
  n = drawCube(gl, matrix, 0.37,0.21,0.06);

  // front right leg
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(-0.09, -0.15, -0.35);
  matrix.rotate(90, 1, 0, 0);
  matrix.scale(0.05, 0.05, 0.2);
  n = drawCube(gl, matrix, 0.37,0.21,0.06);

  // back right leg
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(-0.09, -0.15, 0.35);
  matrix.rotate(90, 1, 0, 0);
  matrix.scale(0.05, 0.05, 0.2);
  n = drawCube(gl, matrix, 0.37,0.21,0.06);

  // back left leg
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0.09, -0.15, 0.35);
  matrix.rotate(90, 1, 0, 0);
  matrix.scale(0.05, 0.05, 0.2);
  n = drawCube(gl, matrix, 0.37,0.21,0.06);

  // tail 1
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0.0, 0.08, 0.40);
  matrix.rotate(-tempAngle + 45, 1, 0, 0);
  matrix.translate(0.0, 0.0, 0.05);
  matrix.scale(0.04, 0.03, 0.12);
  n = drawCube(gl, matrix, 0.1, 0.1, 0.1);

  // tail 2
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0.0, 0.09, 0.43);
  matrix.rotate(-tempAngle, 1, 0, 0);
  matrix.translate(0.0,-0.1,0.11); 

  matrix.rotate(-tempAngle + 45, 1, 0, 0);
  matrix.rotate(-90, 1, 0, 0);
  matrix.translate(0.0,0.03,-0.15);
  matrix.scale(0.04, 0.03, 0.15);
  n = drawCube(gl, matrix, 0.1, 0.1, 0.1);

  // right eye
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0.07, 0.37, -0.49);
  matrix.scale(0.015, 0.015, 0.015);
  n = drawCube(gl, matrix, 1.0, 1.0, 1.0);

  // left eye
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(-0.07, 0.37, -0.49);
  matrix.scale(0.015, 0.015, 0.015);
  n = drawCube(gl, matrix, 1.0, 1.0, 1.0);

  // right iris
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(0.08, 0.37, -0.49);
  matrix.scale(0.009, 0.009, 0.009);
  n = drawCube(gl, matrix, 0.0, 0.0, 0.0);

  // left iris
  var matrix = new Matrix4();
  matrix.setIdentity();
  matrix.translate(-1.7,0,0);
  matrix.translate(-0.08, 0.37, -0.49);
  matrix.scale(0.009, 0.009, 0.009);
  n = drawCube(gl, matrix, 0.0, 0.0, 0.0);

}

function drawSphere(gl, matrix,r,g,b)
{
  // Get the storage locations of uniform variables
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the u_ModelMatrix storage location');
    return;
  }

  var modelMatrix = matrix;  // Model matrix

  // Calculate the model matrix
  // modelMatrix.setRotate(90, 0, 1, 0); // Rotate around the y-axis

  // Pass the model matrix to u_ModelMatrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  defUniforms(gl, modelMatrix);

  // Set the vertex coordinates and color
  var n = initSphereVertexBuffers(gl,r,g,b);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function drawCube1(gl,matrix,r,g,b)
{
  // Get the storage locations of uniform variables
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the u_ModelMatrix storage location');
    return;
  }

  var modelMatrix = matrix;  // Model matrix

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  defUniforms(gl, modelMatrix);

  // Set the vertex coordinates and color
  var n = initCubeVertexBuffers1(gl,r,g,b);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function drawCube(gl,matrix,r,g,b)
{
  // Get the storage locations of uniform variables
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the u_ModelMatrix storage location');
    return;
  }

  var modelMatrix = matrix;  // Model matrix

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  defUniforms(gl, modelMatrix);

  // Set the vertex coordinates and color
  var n = initCubeVertexBuffers(gl,r,g,b);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}


function defUniforms(gl, modelMatrix)
{
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  u_CameraPosition = gl.getUniformLocation(gl.program, 'u_CameraPosition');
  var u_LightSwitch = gl.getUniformLocation(gl.program, 'u_LightSwitch');
  var u_NormalVision = gl.getUniformLocation(gl.program, 'u_NormalVision');
  if (!u_NormalVision || !u_LightSwitch || !u_CameraPosition || !u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition　|| !u_AmbientLight) { 
    console.log('Failed to get the uniform storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, lightpos[0], lightpos[1], lightpos[2]);
  //Set the camera position
  gl.uniform3f(u_CameraPosition, eye[0], eye[1], eye[2]);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
  // Set the light switch
  gl.uniform1f(u_LightSwitch, onOff);
  // Set normal vision
  gl.uniform1f(u_NormalVision, normalVis);


  var mvpMatrix = new Matrix4();    // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, ASPECT_RATIO, 1, 100);
  mvpMatrix.lookAt(eye[0], eye[1], eye[2], at[0], at[1], at[2], up[0], up[1], up[2]);
  // mvpMatrix.multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
}


function updateMVP(gl)
{
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to get the u_MvpMatrix storage location');
    return;
  }
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, ASPECT_RATIO, 1, 100);
  mvpMatrix.lookAt(eye[0], eye[1], eye[2], at[0], at[1], at[2], up[0], up[1], up[2]);
  // mvpMatrix.multiply(modelMatrix);
  // Pass the model view projection matrix to u_mvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
}

function initSphereVertexBuffers(gl,r,g,b) { // Create a sphere
  var SPHERE_DIV = 13;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var indices   = [];
  var colors    = []

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z

      colors.push(r);
      colors.push(g);
      colors.push(b);
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3))  return -1;
  if (!initArrayBuffer(gl, 'a_Color', new Float32Array(colors), gl.FLOAT, 3))  return -1;
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initCubeVertexBuffers1(gl, r, g, b) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // Coordinates
  var vertices = new Float32Array([
     2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
     2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
     2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
    -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
     2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = new Float32Array([
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v0-v1-v2-v3 front(blue)
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v0-v3-v4-v5 right(green)
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v0-v5-v6-v1 up(red)
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v1-v6-v7-v2 left
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v7-v4-v3-v2 down
    r, g, b,  r, g, b,  r, g, b,  r, g, b,   // v4-v7-v6-v5 back
 ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3))  return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, gl.FLOAT, 3))  return -1;
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initCubeVertexBuffers(gl, r, g, b) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // Coordinates
  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = new Float32Array([
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v0-v1-v2-v3 front(blue)
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v0-v3-v4-v5 right(green)
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v0-v5-v6-v1 up(red)
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v1-v6-v7-v2 left
    r, g, b,  r, g, b,  r, g, b,  r, g, b,  // v7-v4-v3-v2 down
    r, g, b,  r, g, b,  r, g, b,  r, g, b,   // v4-v7-v6-v5 back
 ]);

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3))  return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, gl.FLOAT, 3))  return -1;
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function cross(a,b)
{
  var x = a[1]*b[2] - a[2]*b[1];
  var y = a[2]*b[0] - a[0]*b[2];
  var z = a[0]*b[1] - a[1]*b[0];

  return [x, y, z];
}

function normalize(a)
{
  var len = Math.sqrt((a[0] * a[0]) + (a[1]*a[1]) + (a[2]*a[2]));
  x = a[0]/len;
  y = a[1]/len;
  z = a[2]/len;

  return [x, y, z];
}

var eye = [0, 1, 6];
var at = [0, 1, 0];
var up = [0, 1, 0];
var right = [-1,0,6];
var lookAngle = 0;
var f = 0.1;
function keydown(ev, gl) 
{
  if(ev.keyCode == 65) {  // The A key was pressed
    eyeVec = [at[0]-eye[0],at[1]-eye[1],at[2]-eye[2]];
    orth = cross(eyeVec, up);
    norm = normalize(orth);
    moveX = norm[0]/5;
    moveZ = norm[2]/5;
    eye[0]    -= moveX;
    eye[2]    -= moveZ;
    at[0]     -= moveX;
    at[2]     -= moveZ;
  } else 
  if (ev.keyCode == 68) { // The D key was pressed
    eyeVec = [at[0]-eye[0],at[1]-eye[1],at[2]-eye[2]];
    orth = cross(eyeVec, up);
    norm = normalize(orth);
    moveX = norm[0]/5;
    moveZ = norm[2]/5;
    eye[0]    += moveX;
    eye[2]    += moveZ;
    at[0]     += moveX;
    at[2]     += moveZ;
  } else
  if(ev.keyCode == 87) {  // The W key was pressed
    // eye[2] -= 0.1;
    // at[2]  -= 0.1;
    // dX = eye[0] - at[0];
    // dZ = eye[2] - at[2];
    eyeVec = [at[0]-eye[0],at[1]-eye[1],at[2]-eye[2]];
    norm = normalize(eyeVec);
    moveX = norm[0]/5;
    moveZ = norm[2]/5;
    eye[0] += moveX;
    eye[2] += moveZ;
    at[0]  += moveX;
    at[2]  += moveZ;
  } else 
  if(ev.keyCode == 83) {  // The S key was pressed
    eyeVec = [at[0]-eye[0],at[1]-eye[1],at[2]-eye[2]];
    norm = normalize(eyeVec);
    moveX = norm[0]/5;
    moveZ = norm[2]/5;
    eye[0] -= moveX;
    eye[2] -= moveZ;
    at[0]  -= moveX;
    at[2]  -= moveZ;
  } else
  if(ev.keyCode == 69) {  // The E key was pressed
    lookAngle = (lookAngle - 0.08) % 360; 
    var radians = (Math.PI / 180) * lookAngle,
    cos = Math.cos(radians),
    sin = Math.sin(radians);
    at[0]    = (cos * (at[0] - eye[0])) + (sin * (at[2] - eye[2]));
    at[2]    = (cos * (at[2] - eye[2])) - (sin * (at[0] - eye[0]));
    right[0] = (cos * (right[0] - eye[0])) + (sin * (right[2] - eye[2]));
    right[2] = (cos * (right[2] - eye[2])) - (sin * (right[0] - eye[0]));
  } else 
  if(ev.keyCode == 81) {  // The Q key was pressed
    lookAngle = (lookAngle - 0.08) % 360; 
    var radians = (Math.PI / 180) * lookAngle,
    cos = Math.cos(radians),
    sin = Math.sin(radians);
    at[0] = (cos * (at[0] - eye[0])) - (sin * (at[2] - eye[2]));
    at[2] = (cos * (at[2] - eye[2])) + (sin * (at[0] - eye[0]));
    right[0] = (cos * (right[0] - eye[0])) - (sin * (right[2] - eye[2]));
    right[2] = (cos * (right[2] - eye[2])) + (sin * (right[0] - eye[0]));
  } else 
  if(ev.keyCode == 32) {  // The space key was pressed
    eye[1] += 0.1;
    at[1]  += 0.1;
  } else 
  if(ev.keyCode == 88) {  // The X key was pressed
    eye[1] -= 0.1;
    at[1]  -= 0.1;
  } else{ return; }
    
  updateMVP(gl);
}

let lightpos = [10.0, 0.0, 3.0];
let angle = 0;
// Last time that tthis function was called
var g_last = Date.now();
// Rotation angle (degrees/second)
var ANGLE_STEP = 30.0;

function updateLight()
{
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = (ANGLE_STEP * elapsed) / 1000.0;

  var radians = (Math.PI / 180) * newAngle,
  cos = Math.cos(radians),
  sin = Math.sin(radians),
  x = (cos * lightpos[0]) - (sin * lightpos[1]),
  y = (cos * lightpos[1]) + (sin * lightpos[0]);
  lightpos[0] = x;
  lightpos[1] = y;

  angle = newAngle%=360;
}

var currentAngle = 0.0;

var g_tail = Date.now();
function animate() {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_tail;
  g_tail = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = currentAngle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle%=90;
}

function update() 
{
  updateLight();
  currentAngle = animate();

  //Set the new camera position
  gl.uniform3f(u_CameraPosition, eye[0], eye[1], eye[2]);
  renderScene(gl);

  requestAnimationFrame(update);
}