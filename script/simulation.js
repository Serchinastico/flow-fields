import rnd from "./random";

const calculateOutOfBounds = (particle, config) => {
  if (particle.x > config.width) {
    return { outOfBounds: true, side: "east" };
  }
  if (particle.y > config.height) {
    return { outOfBounds: true, side: "north" };
  }
  if (particle.x < 0) {
    return { outOfBounds: true, side: "west" };
  }
  if (particle.y < 0) {
    return { outOfBounds: true, side: "south" };
  }

  return { outOfBounds: false };
};

/**
 * Simulates the next tick of the particle given its position
 * and velocity. This procedure mutates the particle in place for
 * performance reasons.
 * @param {{x: number, y: number, vx: number, vy: number}} particle
 * @param {Object} config
 * @returns {{outOfBounds: boolean}} Returns an object with the results of the simulation
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

  const { outOfBounds, side } = calculateOutOfBounds(particle, config);

  if (config.outOfBoundsBehavior === "wrap") {
    switch (side) {
      case "east":
        particle.x = 0;
        break;
      case "north":
        particle.y = 0;
        break;
      case "west":
        particle.x = config.width;
        break;
      case "south":
        particle.y = config.height;
        break;
    }
  } else if (config.outOfBoundsBehavior === "recreate") {
    if (outOfBounds) {
      particle.x = rnd.random() * config.width;
      particle.y = rnd.random() * config.height;
      particle.vx = 0;
      particle.vy = 0;
    }
  }

  return { outOfBounds };
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
