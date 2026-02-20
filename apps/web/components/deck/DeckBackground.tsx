'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function DeckBackground() {
    const mountRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!mountRef.current) return

        const mount = mountRef.current
        const W = mount.clientWidth
        const H = mount.clientHeight

        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000)
        camera.position.set(0, 0, 80)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(W, H)
        renderer.setClearColor(0x000000, 0)
        mount.appendChild(renderer.domElement)

        // Particle field
        const particleCount = 600
        const positions = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)

        const yellow = new THREE.Color(0xfcee0a)
        const cyan = new THREE.Color(0x00f0ff)
        const pink = new THREE.Color(0xff00ff)
        const palette = [yellow, cyan, pink]

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 300
            positions[i * 3 + 1] = (Math.random() - 0.5) * 300
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200
            const c = palette[Math.floor(Math.random() * palette.length)]
            colors[i * 3] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b
        }

        const pGeo = new THREE.BufferGeometry()
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const pMat = new THREE.PointsMaterial({
            size: 0.6,
            vertexColors: true,
            transparent: true,
            opacity: 1, // reduced from 0.55
            sizeAttenuation: true,
        })

        const particles = new THREE.Points(pGeo, pMat)
        scene.add(particles)

        // Floating wireframe cubes
        const cubes: THREE.Mesh[] = []
        const cubeColors = [0xfcee0a, 0x00f0ff, 0xff00ff]
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.BoxGeometry(
                4 + Math.random() * 6,
                4 + Math.random() * 6,
                4 + Math.random() * 6
            )
            const mat = new THREE.MeshBasicMaterial({
                color: cubeColors[i % cubeColors.length],
                wireframe: true,
                transparent: true,
                opacity: 0.05 + Math.random() * 0.05, // reduced from 0.08
            })
            const cube = new THREE.Mesh(geo, mat)
            cube.position.set(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 60 - 40
            )
            scene.add(cube)
            cubes.push(cube)
        }

        // Grid plane
        const gridHelper = new THREE.GridHelper(400, 40, 0xfcee0a, 0xfcee0a)
            ; (gridHelper.material as THREE.Material).transparent = true
            ; (gridHelper.material as THREE.Material).opacity = 0.02 // reduced from 0.04
        gridHelper.rotation.x = Math.PI / 2
        gridHelper.position.z = -50
        scene.add(gridHelper)

        // Scroll-linked tilt
        let scrollProgress = 0
        const onScroll = () => {
            const totalH = document.documentElement.scrollHeight - window.innerHeight
            scrollProgress = totalH > 0 ? window.scrollY / totalH : 0
        }
        window.addEventListener('scroll', onScroll, { passive: true })

        // Resize
        const onResize = () => {
            const w = mount.clientWidth
            const h = mount.clientHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }
        window.addEventListener('resize', onResize)

        // Animation loop
        let rafId: number
        const clock = new THREE.Clock()

        const animate = () => {
            rafId = requestAnimationFrame(animate)
            const t = clock.getElapsedTime()

            particles.rotation.y = t * 0.012
            particles.rotation.x = t * 0.006

            cubes.forEach((c, i) => {
                c.rotation.x = t * 0.1 * (i % 2 === 0 ? 1 : -1)
                c.rotation.y = t * 0.08 * (i % 3 === 0 ? 1 : -1)
                c.rotation.z = t * 0.05
            })

            // Subtle camera drift based on scroll
            camera.position.y = scrollProgress * -20
            camera.rotation.z = scrollProgress * 0.04

            renderer.render(scene, camera)
        }
        animate()

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            // clean up DOM
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement)
            }
        }
    }, [])

    return (
        <div
            ref={mountRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 blur-sm" // Added opacity-40 and blur-sm
            aria-hidden
        />
    )
}
