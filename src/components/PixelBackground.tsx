"use client";

import { useEffect, useRef } from "react";

interface Pixel {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  type: "cloud" | "bird" | "star" | "flower";
}

function getThemeColors(isDark: boolean) {
  return {
    sky: isDark ? "#1F2430" : "#87CEEB",
    cloud: isDark ? "#3A4460" : "#F8F8F8",
    mountainFar: isDark ? "#3A4050" : "#9DB4C0",
    mountainNear: isDark ? "#4A5060" : "#7B9AA6",
    grass: isDark ? "#6BA368" : "#7BC96F",
    grassDark: isDark ? "#4A7D4A" : "#3A7D44",
    ground: isDark ? "#8B7355" : "#D4A373",
    water: isDark ? "#5DADEC" : "#4EA8DE",
    star: "#FFF3B0",
    flower: "#FFD166",
  };
}

export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let isDark = document.documentElement.classList.contains("dark");

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener("resize", resize);

    // Track scroll for parallax
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Watch for theme changes
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Pre-generate cloud positions
    const clouds: Pixel[] = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * width,
        y: 60 + Math.random() * 120,
        size: 40 + Math.random() * 80,
        speed: 0.15 + Math.random() * 0.3,
        opacity: 0.5 + Math.random() * 0.4,
        type: "cloud",
      });
    }

    // Pre-generate stars
    const stars: Pixel[] = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.3,
        size: 1 + Math.random() * 2,
        speed: 0,
        opacity: 0.3 + Math.random() * 0.7,
        type: "star",
      });
    }

    // Birds
    const birds: Pixel[] = [];
    for (let i = 0; i < 3; i++) {
      birds.push({
        x: Math.random() * width,
        y: 80 + Math.random() * 80,
        size: 8,
        speed: 0.8 + Math.random() * 1.2,
        opacity: 0.7 + Math.random() * 0.3,
        type: "bird",
      });
    }

    // Flowers
    const flowers: Pixel[] = [];
    for (let i = 0; i < 20; i++) {
      flowers.push({
        x: Math.random() * width,
        y: height - 40 + Math.random() * 20,
        size: 3 + Math.random() * 3,
        speed: 0.02 + Math.random() * 0.04,
        opacity: 0.6 + Math.random() * 0.4,
        type: "flower",
      });
    }

    let frame = 0;

    function drawCloud(
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
      alpha: number
    ) {
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = color;
      const s = 4; // pixel size

      // Pixel cloud shape
      const cloudData = [
        [2, 3], [3, 2], [4, 2], [5, 2], [6, 3],
        [1, 4], [2, 4], [3, 3], [4, 3], [5, 3], [6, 4], [7, 4],
        [1, 5], [2, 5], [3, 4], [4, 4], [5, 4], [6, 5], [7, 5],
        [2, 6], [3, 5], [4, 5], [5, 5], [6, 6],
      ];

      const scaleX = w / (8 * s);
      const scaleY = h / (7 * s);

      for (const [cx, cy] of cloudData) {
        ctx!.fillRect(
          x + cx * s * scaleX,
          y + cy * s * scaleY,
          s * scaleX,
          s * scaleY
        );
      }
      ctx!.globalAlpha = 1;
    }

    function drawMountain(
      x: number,
      y: number,
      w: number,
      h: number,
      color: string
    ) {
      ctx!.fillStyle = color;
      ctx!.beginPath();
      ctx!.moveTo(x - w / 2, y);
      ctx!.lineTo(x, y - h);
      ctx!.lineTo(x + w / 2, y);
      ctx!.closePath();
      ctx!.fill();
    }

    function drawTree(x: number, y: number, _scale: number, color: string, trunkColor: string) {
      const s = 3;
      // Trunk
      ctx!.fillStyle = trunkColor;
      ctx!.fillRect(x - s, y - s * 4, s * 2, s * 4 + 2);

      // Leaves (pixel triangle)
      ctx!.fillStyle = color;
      // Bottom row
      for (let i = -5; i <= 5; i++) {
        ctx!.fillRect(x + i * s, y - s * 7, s, s);
      }
      // Middle row
      for (let i = -4; i <= 4; i++) {
        ctx!.fillRect(x + i * s, y - s * 9, s, s);
      }
      // Middle row 2
      for (let i = -3; i <= 3; i++) {
        ctx!.fillRect(x + i * s, y - s * 11, s, s);
      }
      // Top row
      for (let i = -2; i <= 2; i++) {
        ctx!.fillRect(x + i * s, y - s * 13, s, s);
      }
      // Top tip
      ctx!.fillRect(x, y - s * 15, s, s);
    }

    function drawBird(x: number, y: number, frame: number, color: string) {
      const s = 2;
      ctx!.fillStyle = color;
      const wingUp = frame % 20 < 10;

      if (wingUp) {
        // Wings up
        ctx!.fillRect(x - 4 * s, y - s, s * 3, s);
        ctx!.fillRect(x - 2 * s, y, s * 4, s);
        ctx!.fillRect(x + 2 * s, y - s, s * 3, s);
      } else {
        // Wings down
        ctx!.fillRect(x - 4 * s, y, s * 3, s);
        ctx!.fillRect(x - 3 * s, y + s, s * 6, s);
        ctx!.fillRect(x + 2 * s, y, s * 3, s);
      }
      // Body
      ctx!.fillRect(x - s, y, s * 2, s);
      // Eye
      ctx!.fillStyle = "#2B2B2B";
      ctx!.fillRect(x + s, y, s, s);
    }

    function drawStar(x: number, y: number, size: number, alpha: number) {
      ctx!.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(frame * 0.05 + x * 0.1));
      ctx!.fillStyle = "#FFF3B0";
      const s = size;
      ctx!.fillRect(x, y, s, s);
      ctx!.globalAlpha = 1;
    }

    function drawGrassBlade(x: number, y: number, sway: number, color: string) {
      const s = 2;
      ctx!.fillStyle = color;
      for (let i = 0; i < 4; i++) {
        const offset = Math.sin((x * 0.3 + i * 0.5 + sway) * 0.02) * 2;
        ctx!.fillRect(x + offset, y - i * s, s, s);
      }
    }

    function drawFlower(x: number, y: number, size: number, sway: number, color: string) {
      const s = size;
      const offset = Math.sin((x * 0.3 + sway) * 0.02) * 1;
      const fx = x + offset;
      // Petals
      ctx!.fillStyle = color;
      ctx!.fillRect(fx - s, y - s, s, s); // top-left
      ctx!.fillRect(fx + s, y - s, s, s); // top-right
      ctx!.fillRect(fx - s, y + s, s, s); // bottom-left
      ctx!.fillRect(fx + s, y + s, s, s); // bottom-right
      // Center
      ctx!.fillStyle = "#FFD166";
      ctx!.fillRect(fx, y, s, s);
    }

    function drawWaterRipple(x: number, y: number, frame: number, color: string) {
      ctx!.globalAlpha = 0.3;
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 1;
      const offset = frame * 0.02;
      const r = 10 + Math.sin(offset + x * 0.1) * 5;

      ctx!.beginPath();
      ctx!.ellipse(x, y, r * 0.5, r * 0.15, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.globalAlpha = 1;
    }

    function animate() {
      const colors = getThemeColors(isDark);
      const scrollY = scrollRef.current * 0.3;

      // Clear
      ctx!.clearRect(0, 0, width, height);

      // Sky
      ctx!.fillStyle = colors.sky;
      ctx!.fillRect(0, 0, width, height * 0.65);

      // Stars (only visible in dark mode)
      if (isDark) {
        for (const star of stars) {
          drawStar(star.x, star.y, star.size, star.opacity);
        }
      }

      // Move & draw clouds
      for (const cloud of clouds) {
        cloud.x += cloud.speed;
        if (cloud.x > width + 100) cloud.x = -100;
        drawCloud(
          cloud.x,
          cloud.y + scrollY * 0.05,
          cloud.size,
          cloud.size * 0.4,
          colors.cloud,
          isDark ? cloud.opacity * 0.5 : cloud.opacity
        );
      }

      // Moon (dark mode)
      if (isDark) {
        ctx!.fillStyle = "#FFF3B0";
        const moonX = width * 0.8;
        const moonY = 80 + scrollY * 0.05;
        const moonR = 20;
        ctx!.beginPath();
        ctx!.arc(moonX, moonY, moonR, 0, Math.PI * 2);
        ctx!.fill();
        // Crater dots
        ctx!.fillStyle = "#E8D070";
        ctx!.fillRect(moonX + 5, moonY - 8, 3, 3);
        ctx!.fillRect(moonX - 6, moonY + 2, 4, 4);
        ctx!.fillRect(moonX + 3, moonY + 6, 2, 2);
      }

      // Far mountains layer
      const mountainBaseY = height * 0.65;
      for (let i = 0; i < 5; i++) {
        drawMountain(
          (i / 4) * width + 100 * Math.sin(i * 1.5),
          mountainBaseY + scrollY * 0.15,
          200 + i * 40,
          120 + i * 20,
          colors.mountainFar
        );
      }

      // Near mountains
      for (let i = 0; i < 4; i++) {
        drawMountain(
          (i / 3.5) * width + 50,
          mountainBaseY + 20 + scrollY * 0.25,
          180 + i * 50,
          90 + i * 15,
          colors.mountainNear
        );
      }

      // Trees (background layer)
      const treeBaseY = mountainBaseY + 40 + scrollY * 0.35;
      for (let i = 0; i < 12; i++) {
        const x = (i / 11) * width;
        const scale = 0.6 + Math.sin(i * 2.1) * 0.3;
        drawTree(x, treeBaseY, scale, colors.grassDark, colors.ground);
      }

      // Ground
      ctx!.fillStyle = colors.ground;
      ctx!.fillRect(0, treeBaseY - 10, width, height - treeBaseY + 10);

      // Grass layer
      const grassTop = treeBaseY + 5;
      ctx!.fillStyle = colors.grass;
      ctx!.fillRect(0, grassTop, width, 8);

      // Grass blades
      for (let i = 0; i < width; i += 12) {
        drawGrassBlade(i, grassTop, frame * 0.3 + scrollY, colors.grassDark);
      }

      // Flowers
      for (const flower of flowers) {
        if (flower.y > grassTop && flower.y < grassTop + 30) {
          drawFlower(flower.x, flower.y, flower.size, frame * 0.3, colors.flower);
        }
      }

      // Water (small pond/river at bottom area)
      const waterY = grassTop + 20;
      ctx!.fillStyle = colors.water;
      ctx!.fillRect(width * 0.2, waterY, width * 0.6, 15 + Math.sin(frame * 0.03) * 3);

      // Water ripples
      for (let i = 0; i < 6; i++) {
        const rx = width * 0.25 + i * (width * 0.55 / 5);
        drawWaterRipple(rx, waterY + 7, frame + i * 100, colors.cloud);
      }

      // Birds
      for (const bird of birds) {
        bird.x += bird.speed;
        if (bird.x > width + 20) bird.x = -20;
        drawBird(bird.x, bird.y + Math.sin(frame * 0.05 + bird.x * 0.01) * 5, frame, colors.cloud);
      }

      // Sun (light mode)
      if (!isDark) {
        ctx!.fillStyle = "#FFD166";
        const sunX = width * 0.78;
        const sunY = 70 + scrollY * 0.05;
        const sunR = 18;
        ctx!.beginPath();
        ctx!.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx!.fill();

        // Sun rays (pixel)
        ctx!.fillStyle = "#FFE080";
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + frame * 0.005;
          const rx = sunX + Math.cos(angle) * (sunR + 4);
          const ry = sunY + Math.sin(angle) * (sunR + 4);
          ctx!.fillRect(rx - 2, ry - 2, 4, 4);
        }
      }

      frame++;
      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
