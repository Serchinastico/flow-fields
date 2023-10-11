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
  const { force, angle } = config.flowFieldFn(
    config.flowFieldFnData,
    particle.x,
    particle.y,
    config.width,
    config.height
  );

  particle.vx += Math.cos(angle) * force * config.force;
  particle.vy += Math.sin(angle) * force * config.force;

  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.vx *= 1 - config.friction;
  particle.vy *= 1 - config.friction;

  let didWrap = false;

  if (particle.x > config.width) {
    particle.x = 0;
    didWrap = true;
  }
  if (particle.y > config.height) {
    particle.y = 0;
    didWrap = true;
  }
  if (particle.x < 0) {
    particle.x = config.width;
    didWrap = true;
  }
  if (particle.y < 0) {
    particle.y = config.height;
    didWrap = true;
  }

  return { didWrap };
};

/**
 * Creates and initializes a list of particles
 * @param {number} count
 * @returns {{x: number, y: number, vx: number, vy: number}[]} The particles distributed randomly in the window
 */
export const createParticles = (config) => {
  const particles = [];

  for (let i = 0; i < config.numPoints; i += 1) {
    particles.push({
      x: rnd.random() * config.width,
      y: rnd.random() * config.height,
      vx: 0,
      vy: 0,
    });
  }

  return particles;
};
