"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null
    uniforms: Record<string, { value: number | number[] }> | null
    animId: number | null
  }>({ renderer: null, uniforms: null, animId: null })

  useEffect(() => {
    if (!canvasRef.current) return
    const s = stateRef.current
    const canvas = canvasRef.current

    const vert = `
      attribute vec3 position;
      void main() { gl_Position = vec4(position, 1.0); }
    `
    // Six sinusoidal glow strips — teal / blue / green, each with distinct
    // frequency, amplitude, speed and phase so they drift independently.
    const frag = `
      precision highp float;
      uniform vec2  resolution;
      uniform float time;

      float glow(float dy) {
        return 0.022 / (dy * dy + 0.0008);
      }

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        vec3 col = vec3(0.0);

        // Strip 1 — teal, upper
        float w1 = p.y - 0.55
          + sin(p.x * 0.90 + time * 0.50        ) * 0.18
          + cos(p.x * 1.70 + time * 0.30        ) * 0.07;
        col += vec3(0.176, 0.831, 0.749) * glow(w1);

        // Strip 2 — blue, upper-mid
        float w2 = p.y - 0.22
          + sin(p.x * 1.20 + time * 0.70 + 1.20 ) * 0.21
          + sin(p.x * 0.50 + time * 0.40        ) * 0.09;
        col += vec3(0.376, 0.647, 0.980) * glow(w2);

        // Strip 3 — green, centre
        float w3 = p.y + 0.06
          + sin(p.x * 0.70 + time * 0.40 + 2.40 ) * 0.22
          + cos(p.x * 1.30 + time * 0.60        ) * 0.07;
        col += vec3(0.204, 0.831, 0.600) * glow(w3);

        // Strip 4 — teal (60 % brightness), lower-mid
        float w4 = p.y + 0.36
          + sin(p.x * 1.10 + time * 0.60 + 3.60 ) * 0.17
          + sin(p.x * 0.80 + time * 0.50        ) * 0.08;
        col += vec3(0.176, 0.831, 0.749) * glow(w4) * 0.60;

        // Strip 5 — blue (50 % brightness), near bottom
        float w5 = p.y + 0.62
          + sin(p.x * 0.60 + time * 0.80 + 4.80 ) * 0.18
          + cos(p.x * 1.40 + time * 0.30        ) * 0.08;
        col += vec3(0.376, 0.647, 0.980) * glow(w5) * 0.50;

        // Strip 6 — green (40 % brightness), bottom
        float w6 = p.y + 0.84
          + sin(p.x * 1.30 + time * 0.30 + 6.00 ) * 0.15
          + sin(p.x * 0.90 + time * 0.70        ) * 0.09;
        col += vec3(0.204, 0.831, 0.600) * glow(w6) * 0.40;

        // Tone-map to kill blow-out, keep mid-tones punchy
        col = col / (col + 0.55);

        // Vignette — darken edges so text over the hero stays legible
        float vign = 1.0 - smoothstep(0.45, 1.30, length(p) * 0.85);
        col *= vign * 0.90;

        gl_FragColor = vec4(col, 1.0);
      }
    `

    const scene    = new THREE.Scene()
    s.renderer     = new THREE.WebGLRenderer({ canvas, alpha: false })
    s.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    s.renderer.setClearColor(new THREE.Color(0x0A0A0F))
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

    s.uniforms = {
      resolution: { value: [window.innerWidth, window.innerHeight] },
      time:       { value: 0 },
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(
      new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,-1,0, -1,1,0, 1,1,0]), 3,
    ))
    const mat  = new THREE.RawShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: s.uniforms })
    scene.add(new THREE.Mesh(geo, mat))

    const resize = () => {
      if (!s.renderer || !s.uniforms) return
      s.renderer.setSize(window.innerWidth, window.innerHeight, false)
      s.uniforms.resolution.value = [window.innerWidth, window.innerHeight]
    }
    const tick = () => {
      if (s.uniforms) (s.uniforms.time.value as number) += 0.007
      s.renderer?.render(scene, camera)
      s.animId = requestAnimationFrame(tick)
    }

    resize()
    tick()
    window.addEventListener("resize", resize)

    return () => {
      if (s.animId) cancelAnimationFrame(s.animId)
      window.removeEventListener("resize", resize)
      geo.dispose(); mat.dispose(); s.renderer?.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  )
}
