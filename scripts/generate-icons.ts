#!/usr/bin/env node

/**
 * NextShift Icon Generator
 * Generates PWA and favicon icons for the NextShift application
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createCanvas } from "canvas";

const ICONS_DIR = join(process.cwd(), "public", "assets", "icons");

interface IconConfig {
  size: number;
  filename: string;
  name: string;
}

// Ensure icons directory exists
if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true });
}

/**
 * Create a NextShift icon with clock design
 * @param size - Icon size in pixels
 * @returns Canvas with the icon
 */
function createIcon(size: number) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  // Background gradient
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, "#1e3a8a"); // Blue-900
  gradient.addColorStop(1, "#0d6efd"); // Bootstrap primary

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();

  // Clock face
  ctx.strokeStyle = "white";
  ctx.lineWidth = size * 0.015;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.9, 0, 2 * Math.PI);
  ctx.stroke();

  // Hour markers
  ctx.strokeStyle = "white";
  ctx.lineWidth = size * 0.01;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x1 = centerX + Math.cos(angle) * radius * 0.8;
    const y1 = centerY + Math.sin(angle) * radius * 0.8;
    const x2 = centerX + Math.cos(angle) * radius * 0.7;
    const y2 = centerY + Math.sin(angle) * radius * 0.7;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Clock hands showing 3:00 (shift change time)
  ctx.strokeStyle = "white";
  ctx.lineWidth = size * 0.015;

  // Hour hand (pointing to 3)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX + size * 0.15, centerY);
  ctx.stroke();

  // Minute hand (pointing to 12)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(centerX, centerY - size * 0.2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = "#0d6efd";
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.02, 0, 2 * Math.PI);
  ctx.fill();

  // Add text "NS" for NextShift (only for larger icons)
  if (size >= 48) {
    ctx.fillStyle = "white";
    ctx.font = `bold ${size * 0.15}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText("NS", centerX, centerY + size * 0.45);
  }

  return canvas;
}

/**
 * Generate and save icon files
 */
function generateIcons(): void {
  const icons: IconConfig[] = [
    { size: 16, filename: "icon-16.png", name: "16x16 Favicon" },
    { size: 32, filename: "icon-32.png", name: "32x32 Favicon" },
    { size: 48, filename: "icon-48.png", name: "48x48 Favicon" },
    { size: 192, filename: "icon-192.png", name: "192x192 PWA Icon" },
    { size: 512, filename: "icon-512.png", name: "512x512 PWA Icon" },
  ];

  console.log("🎨 Generating NextShift icons...\n");

  icons.forEach(({ size, filename, name }) => {
    const canvas = createIcon(size);
    const buffer = canvas.toBuffer("image/png");
    const filePath = join(ICONS_DIR, filename);

    writeFileSync(filePath, buffer);
    const sizeKB = (buffer.length / 1024).toFixed(1);
    console.log(`✅ Generated ${name}: ${filename} (${sizeKB}KB)`);
  });

  console.log(`\n🎉 All icons generated successfully in ${ICONS_DIR}`);
  console.log("\n📱 Icons are ready for PWA deployment!");
}

// Run the generator
try {
  generateIcons();
} catch (error) {
  console.error("❌ Error generating icons:", (error as Error).message);
  process.exit(1);
}
