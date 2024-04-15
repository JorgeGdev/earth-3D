import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'
import moonVertexShader from './shaders/moon/vertex.glsl'
import moonFragmentShader from './shaders/moon/fragment.glsl'




import {RGBELoader} from "three/addons/loaders/RGBELoader.js"




const rbgeLoader = new RGBELoader()




//HDR  - RBGE - EQUIRECTANGULAR

rbgeLoader.load("/environmentMaps/2/2k.hdr",
(environmentMap)=>
{
       environmentMap.mapping = THREE.EquirectangularReflectionMapping
    

   scene.environment = environmentMap
    scene.background = environmentMap

 } 
 )


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */

//COLOR TEXTURES ATMOSPHERE

const earthParameters = {}
earthParameters.atmosphereDayColor = "#00aaff"
earthParameters.atmosphereTwilightColor = "#ff6600"


//GUI

gui.addColor(earthParameters, "atmosphereDayColor")
.onChange(()=>
{
    earthMaterial.uniforms.UatmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
    atmosphereMaterial.uniforms.UatmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
})



gui.addColor(earthParameters, "atmosphereTwilightColor")
.onChange(()=>
{
    earthMaterial.uniforms.UatmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
    atmosphereMaterial.uniforms.UatmosphereDayColor.value.set(earthParameters.atmosphereTwilightColor)
})





//TEXTURES 
const earthDayTexture = textureLoader.load("./earth/day.jpg") 
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8


const earthNightTexture = textureLoader.load("./earth/night.jpg")  
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8

const earthSpecularCloudsTexture = textureLoader.load("./earth/specularClouds.jpg")  
earthSpecularCloudsTexture.anisotropy = 8

const moonDayTexture = textureLoader.load("./earth/moon.jpg") 
moonDayTexture.colorSpace = THREE.SRGBColorSpace
moonDayTexture.anisotropy = 8







// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uClouds: new THREE.Uniform(0.5),
        UatmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        UatmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)

scene.add(earth)



//ATMOSPHERE

const atmosphereMaterial = new THREE.ShaderMaterial({

    fragmentShader: atmosphereFragmentShader,
    vertexShader: atmosphereVertexShader,
    side: THREE.BackSide,
    transparent:true,
    uniforms:
    {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uClouds: new THREE.Uniform(0.5),
        UatmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        UatmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor))
    }
    



})

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
atmosphere.scale.set(1.04, 1.04, 1.04)

scene.add(atmosphere)


//MOON



var moongeometry = new THREE.SphereGeometry(5, 32, 32);

const moonMaterial = new THREE.ShaderMaterial({
    vertexShader: moonVertexShader,
    fragmentShader: moonFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(moonDayTexture),
        
        
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        
        
    }
})
const moon = new THREE.Mesh(moongeometry, moonMaterial)

moon.scale.set(0.15, 0.15, 0.15)
moon.position.x = -3
moon.position.z = 6
scene.add(moon);













//SUN

const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5)
const sunDirection = new THREE.Vector3()


//debug

const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
)

//scene.add(debugSun)



//UPDATE SUN

const updateSun = ()=>
{
    //sun direction
    sunDirection.setFromSpherical(sunSpherical)

    //debug

    debugSun.position
    .copy(sunDirection)
    .multiplyScalar(5)

    //uniforms

    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    moonMaterial.uniforms.uSunDirection.value.copy(sunDirection)

}

updateSun()


//TWEAKS

gui.add(sunSpherical, "phi").min(0).max(Math.PI).onChange(updateSun)
 
gui.add(sunSpherical, "theta").min(- Math.PI).max(Math.PI).onChange(updateSun)


//TWEAK FOR CLOUDS
gui.add(earthMaterial.uniforms.uClouds, "value").min(0.001).max(1.0).step(0.001).name("clouds")

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = -10
scene.add(camera)

// gui.add(camera.position, "x").min(-20).max(20).step(0.001)
// gui.add(camera.position, "y").min(-20).max(20).step(0.001)
// gui.add(camera.position, "z").min(-20).max(20).step(0.001)





// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')


const orbitRadius = 5; // Radio de la órbita
const orbitSpeed = 0.5; // Velocidad de la órbita





/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    earth.rotation.y = elapsedTime * 0.1


    moon.position.x = earth.position.x + orbitRadius * Math.cos(elapsedTime * orbitSpeed)
    moon.position.z = earth.position.z + orbitRadius * Math.sin(elapsedTime * orbitSpeed)
    moon.position.y = earth.position.z *0.5 + orbitRadius * Math.sin(elapsedTime * orbitSpeed)







    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()