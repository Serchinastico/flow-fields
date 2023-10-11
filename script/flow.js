import * as noise from "./lib/noise";
import rnd from "./random";

/**
 * Defines a flow field given a bitmap. The resulting vector for a specific
 * point in space is the average value of its Red, Green and Blue components
 * so it scales with the pixel luminosity.
 *
 * @param {{bitmap: number[][][]}} data
 * @param data.bitmap Bitmap expressed as [x][y][c] where c is 0 for Red,
 * 1 for Blue and 2 for Green
 * @returns {(x: number, y: number) => number}
 */
const getFlowVectorFromBitmapFn =
  ({ bitmap }) =>
  (x, y) => {
    const fx = Math.min(bitmap.length - 1, Math.floor(x));
    const fy = Math.min(bitmap[0].length - 1, Math.floor(y));

    return (
      ((bitmap[fx][fy][0] + bitmap[fx][fy][1] + bitmap[fx][fy][2]) / 3 / 256) *
      Math.PI *
      2
    );
  };

/**
 * Defines a flow field using Perlin Noise with a given resolution
 *
 * @param {{resolution: number}} data
 * @param data.resolution The bigger this number, the further away the noise will
 * look like (less smooth)
 * @returns {(x: number, y: number) => number}
 * @link https://en.wikipedia.org/wiki/Perlin_noise
 */
const getPerlinNoiseVectorFn = ({ resolution }) => {
  const seed = rnd.random();
  noise.seed(seed);

  return {
    generationData: { resolution },
    fn: ({ resolution }, x, y) => {
      return noise.perlin2(x * resolution, y * resolution) * Math.PI * 2;
    },
  };
};

/**
 * Defines a flow field using Clifford Attractors.
 * Keep in mind this function returns yet another function
 * (hence the Fn suffix). This is because an attractor is defined
 * by 4 values (here chosen at random) that we must keep during the
 * whole simluation so we define those using a closure.
 *
 * @param {{resolution: number}} data
 * @param data.resolution The bigger this number, the further away the
 * flow field will look like
 * @returns {(x: number, y: number) => number}
 * @link https://paulbourke.net/fractals/clifford/
 */
const getAttractorVectorFn = ({ resolution }) => {
  const a = rnd.random() * 4 - 2;
  const b = rnd.random() * 4 - 2;
  const c = rnd.random() * 4 - 2;
  const d = rnd.random() * 4 - 2;

  return {
    generationData: { resolution, a, b, c, d },
    fn: ({ resolution, a, b, c, d }, x, y, width, height) => {
      // scale down x and y
      x = (x - width / 2) * resolution;
      y = (y - height / 2) * resolution;

      // attactor gives new x, y for old one.
      const x1 = Math.sin(a * y) + c * Math.cos(a * x);
      const y1 = Math.sin(b * x) + d * Math.cos(b * y);

      // find angle from old to new. that's the value.
      return Math.atan2(y1 - y, x1 - x);
    },
  };
};

/**
 * Defines a custom flow field function.
 *
 * @param {{customFn: string}} data
 * @param data.customFn A string definining a function that
 * takes x and y as parameters and returns an angle for the
 * flow vector in that position
 * @returns {(x: number, y: number) => number}
 */
const getCustomFlowFieldFn = ({ customFn }) => {
  return {
    generationData: { customFn },
    fn: ({ customFn }, x, y, width, height) => {
      const fn = eval(`(x, y, width, height) => { return ${customFn}; }`);
      return fn(x, y, width, height);
    },
  };
};

/**
 * @param {"bitmap" | "perlin" | "attractor" | "custom"} type
 * @param {Object} data Depends on the specific type you are instantiating
 * @returns {(x: number, y: number, width: number, height: number) => number}
 */
export const getFlowField = (type, data) => {
  switch (type) {
    case "bitmap":
      return getFlowVectorFromBitmapFn(data);
    case "perlin":
      return getPerlinNoiseVectorFn(data);
    case "attractor":
      return getAttractorVectorFn(data);
    case "custom":
      return getCustomFlowFieldFn(data);
  }
};
