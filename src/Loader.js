
// Canvas

const canvasMain = document.querySelector('canvas.webgl')

// Scene

const scene = new THREE.Scene()

// Sizes - Manages Canvas Size Changes

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvasMain,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor( 0xffffff, 0);

// Base camera 

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 2000)
camera.lookAt(0,0,0);

// Objects & Global Vars

let structure = new THREE.Object3D();
const cube = new THREE.BoxGeometry( 1, 1, 1 );                  // x, y, z
const cone = new THREE.ConeGeometry( .5, 1, 4 );                // r, h, rSeg, hSeg
const cylinder = new THREE.CylinderGeometry( .5, .5, 1, 16 );     // rTop, rBottom, h, rSeg, hSeg
const sphere = new THREE.SphereGeometry( .5, 20, 16 );           // r, rSeg, hSeg
const torus = new THREE.TorusGeometry( .4, 0.1, 16, 16 );        // r, tR, rSeg, tSeg
var shapeLength = 0;
var structureDNA = [];
var structureDNA = [];
var dnaList = [];
let lights = new THREE.Object3D();
var outputReady = false;

const degToRadConst = ( Math.PI/ 180 )

// Shape Presets

// Right Triangle
const rightTriangle = new THREE.Shape();

rightTriangle.moveTo( 0, 0 );
rightTriangle.lineTo( 0, 1 );
rightTriangle.lineTo( 1, 0 );
rightTriangle.closePath();

// Frame - rework to use .hole
const imageFrame = new THREE.Shape();

imageFrame.moveTo( 0, 0 );
imageFrame.lineTo( 1, 0 );
imageFrame.lineTo( 1, 1 );
imageFrame.lineTo( 0, 1 );
imageFrame.lineTo( 0, 0 );
imageFrame.moveTo( 0.1, 0.1 );
imageFrame.moveTo( 0.9, 0.1 );
imageFrame.moveTo( 0.9, 0.9 );
imageFrame.moveTo( 0.1, 0.9 );


/* Shape Testing
const extrudeSettings = { depth: 1, bevelEnabled: false };

const rightTriangleGeo = new THREE.ExtrudeGeometry( rightTriangle, extrudeSettings );
const rightTriangleMesh = new THREE.Mesh( rightTriangleGeo, new THREE.MeshBasicMaterial() );

const imageFrameGeo = new THREE.ExtrudeGeometry( imageFrame, extrudeSettings );
const imageFrameMesh = new THREE.Mesh( imageFrameGeo, new THREE.MeshBasicMaterial() );

scene.add( rightTriangleMesh );
scene.add( imageFrameMesh );
*/

// Island Creation

let island = new THREE.Object3D();
var islandDNA = [];

const islandGrass = new THREE.Shape();
const grassRadius = 12;
const grassVariance = 1.5;
const grassHeight = 0.1;
const grassDepth = 1;

const islandDirt = new THREE.Shape();
const dirtOffset = 1.5;
const dirtVariance = 1;
const dirtHeight = 0.5;
const dirtDepth = 10;

const islandStone = new THREE.Shape();
const stoneOffset = 0;
const stoneVariance = 2;
const stoneHeight = 10;
const stoneDepth = 100;

function createIsland() {

    // Shapes Method

    let x, y;

    // Drawing each shape
    for( a = 0; a < 360; a+=15 ){
        [ x, y ] = returnRandomPointOnCircle( grassRadius, grassVariance, a );
        drawIslandSegment( islandGrass, x, y, a );
        grassActual = Math.sqrt( x**2 + y**2 );
        [ x, y ] = returnRandomPointOnCircle( (grassActual + dirtOffset), dirtVariance, a );
        drawIslandSegment( islandDirt, x, y, a );
        dirtActual = Math.sqrt( x**2 + y**2 );
        [ x, y ] = returnRandomPointOnCircle( ( dirtActual + stoneOffset ), stoneVariance, a );
        drawIslandSegment( islandStone, x, y, a );
    }
    
    // Display centers at 0,0,0 this means a 0.5 height move is needed to not hide half the first layer of blocks
    const heightAdjust = -0.5;

    // Extruding each shape
    extrudeIslandSegment( islandGrass, grassDepth, 1, grassHeight, grassHeight, '#20cc25', heightAdjust );
    extrudeIslandSegment( islandDirt, dirtDepth, 4, ( dirtHeight / 2 ), dirtHeight, '#ccaa44', ( heightAdjust - dirtHeight + 0.01 /* prevents clipping */ ) );
    extrudeIslandSegment( islandStone, stoneDepth, 3, ( stoneHeight / 4 ), stoneHeight, '#bbbbbb', ( heightAdjust - stoneHeight ) );

    outputReady = true;

    addLights(0xffffff, grassRadius*1.2, 2);

    addCamera( grassRadius*1.5, 24);

    scene.add(island);

}

function returnRandomPointOnCircle( radius, variance, angle ) {
    let x = ( radius + ( variance * Math.random() ) ) * Math.sin( ( a * degToRadConst ) );
    let y = ( radius + ( variance * Math.random() ) ) * Math.cos( ( a * degToRadConst ) );
    return [ x, y ];
}

function drawIslandSegment( shape, x, y, angle ) {
    if( angle == 0 ) {
        shape.moveTo( x, y);
    }
    shape.lineTo( x, y );
}

function extrudeIslandSegment( shape, shapeDepth, bevelSegments, bevelSize, bevelThickness, color, heightAdjust ) {
    const extrudeSettings = { depth: shapeDepth, bevelEnabled: true, bevelSegments: bevelSegments, steps: 1, bevelSize: bevelSize, bevelThickness: bevelThickness };

    const shapeGeo = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    shapeGeo.rotateX( 1.570796 );
    const shapeMesh = new THREE.Mesh( shapeGeo, new THREE.MeshStandardMaterial( { color: color } ) );
    shapeMesh.translateY( heightAdjust );
    island.add( shapeMesh );
}

// structure Creation

function createStructure( structureDNA ) {

    buildStructure( structureDNA );
    // console.log( structureDNA.length );

    // Moving shape components so that they are centered - Removed for structure eventually

    scene.add(structure);

    // Calculating distance for Lights and Camera
    let radius = Math.sqrt(shapeX**2 + shapeZ**2);

    // Lights
    // addLights(0xffffff, radius, shapeY);

    // Camera
    // addCamera(radius, shapeY);

    // Action
    outputReady = true;

}


// Abstracting out the mesh constructor to work off 'DNA'

function buildStructure( structureDNA ) {                         // DNA: x, y, z, type, rotation, color, emmissiveIntensity
    structureDNA.forEach( ( meshInfo ) => {
        addMesh(meshInfo[0], meshInfo[1], meshInfo[2], meshInfo[3], meshInfo[4], meshInfo[5], meshInfo[6] );
    });
}

// Adds a Cube to the Shape

function addMesh(x, y, z, type, rotation, color, emmissiveIntensity){
    let nextMesh = getMesh( type, rotation, color );
    if(nextMesh != null) {
        nextMesh.position.set(x,y,z);
        structure.add(nextMesh)
    }
}

function getMesh( type, rotation, color = '#00ffff', emissive = 1, roughness = 1, metalness = 0 ) {
    let tempGeometry = setBaseMesh( type );
    setMeshRotation( tempGeometry, rotation );
    let tempMaterial = setMaterial( color, emissive, roughness, metalness );
    return new THREE.Mesh(tempGeometry, tempMaterial);
}

// Returns base mesh geometry
function setBaseMesh(type){
    switch (type) {
        case 0:             // 1x1 Cube
            return new THREE.BoxGeometry( 1, 1, 1 );                                        // x, y, z
        case 1:             // 1x1 Pyramid
            return new THREE.ConeGeometry( 0.707106, 1, 4, 1, false, 0.7853982 );           // r, h, rSeg, hSeg
        case 2:             // Flat-top Half Pyramid
            return new THREE.CylinderGeometry( 0.707106, 0.353553, 1, 4, 1, false, 0.7853982 );         // rTop, rBottom, h, rSeg, hSeg
        case 3:             // .5x1 Rectangle
            return new THREE.BoxGeometry( 0.5, 0.5, 1 );                                        // x, y, z
        case 4:             // 1x1 Cylinder
            return new THREE.CylinderGeometry( 0.5, 0.5, 1, 8 );         // rTop, rBottom, h, rSeg, hSeg
        case 5:             // .5x1 Pyramid
            return new THREE.ConeGeometry( 0.353553, 1, 4, 1, false, 0.7853982 );           // r, h, rSeg, hSeg
        default:            // Empty
            return new THREE.BoxGeometry( 0, 0, 0);                     
    }
}

// Rotates base mesh geometry 
function setMeshRotation( mesh, rotation ) {
    switch (rotation) {
        case 0:
            mesh.rotateX(1.570796);
            return;
        case 1:
            mesh.rotateX(-1.570796);
            return;
        case 2:
            mesh.rotateY(1.570796);
            return;
        case 3:
            mesh.rotateY(-1.570796);
            return;
        case 4:
            mesh.rotateZ(1.570796);
            return;
        default:
            mesh.rotateZ(-1.570796);
            return;
    }
}

// Returns material
function setMaterial( color, emissive, roughness, metalness ) {
    let tempMaterial = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: emissive,
        roughness: roughness,
        metalness: metalness,
        flatShading: true
    });

    return tempMaterial;
}

// Checks if unique - Not really used, as list is reset on load.  Would only be useful if a DNA List was maintained. Credit Hashlips
/*
const isDnaUnique = (_DnaList = [], _dna = []) => {
    let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
    return foundDna == undefined ? true : false;
};
*/
// Clearing Objects and resetting for another object
/*
function resetShape() {
    scene.clear();
    shape.clear();
    lights.clear();
    shapeLength = 0;
    shapeDNA = [];
    outputReady = false;
}
*/
// Positions and adds lights to scene based on object dimensions, includes color option, but currently isn't used.
function addLights(color, radius, height) { // Intensity calcs are somewhat frivolous.
    let lightColor = color;
    let lightIntensity = 0.05 * Math.abs( 12 - radius  );
    let lightX = 1 + radius;
    let lightY = 1 + ( height / 2 );
    let lightZ = 1 + radius;
    let topLightColor = color;
    let topLightIntensity = 0.05 * Math.abs( 12 - height ) ;
    let topLightY = 2 + height;

    let pointLight1 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight1.position.set(lightX, lightY, lightZ);
    let pointLight2 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight2.position.set(-lightX, lightY, -lightZ);
    let pointLight3 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight3.position.set(lightX, lightY, -lightZ);
    let pointLight4 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight4.position.set(-lightX, lightY, lightZ);

    let topLight = new THREE.PointLight(topLightColor, topLightIntensity);
    topLight.position.set(0, topLightY,0);

    lights.add(pointLight1);
    lights.add(pointLight2);
    lights.add(pointLight3);
    lights.add(pointLight4);
    lights.add(topLight);

    scene.add(lights);
}

// Positions and adds camera
function addCamera(radius, height) {
    camera.position.set(0,( 4 + ( height / 12 ) ),( 8 + radius ));
    camera.lookAt(0,0,0);
    scene.add(camera);
}

// Controls

var islandRotate = false;

document.addEventListener('keydown', (e) => OnKeyDown_(e), false);
document.addEventListener('keyup', (e) => OnKeyUp_(e), false);

var forward, left, right, backward = false;

function OnKeyDown_(event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        forward = true;
        break;
      case 37: // left
      case 65: // a
        left = true;
        break;
      case 40: // down
      case 83: // s
        backward = true;
        break;
      case 39: // right
      case 68: // d
        right = true;
        break;
    }
}

function OnKeyUp_(event) {
    switch(event.keyCode) {
      case 38: // up
      case 87: // w
        forward = false;
        break;
      case 37: // left
      case 65: // a
        left = false;
        break;
      case 40: // down
      case 83: // s
        backward = false;
        break;
      case 39: // right
      case 68: // d
        right = false;
        break;
    }
  }


// Controls - HTML hookups
/*
const resetShapeButton = document.getElementById('resetShape')
resetShapeButton.addEventListener('click', e => resetShape() )

const glbDownloadButton = document.getElementById('downloadGLB')
glbDownloadButton.addEventListener('click', e => glbDownload() )

const pngDownloadButton = document.getElementById('downloadPNG')
pngDownloadButton.addEventListener('click', e => pngDownload() )
*/
// Download GLB - Not used currently may implement later.

function glbDownload() {
    const exporter = new GLTFExporter();
    exporter.parse(
        scene,
        function(result) {
            saveArrayBuffer(result, `Shape-${shapeDNA.toString()}.glb`)
        },
        {
            binary: true
        }
    )
}

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

function saveArrayBuffer(buffer, fileName) {
    save(new Blob([buffer], {type: 'application/octet-stream'}), fileName);
}

function save(blob, fileName) {
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

// Download PNG - Not used currently may implement later.

function pngDownload() {

    renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
    	var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `Shape-${shapeDNA.toString()}.png`;
      a.click();
    }, 'image/png', 1.0);
}

// Animate

const clock = new THREE.Clock();
scene.fog = new THREE.Fog( '#aaaaaa', 8, 80 );

var sceneBuilt = false;

const worldAxis = new THREE.Vector3( 0, 1, 0);

var verticalVelocity = 0.0;
var rotationVelocity = 0.0;

// Keystrokes to movement
function updateCamera( elapsedTime ) {
    if( 0.5 >= Math.abs(verticalVelocity) ) {
        if ( forward ) {
            verticalVelocity += 0.0005 * elapsedTime;
        } else if ( backward ) {
            verticalVelocity -= 0.0005 * elapsedTime;
        } else {
            verticalVelocity = verticalVelocity * 0.8;
        }
    } else {
        verticalVelocity = verticalVelocity * 0.8;
    }
    if( 0.05 >= Math.abs(rotationVelocity) ) {
        if ( left ) {
            rotationVelocity += 0.00005 * elapsedTime;
        } else if ( right ) {
            rotationVelocity -= 0.00005 * elapsedTime;
        } else {
            rotationVelocity = rotationVelocity * 0.8;
        }
    } else {
        rotationVelocity = rotationVelocity * 0.8;
    }
}

// Scene Debug
/*
const box = new THREE.BoxGeometry(1,1,1);
const boxMesh = new THREE.Mesh( box, new THREE.MeshBasicMaterial( {color: '#00FF00'} ));
scene.add(boxMesh);
*/

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();

    // Create Island

    if( !outputReady ) {
        createIsland();
    }

    // Create New Shape if there isn't one, 
/*
    if( shapeLength == 0 && outputReady ) {
        // console.log('attempting shape creation');
        createStructure();
    } 
*/
    // Update objects
/*
    if(islandRotate){
    // Structure.rotation.y = .25 * elapsedTime;
        island.rotation.y = .1 * elapsedTime;
    }
*/
    // Controls

    updateCamera( elapsedTime );
    camera.translateY( verticalVelocity );
    island.rotateOnWorldAxis( worldAxis, rotationVelocity );

    // controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick()