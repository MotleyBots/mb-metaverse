
// Canvas

const canvasMain = document.querySelector('canvas.webgl')

// Scene

const scene = new THREE.Scene()

// Sizes - Manages Canvas Size Changes

const sizes = {
    width: window.innerWidth,
    height: 0.9 * window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = 0.9 * window.innerHeight

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

let room = new THREE.Object3D();
const cube = new THREE.BoxGeometry( 1, 1, 1 );                  // x, y, z
const cone = new THREE.ConeGeometry( .5, 1, 4 );                // r, h, rSeg, hSeg
const cylinder = new THREE.CylinderGeometry( .5, .5, 1, 16 );     // rTop, rBottom, h, rSeg, hSeg
const sphere = new THREE.SphereGeometry( .5, 20, 16 );           // r, rSeg, hSeg
const torus = new THREE.TorusGeometry( .4, 0.1, 16, 16 );        // r, tR, rSeg, tSeg
var shapeLength = 0;
var roomDNA = [];
var dnaList = [];
let lights = new THREE.Object3D();
var outputReady = false;

// Shape Presets



// Room Creation

function createRoom() {

    let [x,y,z] = [0,0,0]

    // Creates a lazily random configuration of blocks
    while (shapeLength < 12) {

        let type = Math.floor(Math.random() * 7);
        let rotation = Math.floor(Math.random() * 6);
        console.log(`type: ${type} rotation: ${rotation}`);
        let color = '#' + Math.floor(Math.random() * 255).toString(16) + Math.floor(Math.random() * 255).toString(16) + Math.floor(Math.random() * 255).toString(16);
        let emissive = Math.random();
        let roughness = Math.random();
        let metalness = Math.random();
        roomDNA.push(([ x, y, z, type, rotation, color, emissive, roughness, metalness]));
        let rand = Math.random();
        if(rand > .6666) {
            x++;
        } else if(rand > .3333) {
            y++;
        } else {
            z++;
        }
        shapeLength++;
    }
/*
    if (isDnaUnique(dnaList,roomDNA)) {
        dnaList.push(roomDNA);
    } else {
        resetShape();
    }
*/

    buildRoom( roomDNA );
    // console.log( roomDNA.length );

    // Moving shape components so that they are centered - Removed for room eventually

    let [shapeX, shapeY, shapeZ] = [((x)/2.0),((y)/2.0),((z)/2.0)];
    room.children.forEach(child => {
        child.translateX(-shapeX);
        child.translateY(-shapeY);
        child.translateZ(-shapeZ);
    });

    scene.add(room);

    // Calculating distance for Lights and Camera
    let radius = Math.sqrt(shapeX**2 + shapeZ**2);

    // Lights
    addLights(0xffffff, radius, shapeY);

    // Camera
    addCamera(radius, shapeY);

    // Action
    outputReady = true;

}

// Abstracting out the mesh constructor to work off 'DNA'

function buildRoom( roomDNA ) {                         // DNA: x, y, z, type, rotation
    roomDNA.forEach( ( meshInfo ) => {
        // console.log(meshInfo);
        addMesh(meshInfo[0], meshInfo[1], meshInfo[2], meshInfo[3], meshInfo[4], meshInfo[5] );
    });
}

// Adds a Cube to the Shape

function addMesh(x, y, z, type, rotation, color){
    let nextMesh = getMesh( type, rotation, color );
    if(nextMesh != null) {
        nextMesh.position.set(x,y,z);
        room.add(nextMesh)
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

const isDnaUnique = (_DnaList = [], _dna = []) => {
    let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
    return foundDna == undefined ? true : false;
};

// Clearing Objects and resetting for another object

function resetShape() {
    scene.clear();
    shape.clear();
    lights.clear();
    shapeLength = 0;
    shapeDNA = [];
    outputReady = false;
}

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

// Controls - HTML hookups
/*
const resetShapeButton = document.getElementById('resetShape')
resetShapeButton.addEventListener('click', e => resetShape() )

const glbDownloadButton = document.getElementById('downloadGLB')
glbDownloadButton.addEventListener('click', e => glbDownload() )

const pngDownloadButton = document.getElementById('downloadPNG')
pngDownloadButton.addEventListener('click', e => pngDownload() )
*/
// Download GLB

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

// Download PNG

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
// scene.fog = new THREE.Fog(#363636);  //later

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();

    // Create New Shape if there isn't one, 

    if( shapeLength == 0 && !outputReady ) {
        // console.log('attempting shape creation');
        createRoom();
    } 

    // Update objects

    room.rotation.y = .5 * elapsedTime;

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick()