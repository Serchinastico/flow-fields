import { simulateTick } from "./simulation";
import { clamp } from "./math";

/**
 * Renders aand simulates a single particle.
 */
const renderParticle = (context, color, particle, config) => {
  context.strokeStyle = color;
  context.lineWidth = clamp(
    config.minPenWidth,
    config.maxPenWidth,
    Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
  );

  context.beginPath();
  context.moveTo(particle.x, particle.y);
  const { outOfBounds } = simulateTick(particle, config);

  if (!outOfBounds) {
    /**
     * We only render particles if the didn't wrap around the screen.
     * If we render these paths, the screen will be filled with
     * horizontal/vertical lines
     */
    context.lineTo(particle.x, particle.y);
    context.stroke();
  }
};

/**
 * Renders a single frame, simulating all particles in the process
 * @param {CanvasRenderingContext2D} context
 * @param {number} step
 * @param {{x: number, y: number: vx: number, vy: number}[]} particles
 * @param {Object} config
 */
export const renderFrame = (context, step, particles, config) => {
  const color = config.gradientFn(step / config.maxSteps).hex();

  particles.forEach((particle) => {
    renderParticle(context, color, particle, config);
  });

  if (config.forceReduction > 0) {
    config.force *= 1 - config.forceReduction;
  }
};
