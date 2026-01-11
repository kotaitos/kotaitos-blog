"use client";

import { useEffect, useRef, useState } from "react";

type Season = "spring" | "summer" | "autumn" | "winter";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spinSpeed: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
  type?: number; // For varying shapes within a season
}

export function SeasonalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [season, setSeason] = useState<Season>("spring");

  // Debug mode toggle
  const debugMode = false;
  const forcedSeason: Season = "summer";

  useEffect(() => {
    // Determine season
    if (debugMode) {
      setSeason(forcedSeason);
    } else {
      const month = new Date().getMonth(); // 0-11
      if (month >= 2 && month <= 4) {
        setSeason("spring"); // Mar-May
      } else if (month >= 5 && month <= 7) {
        setSeason("summer"); // Jun-Aug
      } else if (month >= 8 && month <= 10) {
        setSeason("autumn"); // Sep-Nov
      } else {
        setSeason("winter"); // Dec-Feb
      }
    }
  }, []);

  const animationFrameId = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const lastClickRef = useRef({ x: 0, y: 0, time: 0 });
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      dimensions.current.width = window.innerWidth;
      dimensions.current.height = window.innerHeight;
      canvas.width = dimensions.current.width;
      canvas.height = dimensions.current.height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      lastClickRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    // Initialize particles based on season
    const initParticles = () => {
      particles.current = [];
      const count = getParticleCount(season, dimensions.current.width);
      for (let i = 0; i < count; i++) {
        particles.current.push(
          createParticle(
            season,
            dimensions.current.width,
            dimensions.current.height,
            true,
          ),
        );
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, dimensions.current.width, dimensions.current.height);

      // Update and draw each particle
      particles.current.forEach((p, i) => {
        updateParticle(p, season, mouseRef.current, lastClickRef.current);
        drawParticle(ctx, p, season);

        // Reset dead particles
        if (
          p.life <= 0 ||
          isOutOfBounds(p, dimensions.current.width, dimensions.current.height)
        ) {
          particles.current[i] = createParticle(
            season,
            dimensions.current.width,
            dimensions.current.height,
            false,
          );
        }
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleClick);

    resize();
    initParticles();
    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleClick);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [season]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: -1,
        opacity: 0.3,
        transition: "opacity 1s ease-in-out",
      }}
    />
  );
}

// Helper functions

function getParticleCount(season: Season, width: number): number {
  const base = width < 768 ? 30 : 60;

  switch (season) {
    case "spring":
      return base * 0.8;
    case "summer":
      return base * 0.6;
    case "autumn":
      return base * 0.7;
    case "winter":
      return base * 1.5;
  }
}

function createParticle(
  season: Season,
  width: number,
  height: number,
  initial: boolean,
): Particle {
  const x = Math.random() * width;

  switch (season) {
    case "spring": // Sakura
      return {
        x,
        y: initial ? Math.random() * height : -10,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 1 + 0.5,
        size: Math.random() * 4 + 3,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: Math.random() * 0.02 - 0.01,
        opacity: Math.random() * 0.4 + 0.3,
        life: 100,
        maxLife: 100,
        color: Math.random() > 0.5 ? "#ffd7e6" : "#ffb7c5",
      };
    case "summer": // Fireflies
      return {
        x,
        y: Math.random() * height, // Spawn anywhere on screen
        vx: Math.random() * 0.8 - 0.4,
        vy: Math.random() * 0.8 - 0.4,
        size: Math.random() * 2 + 1,
        angle: 0,
        spinSpeed: 0,
        opacity: 0,
        life: Math.random() * 300 + 200,
        maxLife: 500,
        color: "#ffd700",
      };
    case "autumn": // Leaves
      return {
        x,
        y: initial ? Math.random() * height : -20,
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 1.5 + 1,
        size: Math.random() * 6 + 4,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: Math.random() * 0.05 - 0.025,
        opacity: Math.random() * 0.5 + 0.4,
        life: 100,
        maxLife: 100,
        color: getRandomAutumnColor(),
        type: Math.floor(Math.random() * 3),
      };
    case "winter": // Snow
      return {
        x,
        y: initial ? Math.random() * height : -10,
        vx: Math.random() * 0.5 - 0.25,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1,
        angle: 0,
        spinSpeed: 0,
        opacity: Math.random() * 0.5 + 0.3,
        life: 100,
        maxLife: 100,
        color: "#ffffff",
      };
  }
}

function updateParticle(
  p: Particle,
  season: Season,
  mouse: { x: number; y: number; active: boolean },
  click: { x: number; y: number; time: number },
) {
  // Original movement
  p.x += p.vx;
  p.y += p.vy;
  p.angle += p.spinSpeed;

  // Mouse interaction
  if (mouse.active) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 150;

    if (dist < maxDist) {
      const force = (maxDist - dist) / maxDist;

      switch (season) {
        case "spring": // Sakura: Gentle repulsion
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
          break;
        case "summer": // Fireflies: Slight attraction
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
          break;
        case "autumn": // Leaves: Swirling
          const angle = Math.atan2(dy, dx) + 0.1;
          const targetX = mouse.x + Math.cos(angle) * dist;
          const targetY = mouse.y + Math.sin(angle) * dist;
          p.x += (targetX - p.x) * 0.05;
          p.y += (targetY - p.y) * 0.05;
          break;
        case "winter": // Snow: Pushed by wind
          p.vx += (dx / dist) * force * 0.2;
          p.vy += (dy / dist) * force * 0.2;
          break;
      }
    }
  }

  // Click interaction (within 1 second of click)
  const clickAge = Date.now() - click.time;
  if (clickAge < 1000) {
    const dx = p.x - click.x;
    const dy = p.y - click.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxClickDist = 300;

    if (dist < maxClickDist) {
      const clickForce = ((maxClickDist - dist) / maxClickDist) * (1 - clickAge / 1000) * 15;
      p.x += (dx / dist) * clickForce;
      p.y += (dy / dist) * clickForce;
    }
  }

  // Damping/Restoring velocity for winter
  if (season === "winter") {
    p.vx *= 0.95;
    p.vy = p.vy * 0.95 + (Math.random() * 2 + 1) * 0.05; // Gradually return to snow speed
  }

  switch (season) {
    case "spring":
      p.x += Math.sin(p.y * 0.01 + p.angle) * 0.3;
      break;
    case "summer":
      // Random wandering movement
      p.vx += (Math.random() * 0.2 - 0.1);
      p.vy += (Math.random() * 0.2 - 0.1);

      // Keep velocity within bounds
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1) {
        p.vx = (p.vx / speed) * 1;
        p.vy = (p.vy / speed) * 1;
      }

      if (p.life > p.maxLife * 0.8) {
        p.opacity = Math.min((p.maxLife - p.life) * 0.02, 0.8);
      } else if (p.life < p.maxLife * 0.2) {
        p.opacity = Math.max(p.life * 0.02, 0);
      } else {
        p.opacity = Math.min(p.opacity + (Math.random() * 0.02 - 0.01), 0.8);
      }
      p.life--;
      break;
    case "autumn":
      p.x += Math.cos(p.y * 0.005) * 0.2;
      break;
    case "winter":
      break;
  }
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  season: Season,
) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;

  switch (season) {
    case "spring":
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(
        p.size / 2,
        -p.size / 2,
        p.size / 2,
        p.size / 2,
        0,
        p.size,
      );
      ctx.bezierCurveTo(
        -p.size / 2,
        p.size / 2,
        -p.size / 2,
        -p.size / 2,
        0,
        -p.size,
      );
      ctx.fill();
      break;

    case "summer":
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;

    case "autumn":
      ctx.beginPath();
      if (p.type === 0) {
        ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
      } else if (p.type === 1) {
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size / 1.5, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size / 1.5, 0);
      } else {
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      }
      ctx.fill();
      break;

    case "winter":
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

function isOutOfBounds(p: Particle, width: number, height: number): boolean {
  return p.y > height + 20 || p.x < -20 || p.x > width + 20 || p.y < -30;
}

function getRandomAutumnColor() {
  const colors = ["#d35400", "#e67e22", "#c0392b", "#f39c12", "#8e44ad"];
  return colors[Math.floor(Math.random() * colors.length)] || "#d35400";
}
