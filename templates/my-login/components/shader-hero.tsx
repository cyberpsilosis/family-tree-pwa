"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"

export function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const [password, setPassword] = useState("")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl2")
    if (!gl) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      }
    }
    window.addEventListener("mousemove", handleMouseMove)

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    // Vertex shader
    const vertexShaderSource = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `#version 300 es
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 mouse;
      out vec4 fragColor;

      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        vec2 uv0 = uv;
        
        vec2 mouseOffset = (mouse - 0.5) * 0.3;
        uv0 += mouseOffset;
        
        uv.y += sin(uv.x * 3.0 + time + mouse.y * 3.0) * (mouse.y - 0.5) * 0.1;
        uv.x += cos(uv.y * 3.0 + time + mouse.y * 2.5) * (mouse.y - 0.5) * 0.08;
        
        vec3 finalColor = vec3(0.0);
        
        for (float i = 0.0; i < 4.0; i++) {
          uv = fract(uv * 1.5) - 0.5;
          
          float d = length(uv) * exp(-length(uv0));
          
          vec3 col = palette(length(uv0) + i * 0.4 + time * 0.4 + mouse.y * 0.15);
          
          float animSpeed = 1.0 + mouse.x * 0.15 + mouse.y * 0.25;
          d = sin(d * 8.0 + time * animSpeed + mouse.y * 1.0) / 8.0;
          d = abs(d);
          
          float intensity = 1.2 + (mouse.y - 0.5) * 0.15;
          d = pow(0.01 / d, intensity);
          
          finalColor += col * d;
        }
        
        fragColor = vec4(finalColor, 1.0);
      }
    `

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) return

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) return

    // Create program
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    // Setup geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, "resolution")
    const timeLocation = gl.getUniformLocation(program, "time")
    const mouseLocation = gl.getUniformLocation(program, "mouse")

    gl["useProgram"](program)

    const startTime = Date.now()
    const render = () => {
      const time = (Date.now() - startTime) * 0.001

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(buffer)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Password submitted:", password)
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        className="absolute inset-0 backdrop-blur-2xl"
        style={{
          WebkitMaskImage: "url(/images/adobe-20express-20-20file.png)",
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskImage: "url(/images/adobe-20express-20-20file.png)",
          maskSize: "contain",
          maskPosition: "center",
          maskRepeat: "no-repeat",
        }}
      >
        <div
          className="h-full w-full"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 -2px 8px rgba(255, 255, 255, 0.1)",
          }}
        />
      </div>

      <div className="absolute inset-0 backdrop-blur-2xl bg-background/20" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border/50 bg-background/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Welcome</h1>
            <p className="text-sm text-muted-foreground">Enter password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-background/50 backdrop-blur-sm"
              />
            </div>

            <Button type="submit" className="h-12 w-full rounded-lg" size="lg">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">Protected access only</div>
        </div>
      </div>
    </div>
  )
}
