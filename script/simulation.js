import rnd from "./random";

/**
 * Simulates the next tick of the particle given its position
 * and velocity. This procedure mutates the particle in place for
 * performance reasons.
 * @param {{x: number, y: number, vx: number, vy: number}} particle
 * @param {Object} config
 * @returns {{didWrap: boolean}} Returns an object with the results of the simulation
 */
export const simulateTick = (particle, config) => {
  /**
   * 1. Update the particle velocity according to its position
   *    following the field vectors
   * 2. Move the particle according to its velocity and trace a path
   * 3. Reduce the velocity of the particle (simulating friction)
   * 4. Update particle position if it went out of bounds making
   *    the plane a continuum
   */
  const value = config.flowFieldFn(particle.x, particle.y);

  particle.vx += Math.cos(value) * config.force;
  particle.vy += Math.sin(value) * config.force;

  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.vx *= 1 - config.friction;
  particle.vy *= 1 - config.friction;

  let didWrap = false;

  if (particle.x > window.innerWidth) {
    particle.x = 0;
    didWrap = true;
  }
  if (particle.y > window.innerHeight) {
    particle.y = 0;
    didWrap = true;
  }
  if (particle.x < 0) {
    particle.x = window.innerWidth;
    didWrap = true;
  }
  if (particle.y < 0) {
    particle.y = window.innerHeight;
    didWrap = true;
  }

  return { didWrap };
};

/**
 * Creates and initializes a list of particles
 * @param {number} count
 * @returns {{x: number, y: number, vx: number, vy: number}[]} The particles distributed randomly in the window
 */
export const createParticles = (count) => {
  const particles = [];

  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: rnd.random() * window.innerWidth,
      y: rnd.random() * window.innerHeight,
      vx: 0,
      vy: 0,
    });
  }

  return particles;
};
