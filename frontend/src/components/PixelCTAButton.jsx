import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export const PixelCTAButton = ({
  children,
  onClick,
  className = "",
  style = {},
  disabled = false,
  type = "button",
  particleColors = ['#D01C1F', '#FFC400', '#FFFFFF', '#FFE082'],
  particleSize = 3,
  maxParticles = 60,
  glowOnHover = true,
}) => {
  const canvasRef = useRef(null);
  const buttonRef = useRef(null);
  const particlesRef = useRef([]);
  const isHoveredRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;

    // Set canvas dimensions relative to button size
    const updateSize = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(() => updateSize());
    if (buttonRef.current) resizeObserver.observe(buttonRef.current);

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2.5 + particleSize;
        this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
        this.life = 1.0;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = -(Math.random() * 0.8 + 0.4);
        this.decay = Math.random() * 0.03 + 0.015;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
      }

      draw(c) {
        c.fillStyle = this.color;
        c.globalAlpha = this.life;
        // Align to clean pixel grid layout coordinates
        const drawX = Math.floor(this.x / particleSize) * particleSize;
        const drawY = Math.floor(this.y / particleSize) * particleSize;
        const drawSize = Math.max(particleSize, Math.floor(this.size));
        c.fillRect(drawX, drawY, drawSize, drawSize);
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let currentParticles = particlesRef.current;

      // 1. Spawning on Hover
      if (isHoveredRef.current && currentParticles.length < maxParticles) {
        if (Math.random() < 0.35) {
          const mouse = mousePosRef.current;
          currentParticles.push(new Particle(
            mouse.x + (Math.random() - 0.5) * 25,
            mouse.y + (Math.random() - 0.5) * 20
          ));
        }
        if (Math.random() < 0.25) {
          currentParticles.push(new Particle(
            Math.random() * canvas.width,
            canvas.height - 2
          ));
        }
      }

      // 2. Continuous idle ambient sparkles
      if (!isHoveredRef.current && currentParticles.length < 6 && Math.random() < 0.04) {
        currentParticles.push(new Particle(
          Math.random() * canvas.width,
          canvas.height - 2
        ));
      }

      // 3. Update & render particles
      particlesRef.current = currentParticles.filter(p => {
        p.update();
        if (p.life > 0 && p.x >= -10 && p.x <= canvas.width + 10 && p.y >= -10 && p.y <= canvas.height + 10) {
          p.draw(ctx);
          return true;
        }
        return false;
      });

      // 4. Interactive border glow shimmer on hover
      if (isHoveredRef.current && glowOnHover) {
        ctx.strokeStyle = 'rgba(255, 196, 0, 0.45)'; // España Gold outline shimmer
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.35 + Math.sin(Date.now() * 0.012) * 0.15;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [particleColors, particleSize, maxParticles, glowOnHover]);

  const handleMouseMove = (e) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseEnter = (e) => {
    isHoveredRef.current = true;
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  const handleClick = (e) => {
    if (disabled) return;

    // Trigger burst explosion on click
    if (buttonRef.current && canvasRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const colors = particleColors;
      const sizeVal = particleSize;
      
      const burstCount = 18;
      const burstParticles = [];
      for (let i = 0; i < burstCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 1.2;
        
        burstParticles.push({
          x: clickX,
          y: clickY,
          size: Math.random() * 2.5 + sizeVal,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          decay: Math.random() * 0.04 + 0.02,
          update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
          },
          draw(c) {
            c.fillStyle = this.color;
            c.globalAlpha = this.life;
            const drawX = Math.floor(this.x / sizeVal) * sizeVal;
            const drawY = Math.floor(this.y / sizeVal) * sizeVal;
            const drawSize = Math.max(sizeVal, Math.floor(this.size));
            c.fillRect(drawX, drawY, drawSize, drawSize);
          }
        });
      }
      particlesRef.current = [...particlesRef.current, ...burstParticles];
    }

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
      }}
      className={`select-none focus:outline-none cursor-pointer ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ imageRendering: 'pixelated' }}
      />
      <span className="relative z-20 flex items-center justify-center gap-2 w-full h-full">
        {children}
      </span>
    </motion.button>
  );
};
