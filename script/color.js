import chroma from "./chroma";

const easeOutSine = (x) => {
  return Math.sin((x * Math.PI) / 2);
};

/**
 * Returns a chroma scale for the selected colors in CSV format.
 * I'm using this format because it's an easy way to load coolors
 * palettes.
 *
 * @param {string} colors
 * @see https://coolors.co/palettes/trending
 */
const getChromaScaleFromCSV = (colors) => {
  const colorsArray = colors.split(", ");

  const colorsDomain = [];
  for (let i = 0; i < colorsArray.length; i += 1) {
    colorsDomain.push(i / colorsArray.length);
  }

  return chroma
    .scale(colorsArray)
    .domain(colorsDomain.map((i) => easeOutSine(i)))
    .mode("lab");
};

export const getGradient = (colorPalette) => {
  switch (colorPalette) {
    case "black":
      return () => chroma("#000");
    case "magenta":
      return () => chroma("magenta");
    case "cyan":
      return () => chroma("cyan");
    case "yellow":
      return () => chroma("yellow");
    case "spectral":
      return chroma.scale("Spectral");
    case "forest":
      return getChromaScaleFromCSV(
        "#386641, #6a994e, #a7c957, #f2e8cf, #bc4749"
      );
    case "pastel":
      return getChromaScaleFromCSV(
        "#264653, #2a9d8f, #e9c46a, #f4a261, #e76f51"
      );
    case "fire":
      return getChromaScaleFromCSV(
        "#03071e, #370617, #6a040f, #9d0208, #d00000, #dc2f02, #e85d04, #f48c06, #faa307, #ffba08"
      );
  }
};
