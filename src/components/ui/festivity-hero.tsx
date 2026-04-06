'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Gummy candy colors — translucent, vibrant
const GUMMY_COLORS = [
  '#e74c3c', // red
  '#f39c12', // orange
  '#f1c40f', // yellow
  '#2ecc71', // green
  '#1abc9c', // teal
  '#9b59b6', // purple
  '#e91e63', // pink
  '#ff6f00', // amber
  '#00bcd4', // cyan
  '#8bc34a', // lime
]

const Component = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loadingCompleteRef = useRef(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const initThreeJS = () => {
      const scene = new THREE.Scene()

      const camera = new THREE.PerspectiveCamera(
        25,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.z = 24

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        antialias: true,
        alpha: true
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // Camera drag controls
      let isMouseDown = false
      let mouseX = 0
      let mouseY = 0
      let targetRotationX = 0
      let targetRotationY = 0
      let rotationX = 0
      let rotationY = 0

      const onMouseDown = (event: MouseEvent) => {
        isMouseDown = true
        mouseX = event.clientX
        mouseY = event.clientY
      }
      const onMouseUp = () => { isMouseDown = false }
      const onMouseMove = (event: MouseEvent) => {
        if (isMouseDown) {
          targetRotationY += (event.clientX - mouseX) * 0.01
          targetRotationX += (event.clientY - mouseY) * 0.01
          mouseX = event.clientX
          mouseY = event.clientY
        }
      }

      window.addEventListener('mousedown', onMouseDown)
      window.addEventListener('mouseup', onMouseUp)
      window.addEventListener('mousemove', onMouseMove)

      // Gummy sphere data
      const radii = [1, 0.6, 0.8, 0.4, 0.9, 0.7, 0.9, 0.3, 0.2, 0.5, 0.6, 0.4, 0.5, 0.6, 0.7, 0.3, 0.4, 0.8, 0.7, 0.5, 0.4, 0.6, 0.35, 0.38, 0.9, 0.3, 0.6, 0.4, 0.2, 0.35, 0.5, 0.15, 0.2, 0.25, 0.4, 0.8, 0.76, 0.8, 1, 0.8, 0.7, 0.8, 0.3, 0.5, 0.6, 0.55, 0.42, 0.75, 0.66, 0.6, 0.7, 0.5, 0.6, 0.35, 0.35, 0.35, 0.8, 0.6, 0.7, 0.8, 0.4, 0.89, 0.3, 0.3, 0.6, 0.4, 0.2, 0.52, 0.5, 0.15, 0.2, 0.25, 0.4, 0.8, 0.76, 0.8, 1, 0.8, 0.7, 0.8, 0.3, 0.5, 0.6, 0.8, 0.7, 0.75, 0.66, 0.6, 0.7, 0.5, 0.6, 0.35, 0.35, 0.35, 0.8, 0.6, 0.7, 0.8, 0.4, 0.89, 0.3]

      const positions = [
        { x: 0, y: 0, z: 0 },
        { x: 1.2, y: 0.9, z: -0.5 },
        { x: 1.8, y: -0.3, z: 0 },
        { x: -1, y: -1, z: 0 },
        { x: -1, y: 1.62, z: 0 },
        { x: -1.65, y: 0, z: -0.4 },
        { x: -2.13, y: -1.54, z: -0.4 },
        { x: 0.8, y: 0.94, z: 0.3 },
        { x: 0.5, y: -1, z: 1.2 },
        { x: -0.16, y: -1.2, z: 0.9 },
        { x: 1.5, y: 1.2, z: 0.8 },
        { x: 0.5, y: -1.58, z: 1.4 },
        { x: -1.5, y: 1, z: 1.15 },
        { x: -1.5, y: -1.5, z: 0.99 },
        { x: -1.5, y: -1.5, z: -1.9 },
        { x: 1.85, y: 0.8, z: 0.05 },
        { x: 1.5, y: -1.2, z: -0.75 },
        { x: 0.9, y: -1.62, z: 0.22 },
        { x: 0.45, y: 2, z: 0.65 },
        { x: 2.5, y: 1.22, z: -0.2 },
        { x: 2.35, y: 0.7, z: 0.55 },
        { x: -1.8, y: -0.35, z: 0.85 },
        { x: -1.02, y: 0.2, z: 0.9 },
        { x: 0.2, y: 1, z: 1 },
        { x: -2.88, y: 0.7, z: 1 },
        { x: -2, y: -0.95, z: 1.5 },
        { x: -2.3, y: 2.4, z: -0.1 },
        { x: -2.5, y: 1.9, z: 1.2 },
        { x: -1.8, y: 0.37, z: 1.2 },
        { x: -2.4, y: 1.42, z: 0.05 },
        { x: -2.72, y: -0.9, z: 1.1 },
        { x: -1.8, y: -1.34, z: 1.67 },
        { x: -1.6, y: 1.66, z: 0.91 },
        { x: -2.8, y: 1.58, z: 1.69 },
        { x: -2.97, y: 2.3, z: 0.65 },
        { x: 1.1, y: -0.2, z: -1.45 },
        { x: -4, y: 1.78, z: 0.38 },
        { x: 0.12, y: 1.4, z: -1.29 },
        { x: -1.64, y: 1.4, z: -1.79 },
        { x: -3.5, y: -0.58, z: 0.1 },
        { x: -0.1, y: -1, z: -2 },
        { x: -4.5, y: 0.55, z: -0.5 },
        { x: -3.87, y: 0, z: 1 },
        { x: -4.6, y: -0.1, z: 0.65 },
        { x: -3, y: 1.5, z: -0.7 },
        { x: -0.5, y: 0.2, z: -1.5 },
        { x: -1.3, y: -0.45, z: -1.5 },
        { x: -3.35, y: 0.25, z: -1.5 },
        { x: -4.76, y: -1.26, z: 0.4 },
        { x: -4.32, y: 0.85, z: 1.4 },
        { x: -3.5, y: -1.82, z: 0.9 },
        { x: -3.6, y: -0.6, z: 1.46 },
        { x: -4.55, y: -1.5, z: 1.63 },
        { x: -3.8, y: -1.15, z: 2.1 },
        { x: -2.9, y: -0.25, z: 1.86 },
        { x: -2.2, y: -0.4, z: 1.86 },
        { x: -5.1, y: -0.24, z: 1.86 },
        { x: -5.27, y: 1.24, z: 0.76 },
        { x: -5.27, y: 2, z: -0.4 },
        { x: -6.4, y: 0.4, z: 1 },
        { x: -5.15, y: 0.95, z: 2 },
        { x: -6.2, y: 0.5, z: -0.8 },
        { x: -4, y: 0.08, z: 1.8 },
        { x: 2, y: -0.95, z: 1.5 },
        { x: 2.3, y: 2.4, z: -0.1 },
        { x: 2.5, y: 1.9, z: 1.2 },
        { x: 1.8, y: 0.37, z: 1.2 },
        { x: 3.24, y: 0.6, z: 1.05 },
        { x: 2.72, y: -0.9, z: 1.1 },
        { x: 1.8, y: -1.34, z: 1.67 },
        { x: 1.6, y: 1.99, z: 0.91 },
        { x: 2.8, y: 1.58, z: 1.69 },
        { x: 2.97, y: 2.3, z: 0.65 },
        { x: -1.3, y: -0.2, z: -2.5 },
        { x: 4, y: 1.78, z: 0.38 },
        { x: 1.72, y: 1.4, z: -1.29 },
        { x: 2.5, y: -1.2, z: -2 },
        { x: 3.5, y: -0.58, z: 0.1 },
        { x: 0.1, y: 0.4, z: -2.42 },
        { x: 4.5, y: 0.55, z: -0.5 },
        { x: 3.87, y: 0, z: 1 },
        { x: 4.6, y: -0.1, z: 0.65 },
        { x: 3, y: 1.5, z: -0.7 },
        { x: 2.3, y: 0.6, z: -2.6 },
        { x: 4, y: 1.5, z: -1.6 },
        { x: 3.35, y: 0.25, z: -1.5 },
        { x: 4.76, y: -1.26, z: 0.4 },
        { x: 4.32, y: 0.85, z: 1.4 },
        { x: 3.5, y: -1.82, z: 0.9 },
        { x: 3.6, y: -0.6, z: 1.46 },
        { x: 4.55, y: -1.5, z: 1.63 },
        { x: 3.8, y: -1.15, z: 2.1 },
        { x: 2.9, y: -0.25, z: 1.86 },
        { x: 2.2, y: -0.4, z: 1.86 },
        { x: 5.1, y: -0.24, z: 1.86 },
        { x: 5.27, y: 1.24, z: 0.76 },
        { x: 5.27, y: 2, z: -0.4 },
        { x: 6.4, y: 0.4, z: 1 },
        { x: 5.15, y: 0.95, z: 2 },
        { x: 6.2, y: 0.5, z: -0.8 },
        { x: 4, y: 0.08, z: 1.8 }
      ]

      // Create gummy materials with translucent candy look
      const gummyMaterials = GUMMY_COLORS.map(color => {
        return new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.25,
          metalness: 0,
          transmission: 0.3,
          thickness: 1.5,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          emissive: new THREE.Color(color).multiplyScalar(0.15),
        })
      })

      const group = new THREE.Group()
      const spheres: THREE.Mesh[] = []
      const forces = new Map<string, THREE.Vector3>()

      positions.forEach((pos, index) => {
        const radius = radii[index]
        // Gummy shape: squashed sphere (wider than tall)
        const geometry = new THREE.SphereGeometry(radius, 32, 32)
        geometry.scale(1, 0.7, 1) // flatten to gummy bear proportions

        const material = gummyMaterials[index % gummyMaterials.length]
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(pos.x, pos.y, pos.z)
        // Random rotation for variety
        sphere.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
        sphere.userData = { originalPosition: { ...pos }, radius }
        sphere.castShadow = true
        sphere.receiveShadow = true
        spheres.push(sphere)
        group.add(sphere)
      })

      scene.add(group)

      // Lighting — warm, candy-shop feel
      const ambientLight = new THREE.AmbientLight(0xfff5e6, 1.2)
      scene.add(ambientLight)

      const spotLight = new THREE.SpotLight(0xffffff, 0.6)
      spotLight.position.set(14, 24, 30)
      spotLight.castShadow = true
      scene.add(spotLight)

      const fillLight = new THREE.DirectionalLight(0xffe0c0, 0.4)
      fillLight.position.set(-10, -4, 5)
      scene.add(fillLight)

      const rimLight = new THREE.DirectionalLight(0xc0e0ff, 0.3)
      rimLight.position.set(0, 10, -15)
      scene.add(rimLight)

      // Animation helpers
      const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

      const animateValue = (obj: Record<string, number>, prop: string, start: number, end: number, duration: number, delay = 0) => {
        setTimeout(() => {
          const startTime = Date.now()
          const tick = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            obj[prop] = start + (end - start) * eased
            if (progress < 1) requestAnimationFrame(tick)
          }
          tick()
        }, delay)
      }

      // Raycaster for hover interaction
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      const tempVector = new THREE.Vector3()
      const initY = -25
      const revolutionRadius = 4
      const revolutionDuration = 2
      const breathingAmplitude = 0.1
      const breathingSpeed = 0.002

      // Start below screen
      spheres.forEach(s => { s.position.y = initY })

      // Loading animation
      const initLoadingAnimation = () => {
        spheres.forEach((sphere, i) => {
          const delay = i * 20
          const pos = sphere.position as unknown as Record<string, number>
          animateValue(pos, 'y', initY, revolutionRadius, revolutionDuration * 500, delay)
          setTimeout(() => {
            animateValue(pos, 'y', revolutionRadius, initY / 5, revolutionDuration * 500)
          }, delay + revolutionDuration * 500)
          setTimeout(() => {
            animateValue(pos, 'x', sphere.position.x, sphere.userData.originalPosition.x, 600)
            animateValue(pos, 'y', sphere.position.y, sphere.userData.originalPosition.y, 600)
            animateValue(pos, 'z', sphere.position.z, sphere.userData.originalPosition.z, 600)
          }, delay + revolutionDuration * 1000)
        })
      }

      const onMouseMoveInteraction = (event: MouseEvent) => {
        if (!loadingCompleteRef.current) return
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(spheres)
        if (intersects.length > 0) {
          const hoveredSphere = intersects[0].object as THREE.Mesh
          const force = new THREE.Vector3()
          force.subVectors(intersects[0].point, hoveredSphere.position).normalize().multiplyScalar(0.2)
          forces.set(hoveredSphere.uuid, force)
        }
      }

      const handleCollisions = () => {
        for (let i = 0; i < spheres.length; i++) {
          const sphereA = spheres[i]
          const radiusA = sphereA.userData.radius
          for (let j = i + 1; j < spheres.length; j++) {
            const sphereB = spheres[j]
            const radiusB = sphereB.userData.radius
            const distance = sphereA.position.distanceTo(sphereB.position)
            const minDistance = (radiusA + radiusB) * 1.2
            if (distance < minDistance) {
              tempVector.subVectors(sphereB.position, sphereA.position).normalize()
              const pushStrength = (minDistance - distance) * 0.4
              sphereA.position.sub(tempVector.clone().multiplyScalar(pushStrength))
              sphereB.position.add(tempVector.clone().multiplyScalar(pushStrength))
            }
          }
        }
      }

      // Main loop
      const animate = () => {
        requestAnimationFrame(animate)

        rotationX = lerp(rotationX, targetRotationX, 0.05)
        rotationY = lerp(rotationY, targetRotationY, 0.05)
        camera.position.x = Math.sin(rotationY) * 24
        camera.position.z = Math.cos(rotationY) * 24
        camera.position.y = Math.sin(rotationX) * 10
        camera.lookAt(0, 0, 0)

        if (loadingCompleteRef.current) {
          const time = Date.now() * breathingSpeed
          spheres.forEach((sphere, i) => {
            const offset = i * 0.2
            const breathingY = Math.sin(time + offset) * breathingAmplitude
            const breathingZ = Math.cos(time + offset) * breathingAmplitude * 0.5

            const force = forces.get(sphere.uuid)
            if (force) {
              sphere.position.add(force)
              force.multiplyScalar(0.95)
              if (force.length() < 0.01) forces.delete(sphere.uuid)
            }

            const originalPos = sphere.userData.originalPosition
            tempVector.set(originalPos.x, originalPos.y + breathingY, originalPos.z + breathingZ)
            sphere.position.lerp(tempVector, 0.018)

            // Slow gentle rotation for each gummy
            sphere.rotation.x += 0.001 * (i % 3 === 0 ? 1 : -1)
            sphere.rotation.y += 0.0008 * (i % 2 === 0 ? 1 : -1)
          })
          handleCollisions()
        }
        renderer.render(scene, camera)
      }

      window.addEventListener("mousemove", onMouseMoveInteraction)

      // Start loading animation immediately
      initLoadingAnimation()

      setTimeout(() => {
        loadingCompleteRef.current = true
        const hiddenElements = document.querySelectorAll(".hide-text")
        const mainTxt = document.querySelector(".main-txt") as HTMLElement
        hiddenElements.forEach(el => { (el as HTMLElement).style.opacity = "1" })
        if (mainTxt) mainTxt.style.opacity = "0"
      }, (revolutionDuration + 1) * 1000)

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener("resize", handleResize)

      animate()

      return () => {
        window.removeEventListener("mousemove", onMouseMoveInteraction)
        window.removeEventListener("mousedown", onMouseDown)
        window.removeEventListener("mouseup", onMouseUp)
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("resize", handleResize)
        renderer.dispose()
      }
    }

    const cleanup = initThreeJS()
    return () => { cleanup?.() }
  }, [])

  return <canvas ref={canvasRef} className="webgl" id="webgl" />
}

export default Component
