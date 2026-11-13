"use client";

import { useEffect, useRef, useState } from "react";
import { useAmbientMotion } from "@/lib/useAmbientMotion";
import styles from "./KineticSculpture.module.css";

type Kind = "ribbon" | "fold" | "orbit" | "bloom";
const kinds: Record<Kind, number> = { ribbon: 0, fold: 1, orbit: 2, bloom: 3 };
const palettes: Record<Kind, [number[], number[]]> = {
  ribbon: [[.23, .37, .88], [.98, .47, .39]],
  fold: [[.18, .32, .8], [.44, .66, .84]],
  orbit: [[.16, .3, .76], [.92, .53, .36]],
  bloom: [[.95, .63, .3], [.94, .38, .35]],
};

// Decorative parametric surfaces. These never encode research or medical data.
const vertexSource = `
precision highp float;
attribute vec2 aUv;
uniform float uTime;
uniform float uKind;
uniform vec2 uPointer;
uniform mat4 uProjection;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
const float PI = 3.14159265359;
vec3 knot(float u) {
  float r = 1.04 + .31 * cos(3.0 * u);
  return vec3(r*cos(2.0*u), r*sin(2.0*u), .39*sin(3.0*u));
}
vec3 shape(vec2 uv) {
  float u = uv.x * 2.0 * PI;
  float v = uv.y * 2.0 - 1.0;
  if (uKind < .5) {
    float twist = u*.5 + .26*sin(uTime*.19);
    float r = 1.19 + v*.47*cos(twist);
    return vec3(r*cos(u), v*.47*sin(twist), r*sin(u));
  }
  if (uKind < 1.5) {
    float x = (uv.x-.5)*3.2;
    float phase = uv.x*PI*3.0 + uTime*.23;
    float fold = sin(uv.x*PI*14.0)*.09;
    return vec3(x, .48*sin(phase) + fold, v*.72 + .32*cos(phase));
  }
  if (uKind < 2.5) {
    vec3 c = knot(u);
    vec3 tangent = normalize(knot(u+.002)-c);
    vec3 n = normalize(cross(tangent,vec3(0.0,0.0,1.0)));
    vec3 b = normalize(cross(tangent,n));
    float radius = .18 + .018*sin(u*5.0+uTime*.26);
    return c + radius*(cos(uv.y*2.0*PI)*n + sin(uv.y*2.0*PI)*b);
  }
  float petal = sin(u*6.0+uTime*.13);
  float r = (.02+uv.y*1.37)*(1.0+.16*petal*uv.y);
  float z = .58*cos(uv.y*PI*.85)+.35*petal*pow(uv.y,1.7);
  return vec3(r*cos(u),r*sin(u),z);
}
mat3 rx(float a) { float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c); }
mat3 ry(float a) { float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c); }
mat3 rz(float a) { float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.); }
void main() {
  vec3 p=shape(aUv);
  vec3 du=shape(aUv+vec2(.001,0.))-p;
  vec3 dv=shape(aUv+vec2(0.,.001))-p;
  vec3 normal=normalize(cross(du,dv));
  float ax=.92, ay=uTime*.095, az=-.28;
  if(uKind>0.5 && uKind<1.5) { ax=.68;ay=.35+.38*sin(uTime*.12);az=-.4; }
  if(uKind>1.5 && uKind<2.5) { ax=.18+.27*sin(uTime*.1);ay=.27*sin(uTime*.13);az=uTime*.07; }
  if(uKind>2.5) { ax=-.32;ay=.3*sin(uTime*.12);az=uTime*.055; }
  mat3 rotation=rz(az)*ry(ay+uPointer.x*.24)*rx(ax+uPointer.y*.15);
  p=rotation*p;
  p.y+=.055*sin(uTime*.45);
  vNormal=rotation*normal;
  vPosition=p;
  vUv=aUv;
  gl_Position=uProjection*vec4(p+vec3(0.,0.,-5.7),1.);
}`;

const fragmentSource = `
precision mediump float;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
void main() {
  vec3 n=normalize(vNormal)*(gl_FrontFacing?1.:-1.);
  vec3 light=normalize(vec3(-.5,.8,1.4));
  vec3 eye=normalize(vec3(0.,0.,5.7)-vPosition);
  float diffuse=max(0.,dot(n,light));
  float specular=pow(max(0.,dot(n,normalize(light+eye))),36.);
  float fresnel=pow(1.-abs(dot(n,eye)),2.6);
  float blend=.5+.3*sin(vUv.x*6.2831853)+.2*cos(vUv.y*6.2831853);
  vec3 base=mix(uColorA,uColorB,blend);
  vec3 color=base*(.48+.65*diffuse)+vec3(1.,.94,.76)*specular*.42+vec3(.13,.18,.27)*fresnel*.45;
  gl_FragColor=vec4(color,1.);
}`;

export default function KineticSculpture({ kind, active, scrollRoot }: {
  kind: Kind; active: boolean; scrollRoot: HTMLElement | null | undefined;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  useAmbientMotion(active, scrollRoot, surface);

  useEffect(() => {
    const node = surface.current;
    const element = canvas.current;
    if (!node || !element) return;
    const gl = element.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;
    let frame = 0, previous = 0, elapsed = 0;
    let disposed = false, lost = false;
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    const visibilityGate = node.parentElement?.closest<HTMLElement>("[data-kinetic-occluded]");
    let occluded = visibilityGate?.dataset.kineticOccluded === "true";
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      if (vertex) gl.deleteShader(vertex); if (fragment) gl.deleteShader(fragment); if (program) gl.deleteProgram(program);
      return;
    }
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment); return; }
    const columns = kind === "orbit" ? 160 : 112;
    const rows = kind === "orbit" ? 18 : 32;
    const coordinates = new Float32Array((columns+1)*(rows+1)*2);
    const indices = new Uint16Array(columns*rows*6);
    let k = 0;
    for (let u=0;u<=columns;u++) for (let v=0;v<=rows;v++) { coordinates[k++]=u/columns; coordinates[k++]=v/rows; }
    k=0;
    for (let u=0;u<columns;u++) for (let v=0;v<rows;v++) {
      const a=u*(rows+1)+v, b=a+rows+1;
      indices[k++]=a; indices[k++]=b; indices[k++]=a+1;
      indices[k++]=b; indices[k++]=b+1; indices[k++]=a+1;
    }
    const vertices = gl.createBuffer(), faces = gl.createBuffer();
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,vertices); gl.bufferData(gl.ARRAY_BUFFER,coordinates,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,faces); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program,"aUv"); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
    const time = gl.getUniformLocation(program,"uTime");
    const pointer = gl.getUniformLocation(program,"uPointer");
    const projection = gl.getUniformLocation(program,"uProjection");
    gl.uniform1f(gl.getUniformLocation(program,"uKind"),kinds[kind]);
    gl.uniform3fv(gl.getUniformLocation(program,"uColorA"),palettes[kind][0]);
    gl.uniform3fv(gl.getUniformLocation(program,"uColorB"),palettes[kind][1]);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.clearColor(0,0,0,0);
    const draw = () => {
      if (disposed || lost || occluded || !element.width || !element.height) return;
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(time,elapsed); gl.uniform2f(pointer,pointerX,pointerY);
      gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
    };
    const render = (now: number) => {
      frame=0;
      if (disposed || lost || node.dataset.ambientRunning !== "true") { previous=0; return; }
      // The clock and exponential easing follow real time even on slower frames;
      // sync() resets previous when resuming, so inactive time is never integrated.
      const delta = previous ? Math.max(0,(now-previous)/1000) : 0;
      previous=now; elapsed+=delta;
      const ease=1-Math.exp(-delta*5);
      pointerX+=(targetX-pointerX)*ease; pointerY+=(targetY-pointerY)*ease;
      // Preserve the original clock and pointer easing while fully transparent,
      // so reversing the scroll reveals exactly the same phase. Only the costly
      // GPU work is skipped; offscreen/paused artwork still stops its RAF below.
      draw(); frame=requestAnimationFrame(render);
    };
    const sync = () => {
      if (node.dataset.ambientRunning === "true" && !lost && !disposed) { if (!frame) { previous=0; frame=requestAnimationFrame(render); } }
      else { cancelAnimationFrame(frame); frame=0; previous=0; }
    };
    let projectionAspect = Number.NaN;
    const resize = () => {
      const width=node.clientWidth, height=node.clientHeight;
      if (!width || !height || lost || disposed) return;
      const dpr=Math.min(devicePixelRatio,1.5,800/Math.max(width,height));
      const pixelWidth=Math.max(1,Math.round(width*dpr)), pixelHeight=Math.max(1,Math.round(height*dpr));
      const aspect=width/height;
      // Reassigning an unchanged canvas size still clears its drawing buffer.
      // A fresh context always uploads its projection, even at the same size.
      if (element.width===pixelWidth && element.height===pixelHeight && projectionAspect===aspect) return;
      if (element.width!==pixelWidth) element.width=pixelWidth;
      if (element.height!==pixelHeight) element.height=pixelHeight;
      gl.viewport(0,0,element.width,element.height);
      const f=1/Math.tan(.66/2), near=.1, far=30;
      gl.uniformMatrix4fv(projection,false,new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]));
      projectionAspect=aspect;
      draw(); setReady(true);
    };
    const stateObserver = new MutationObserver(sync);
    stateObserver.observe(node,{attributes:true,attributeFilter:["data-ambient-running"]});
    const occlusionObserver = visibilityGate ? new MutationObserver(() => {
      occluded = visibilityGate.dataset.kineticOccluded === "true";
      node.dataset.kineticOccluded = String(occluded);
    }) : null;
    if (visibilityGate) occlusionObserver!.observe(visibilityGate,{attributes:true,attributeFilter:["data-kinetic-occluded"]});
    node.dataset.kineticOccluded = String(occluded);
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(node);
    const section = node.closest("section");
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || node.dataset.ambientRunning !== "true") return;
      targetX=(event.clientX/window.innerWidth-.5)*2;
      targetY=(event.clientY/window.innerHeight-.5)*2;
    };
    const leave = () => { targetX=0; targetY=0; };
    section?.addEventListener("pointermove",move,{passive:true}); section?.addEventListener("pointerleave",leave);
    const contextLost = (event: Event) => { event.preventDefault(); lost=true; cancelAnimationFrame(frame); frame=0; setReady(false); };
    const contextRestored = () => setGeneration(value=>value+1);
    element.addEventListener("webglcontextlost",contextLost); element.addEventListener("webglcontextrestored",contextRestored);
    resize(); sync();
    return () => {
      disposed=true; cancelAnimationFrame(frame); stateObserver.disconnect(); occlusionObserver?.disconnect(); resizeObserver.disconnect();
      section?.removeEventListener("pointermove",move); section?.removeEventListener("pointerleave",leave);
      element.removeEventListener("webglcontextlost",contextLost); element.removeEventListener("webglcontextrestored",contextRestored);
      gl.deleteBuffer(vertices); gl.deleteBuffer(faces); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
    };
  }, [generation, kind]);

  return <div ref={surface} className={styles.surface} aria-hidden="true" data-ambient-art={kind} data-kinetic={kind} data-renderer={ready ? "webgl" : "static"}>
    <svg className={styles.fallback} viewBox="0 0 400 400" fill="none"><path d="M90 210C30 30 300 20 310 155C330 310 95 370 90 210ZM140 210C130 110 260 90 270 180C275 270 145 300 140 210Z" fill={kind === "bloom" ? "#ee965e" : "#526fd0"} fillRule="evenodd" /><path d="M95 210C90 325 300 290 307 155" stroke="#eab9a1" strokeWidth="18" /></svg>
    <canvas ref={canvas} className={styles.canvas} />
  </div>;
}
