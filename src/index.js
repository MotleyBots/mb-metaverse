

// Sizes

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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 1000 );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( sizes.width, sizes.height );
document.body.appendChild( renderer.domElement );

function animate() {
	requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();