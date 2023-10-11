import simplify from "./lib/simplifyPath";
import * as fitCurve from "./lib/fitCurve";
import { simulateTick } from "./simulation";
import { createParticles } from "./simulation";
import rnd from "./random";
import { deserializeConfig } from "./form";

const SIMPLIFY_TOLERANCE = 10;
const CURVE_FITTING_ERROR = 200;

/**
 * Simulates all particles and exports their motion to SVG format
 * @returns {string} SVG contents
 */
onmessage = ({ data }) => {
  const config = deserializeConfig(data);

  rnd.reset();

  const particles = createParticles(config);
  const paths = [];

  /**
   * We first simulate all particles and store their paths in an array
   */
  let currentPathIndex = 0;
  for (const particle of particles) {
    paths.push([]);

    for (let step = 0; step < config.maxSteps; step++) {
      const { didWrap } = simulateTick(particle, config);

      if (didWrap) {
        /**
         * The particle went around the screen so we finish the
         * current path and create a new one to prevent ugly artifacts
         */
        paths.push([{ x: particle.x, y: particle.y }]);
        currentPathIndex += 1;
      } else {
        paths[currentPathIndex].push({ x: particle.x, y: particle.y });
      }
    }

    currentPathIndex += 1;
  }

  const curvePaths = paths
    .map((path) => simplify(path, SIMPLIFY_TOLERANCE))
    .map((path) =>
      fitCurve(
        path.map((p) => [p.x, p.y]),
        CURVE_FITTING_ERROR
      )
    )
    .filter((path) => path.length > 0);

  let svg = `<svg width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">\n`;
  for (const path of curvePaths) {
    const firstCurve = path[0];

    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
     */
    svg += `\t<path stroke-width="0.1" d="M ${firstCurve[0][0]} ${firstCurve[0][1]} `;
    for (const curve of path) {
      svg += `C ${curve[1][0]} ${curve[1][1]}, ${curve[2][0]} ${curve[2][1]}, ${curve[3][0]} ${curve[3][1]} `;
    }
    svg += `" stroke="black" fill="none" />\n`;
  }
  svg += `</svg>`;

  postMessage(svg);
};
