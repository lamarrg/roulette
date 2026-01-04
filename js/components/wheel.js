// Roulette Wheel Component
// Handles wheel rendering and spin animation

import RouletteConfig from '../config/roulette-config.js';
import { randomFloat, sleep } from '../utils/helpers.js';

class RouletteWheel {
  constructor(wheelId, ballId) {
    this.wheel = document.getElementById(wheelId);
    this.ball = document.getElementById(ballId);
    this.canvas = document.getElementById('wheel-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.isSpinning = false;
    this.currentRotation = 0;

    if (!this.ctx) {
      console.error('Canvas not found or context failed');
      return;
    }

    this.renderCanvas();

    // Position ball on first wedge (index 0) at page load
    const wheelOrder = RouletteConfig.wheelOrder;
    const segmentCount = wheelOrder.length;
    const anglePerSegment = (2 * Math.PI) / segmentCount;
    const wedgeAngleInStaticWheel = -Math.PI / 2 + (0 * anglePerSegment) + (anglePerSegment / 2);
    this.snapBallToWinner(wedgeAngleInStaticWheel);
  }

  renderCanvas() {
    const canvas = this.canvas;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 180; // Wheel outer edge
    const innerRadius = 40;  // Center circle

    const wheelOrder = RouletteConfig.wheelOrder;
    const segmentCount = wheelOrder.length;
    const anglePerSegment = (2 * Math.PI) / segmentCount;

    // Start at top (12 o'clock = -Math.PI/2)
    const startAngle = -Math.PI / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.currentRotation);

    // Draw segments
    wheelOrder.forEach((number, index) => {
      const angle1 = startAngle + (index * anglePerSegment);
      const angle2 = angle1 + anglePerSegment;
      const centerAngle = angle1 + anglePerSegment / 2;

      // Get color
      const colorName = RouletteConfig.getNumberColor(number);
      const color = this.getColor(colorName);

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerRadius, angle1, angle2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw number - positioned around wheel, oriented radially
      const textX = 140 * Math.cos(centerAngle);
      const textY = 140 * Math.sin(centerAngle);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(centerAngle + Math.PI / 2); // Rotate to face outward from center

      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(number, 0, 0);

      ctx.restore();
    });

    // Draw center circle (golden)
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.strokeStyle = '#b8932f';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  getColor(colorName) {
    const colors = {
      'red': '#dc2626',
      'black': '#1f2937',
      'green': '#16a34a'
    };
    return colors[colorName] || '#1f2937';
  }


  async spin(targetNumber) {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const wheelOrder = RouletteConfig.wheelOrder;
    const segmentCount = wheelOrder.length;
    const anglePerSegment = (2 * Math.PI) / segmentCount;

    // Find index of winning number
    const index = wheelOrder.indexOf(targetNumber);
    if (index === -1) {
      console.warn('spin(): targetNumber not found', targetNumber);
      this.isSpinning = false;
      return null;
    }

    // Angle of winning wedge center in the static wheel
    const wedgeAngleInStaticWheel = -Math.PI / 2 + (index * anglePerSegment) + (anglePerSegment / 2);

    // Random revolutions + random final position
    const revolutions = randomFloat(
      RouletteConfig.animation.minRevolutions,
      RouletteConfig.animation.maxRevolutions
    );

    // Random additional rotation (0 to 2π) for variety
    const randomOffset = Math.random() * 2 * Math.PI;

    const totalRotation = (revolutions * 2 * Math.PI) + randomOffset;

    // Animate using requestAnimationFrame
    const startTime = Date.now();
    const duration = RouletteConfig.animation.spinDuration;
    const startRotation = this.currentRotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (cubic-bezier approximation)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.currentRotation = startRotation + (totalRotation * eased);

      // Redraw canvas
      if (this.ctx) {
        this.renderCanvas();
      }

      // Position ball
      this.updateBallPosition(this.currentRotation, progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Final position - snap ball to winning wedge
        // After rotation, winning wedge is at: wedgeAngleInStaticWheel + currentRotation
        const finalWedgeAngle = wedgeAngleInStaticWheel + this.currentRotation;
        this.snapBallToWinner(finalWedgeAngle);
        this.isSpinning = false;
      }
    };

    animate();
    await sleep(duration);
    return targetNumber;
  }

  updateBallPosition(rotation, progress) {
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Ball travels outward during spin
    const ballRadius = 50 + (progress < 0.7 ? progress * 100 : 90 - (progress - 0.7) * 100);

    // Ball counter-rotates
    const ballAngle = -Math.PI / 2 - (rotation * 1.2);

    const x = centerX + ballRadius * Math.cos(ballAngle);
    const y = centerY + ballRadius * Math.sin(ballAngle);

    this.ball.style.left = `${x}px`;
    this.ball.style.top = `${y}px`;
    this.ball.style.transform = 'translate(-50%, -50%)';
  }

  snapBallToWinner(wedgeAngle) {
    const canvas = this.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const ballRadius = 165; // Position above numbers (toward outer edge)

    const x = centerX + ballRadius * Math.cos(wedgeAngle);
    const y = centerY + ballRadius * Math.sin(wedgeAngle);

    this.ball.style.left = `${x}px`;
    this.ball.style.top = `${y}px`;
    this.ball.style.transform = 'translate(-50%, -50%)';
  }

  reset() {
    // Reset rotation
    this.currentRotation = 0;
    this.renderCanvas();

    // Reset ball position to align with first wedge (index 0)
    const wheelOrder = RouletteConfig.wheelOrder;
    const segmentCount = wheelOrder.length;
    const anglePerSegment = (2 * Math.PI) / segmentCount;
    const wedgeAngleInStaticWheel = -Math.PI / 2 + (0 * anglePerSegment) + (anglePerSegment / 2);

    this.ball.style.transition = 'none';
    this.snapBallToWinner(wedgeAngleInStaticWheel);

    // Force reflow
    this.ball.offsetHeight;
  }

  isCurrentlySpinning() {
    return this.isSpinning;
  }

  destroy() {
    this.reset();
  }
}

export default RouletteWheel;