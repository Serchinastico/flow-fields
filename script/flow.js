import * as noise from "./lib/noise";
import rnd from "./random";
import chroma from "./lib/chroma";

export const getPixel = (imageData, x, y) => {
  return chroma(
    imageData.data[4 * (x + y * imageData.width)],
    imageData.data[4 * (x + y * imageData.width) + 1],
    imageData.data[4 * (x + y * imageData.width) + 2]
  );
};

/**
 * Defines a flow field given a bitmap. The resulting vector for a specific
 * point in space is the result of adding all vectors for all neighbors, weighted
 * by their different in luminance. That is, it tries to go from brigher
 * colors to darker ones.
 *
 * @param {{imageData: ImageData}} data
 * @returns {(generationData: Object, x: number, y: number, width: number, height: number) => number}
 */
const getFlowVectorFromImageFn = ({ imageData }) => {
  return {
    generationData: { imageData },
    fn: ({ imageData }, x, y, width, height) => {
      const px = Math.min(imageData.width - 1, Math.floor(x));
      const py = Math.min(imageData.height - 1, Math.floor(y));

      const luminance = getPixel(imageData, px, py).luminance();

      let luminanceDirection = { x: 0, y: 0 };

      for (let dx = -1; dx < 2; dx++) {
        for (let dy = -1; dy < 2; dy++) {
          const dpx = px + dx;
          const dpy = py + dy;

          if (dpx > 0 && dpy > 0 && dpx < width && dpy < height) {
            const neighbourLuminance = getPixel(
              imageData,
              dpx,
              dpy
            ).luminance();

            const luminanceDiff = luminance - neighbourLuminance;
            luminanceDirection.x += luminanceDiff * dx;
            luminanceDirection.y += luminanceDiff * dy;
          }
        }
      }

      const force =
        20 *
        Math.sqrt(
          luminanceDirection.x * luminanceDirection.x +
            luminanceDirection.y * luminanceDirection.y
        );

      return {
        force,
        angle: Math.atan2(luminanceDirection.x, luminanceDirection.y),
      };
    },
  };
};

/**
 * Defines a flow field using Perlin Noise with a given resolution
 *
 * @param {{resolution: number}} data
 * @param data.resolution The bigger this number, the further away the noise will
 * look like (less smooth)
 * @returns {(generationData: Object, x: number, y: number) => number}
 * @link https://en.wikipedia.org/wiki/Perlin_noise
 */
const getPerlinNoiseVectorFn = ({ resolution }) => {
  const seed = rnd.random();
  noise.seed(seed);

  return {
    generationData: { resolution },
    fn: ({ resolution }, x, y) => {
      return {
        force: 1,
        angle: noise.perlin2(x * resolution, y * resolution) * Math.PI * 2,
      };
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
 * @returns {(generationData: Object, x: number, y: number, width: number, height: number) => number}
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
      return { force: 1, angle: Math.atan2(y1 - y, x1 - x) };
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
 * @returns {(generationData: Object, x: number, y: number, width: number, height: number) => number}
 */
const getCustomFlowFieldFn = ({ customFn }) => {
  return {
    generationData: { customFn },
    fn: ({ customFn }, x, y, width, height) => {
      const fn = eval(`(x, y, width, height) => { return ${customFn}; }`);
      return { force: 1, angle: fn(x, y, width, height) };
    },
  };
};

/**
 * @param {"image" | "perlin" | "attractor" | "custom"} type
 * @param {Object} data Depends on the specific type you are instantiating
 * @returns {(x: number, y: number, width: number, height: number) => number}
 */
export const getFlowField = (type, data) => {
  switch (type) {
    case "image":
      return getFlowVectorFromImageFn(data);
    case "perlin":
      return getPerlinNoiseVectorFn(data);
    case "attractor":
      return getAttractorVectorFn(data);
    case "custom":
      return getCustomFlowFieldFn(data);
  }
};
