"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer, Sparkles, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const CARD_W = 3.5;
const CARD_H = CARD_W / 1.586;
const CARD_D = 0.07;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const w = 1024;
  const h = Math.round(w / 1.586);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function drawFront(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pad = 40;
  const r = 64;
  // Deep green base with cinematic gradient
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#0f4a37");
  g.addColorStop(0.5, "#0a3527");
  g.addColorStop(1, "#06241b");
  roundRect(ctx, 0, 0, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();

  // Diagonal sheen
  const sheen = ctx.createLinearGradient(0, 0, w, h);
  sheen.addColorStop(0, "rgba(255,255,255,0.10)");
  sheen.addColorStop(0.35, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(255,255,255,0.04)");
  roundRect(ctx, 0, 0, w, h, r);
  ctx.fillStyle = sheen;
  ctx.fill();

  // Wordmark
  ctx.fillStyle = "#f3ede0";
  ctx.font = "700 56px 'Space Grotesk', Arial, sans-serif";
  ctx.textBaseline = "top";
  ctx.save();
  ctx.translate(pad + 6, pad + 8);
  // letter spacing
  const word = "SHERWOOD";
  let x = 0;
  for (const ch of word) {
    ctx.fillText(ch, x, 0);
    x += ctx.measureText(ch).width + 8;
  }
  ctx.restore();

  // Contactless / tap icon (gold arcs) top-right
  const cx = w - pad - 96;
  const cy = pad + 36;
  ctx.strokeStyle = "#d4b15f";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, 14 * i, -Math.PI / 3.2, Math.PI / 3.2);
    ctx.stroke();
  }

  // EMV chip (gold)
  const chipX = pad + 8;
  const chipY = h * 0.42;
  const chipW = 120;
  const chipH = 92;
  const cg = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
  cg.addColorStop(0, "#f4e3b0");
  cg.addColorStop(0.5, "#d4b15f");
  cg.addColorStop(1, "#a87d2e");
  roundRect(ctx, chipX, chipY, chipW, chipH, 16);
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.strokeStyle = "rgba(80,55,10,0.55)";
  ctx.lineWidth = 3;
  // chip contact lines
  ctx.beginPath();
  ctx.moveTo(chipX + chipW * 0.5, chipY);
  ctx.lineTo(chipX + chipW * 0.5, chipY + chipH);
  ctx.moveTo(chipX, chipY + chipH * 0.33);
  ctx.lineTo(chipX + chipW, chipY + chipH * 0.33);
  ctx.moveTo(chipX, chipY + chipH * 0.66);
  ctx.lineTo(chipX + chipW, chipY + chipH * 0.66);
  ctx.stroke();

  // Card number
  ctx.fillStyle = "#f3ede0";
  ctx.font = "500 46px 'JetBrains Mono', monospace";
  ctx.fillText("****   ****   ****   0427", pad + 6, h - 150);

  // Footer label
  ctx.fillStyle = "#d4b15f";
  ctx.font = "600 24px 'Space Grotesk', Arial, sans-serif";
  ctx.fillText("ESSENTIAL AID CARD", pad + 6, h - 78);

  // Valid thru block (right)
  ctx.fillStyle = "rgba(243,237,224,0.55)";
  ctx.font = "500 18px 'JetBrains Mono', monospace";
  ctx.fillText("VALID THRU", w - pad - 190, h - 96);
  ctx.fillStyle = "#f3ede0";
  ctx.font = "500 30px 'JetBrains Mono', monospace";
  ctx.fillText("∞ / ∞", w - pad - 188, h - 70);
}

function drawBack(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const r = 64;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#0a3527");
  g.addColorStop(1, "#06241b");
  roundRect(ctx, 0, 0, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();

  // Magnetic stripe
  ctx.fillStyle = "#05130e";
  ctx.fillRect(0, h * 0.16, w, h * 0.2);

  // Signature strip
  ctx.fillStyle = "#e7dfcd";
  roundRect(ctx, 50, h * 0.46, w * 0.5, h * 0.14, 10);
  ctx.fill();
  ctx.fillStyle = "#0a3527";
  ctx.font = "italic 26px 'Space Grotesk', Arial, sans-serif";
  ctx.fillText("Sherwood", 70, h * 0.5);

  // QR code (deterministic pattern) bottom-right
  const qs = 210;
  const qx = w - qs - 60;
  const qy = h - qs - 50;
  ctx.fillStyle = "#f3ede0";
  roundRect(ctx, qx - 14, qy - 14, qs + 28, qs + 28, 16);
  ctx.fill();
  const cells = 21;
  const cell = qs / cells;
  ctx.fillStyle = "#06241b";
  const seed = (i: number, j: number) => ((i * 73856093) ^ (j * 19349663) ^ 0x427) % 7;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      if (seed(i, j) > 3) ctx.fillRect(qx + i * cell, qy + j * cell, cell - 1, cell - 1);
    }
  }
  // finder patterns
  const finder = (fx: number, fy: number) => {
    ctx.fillStyle = "#06241b";
    ctx.fillRect(fx, fy, cell * 7, cell * 7);
    ctx.fillStyle = "#f3ede0";
    ctx.fillRect(fx + cell, fy + cell, cell * 5, cell * 5);
    ctx.fillStyle = "#06241b";
    ctx.fillRect(fx + cell * 2, fy + cell * 2, cell * 3, cell * 3);
  };
  finder(qx, qy);
  finder(qx + cell * 14, qy);
  finder(qx, qy + cell * 14);

  // small label
  ctx.fillStyle = "rgba(243,237,224,0.6)";
  ctx.font = "500 20px 'JetBrains Mono', monospace";
  ctx.fillText("CARD ID • 0427", 70, h - 70);
}

function Card() {
  const group = useRef<THREE.Group>(null);
  const [frontTex, backTex] = useMemo(
    () => [makeTexture(drawFront), makeTexture(drawBack)],
    [],
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.45;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={group} rotation={[0.18, 0, 0]}>
        {/* Card body */}
        <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={0.11} smoothness={6}>
          <meshPhysicalMaterial
            color="#07271d"
            metalness={0.6}
            roughness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.08}
            reflectivity={0.6}
          />
        </RoundedBox>

        {/* Front artwork */}
        <mesh position={[0, 0, CARD_D / 2 + 0.002]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshStandardMaterial
            map={frontTex}
            transparent
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>

        {/* Back artwork */}
        <mesh position={[0, 0, -CARD_D / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshStandardMaterial
            map={backTex}
            transparent
            roughness={0.4}
            metalness={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function SherwoodCard3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <pointLight position={[-4, 2, 3]} intensity={20} color="#d4b15f" />
      <pointLight position={[4, -3, 2]} intensity={14} color="#1f8a63" />

      <Card />

      <Sparkles count={70} scale={9} size={2.2} speed={0.35} color="#d4b15f" opacity={0.5} />

      {/* Procedural environment for glossy reflections (no network fetch) */}
      <Environment resolution={256}>
        <Lightformer
          intensity={2}
          position={[0, 3, 4]}
          scale={[8, 3, 1]}
          color="#fff3d6"
        />
        <Lightformer
          intensity={1.2}
          position={[-4, -1, 3]}
          scale={[4, 4, 1]}
          color="#1f8a63"
        />
        <Lightformer
          intensity={1}
          position={[4, 2, -2]}
          scale={[4, 4, 1]}
          color="#ffffff"
        />
      </Environment>
    </Canvas>
  );
}
