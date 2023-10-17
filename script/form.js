import { getGradient } from "./color";
import { getFlowField } from "./flow";
import { hideNode, showNode } from "./dom";
import rnd from "./random";
import JSONfn from "./lib/jsonfn";

/**
 * Serialies the unserializable fields in the config by transforming
 * the function definitions to a string using JSON
 */
export const serializeConfig = (config) => {
  return {
    ...config,
    gradientFn: JSONfn.stringify(config.gradientFn),
    customFlowFieldFunction: JSONfn.stringify(config.customFlowFieldFunction),
    flowFieldFn: JSONfn.stringify(config.flowFieldFn),
  };
};

export const deserializeConfig = (config) => {
  return {
    ...config,
    gradientFn: JSONfn.parse(config.gradientFn),
    customFlowFieldFunction: JSONfn.parse(config.customFlowFieldFunction),
    flowFieldFn: JSONfn.parse(config.flowFieldFn),
  };
};

const getImageData = (image) => {
  const imageCanvas = document.querySelector("#image-canvas");
  const imageContext = imageCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  imageCanvas.width = window.innerWidth;
  imageCanvas.height = window.innerHeight;

  imageContext.drawImage(image, 0, 0, window.innerWidth, window.innerHeight);
  return imageContext.getImageData(0, 0, window.innerWidth, window.innerHeight);
};

export const form = () => {
  const form = document.querySelector("#form");
  const imageNode = document.querySelector("#image");
  const maxStepsInput = document.querySelector("#max-steps");
  const numPointsInput = document.querySelector("#num-points");
  const forceInput = document.querySelector("#force");
  const forceReductionInput = document.querySelector("#force-reduction");
  const frictionInput = document.querySelector("#friction");
  const seedInput = document.querySelector("#seed");
  const randomizeSeedInput = document.querySelector("#randomize-seed");
  const minPenWidthInput = document.querySelector("#min-pen-width");
  const maxPenWidthInput = document.querySelector("#max-pen-width");
  const colorPaletteInput = document.querySelector("#color-palette");
  const flowFieldFunctionInput = document.querySelector("#flow-field-function");
  const resolutionContainer = document.querySelector("#resolution-container");
  const resolutionInput = document.querySelector("#resolution");
  const customFlowFieldFunctionContainer = document.querySelector(
    "#custom-flow-field-function-container"
  );
  const customFlowFieldFunctionInput = document.querySelector(
    "#custom-flow-field-function"
  );
  const sourceImageContainer = document.querySelector(
    "#source-image-container"
  );
  const sourceImageInput = document.querySelector("#source-image");

  const resetSeed = () => {
    if (randomizeSeedInput.checked) {
      rnd.newSeed();

      seedInput.value = rnd.getSeed();
    } else {
      rnd.setSeed(rnd.getSeed());
    }
  };

  const readConfig = () => {
    const baseConfig = {
      width: window.innerWidth,
      height: window.innerHeight,
      maxSteps: Number.parseInt(maxStepsInput.value),
      numPoints: Number.parseInt(numPointsInput.value),
      force: Number.parseFloat(forceInput.value),
      forceReduction: Number.parseFloat(forceReductionInput.value),
      friction: Number.parseFloat(frictionInput.value),
      minPenWidth: Number.parseFloat(minPenWidthInput.value),
      maxPenWidth: Number.parseFloat(maxPenWidthInput.value),
      gradientFn: getGradient(colorPaletteInput.value),
      flowFieldFunction: flowFieldFunctionInput.value,
      resolution: Number.parseFloat(resolutionInput.value),
      customFlowFieldFunction: customFlowFieldFunctionInput.value,
      sourceImage: sourceImageInput.value,
      seed: Number.parseInt(seedInput.value),
    };

    const { generationData, fn } = getFlowField(flowFieldFunctionInput.value, {
      resolution: baseConfig.resolution,
      imageData:
        baseConfig.sourceImage !== null ? getImageData(imageNode) : null,
      customFn: baseConfig.customFn,
    });

    baseConfig.flowFieldFnData = generationData;
    baseConfig.flowFieldFn = fn;

    return baseConfig;
  };

  resetSeed();
  let config = readConfig();

  flowFieldFunctionInput.addEventListener("change", () => {
    switch (flowFieldFunctionInput.value) {
      case "perlin":
        showNode(resolutionContainer);
        hideNode(customFlowFieldFunctionContainer);
        hideNode(sourceImageContainer);
        break;
      case "clifford-attractor":
        showNode(resolutionContainer);
        hideNode(customFlowFieldFunctionContainer);
        hideNode(sourceImageContainer);
        break;
      case "image":
        hideNode(resolutionContainer);
        hideNode(customFlowFieldFunctionContainer);
        showNode(sourceImageContainer);
        break;
      case "custom":
        hideNode(resolutionContainer);
        showNode(customFlowFieldFunctionContainer);
        hideNode(sourceImageContainer);
        break;
    }
  });

  sourceImageInput.addEventListener("change", (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      imageNode.src = event.target.result;
    };

    reader.readAsDataURL(selectedFile);
  });

  const minimize = document.querySelector("#minimize");
  const maximize = document.querySelector("#maximize");
  [minimize, maximize].forEach((node) => {
    node.addEventListener("click", () => {
      form.classList.toggle("dn");
      form.classList.toggle("flex");
      minimize.classList.toggle("dn");
      maximize.classList.toggle("dn");
    });
  });

  return {
    getConfig: () => config,
    refreshConfig: () => {
      resetSeed();
      config = readConfig();
    },
  };
};
