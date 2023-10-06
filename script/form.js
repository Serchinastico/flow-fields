import { getGradient } from "./color";
import { getFlowField } from "./flow";
import { hideNode, showNode } from "./dom";

export const form = () => {
  const form = document.querySelector("#form");
  const maxStepsInput = document.querySelector("#max-steps");
  const numPointsInput = document.querySelector("#num-points");
  const forceInput = document.querySelector("#force");
  const forceReductionInput = document.querySelector("#force-reduction");
  const frictionInput = document.querySelector("#friction");
  const penWidthInput = document.querySelector("#pen-width");
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

  const getConfig = () => {
    const baseConfig = {
      maxSteps: Number.parseInt(maxStepsInput.value),
      numPoints: Number.parseInt(numPointsInput.value),
      force: Number.parseFloat(forceInput.value),
      forceReduction: Number.parseFloat(forceReductionInput.value),
      friction: Number.parseFloat(frictionInput.value),
      penWidth: Number.parseFloat(penWidthInput.value),
      gradientFn: getGradient(colorPaletteInput.value),
      flowFieldFunction: flowFieldFunctionInput.value,
      resolution: Number.parseFloat(resolutionInput.value),
      customFlowFieldFunction: customFlowFieldFunctionInput.value,
    };

    baseConfig.flowFieldFn = getFlowField(baseConfig.flowFieldFunction, {
      resolution: baseConfig.resolution,
      customFn: baseConfig.customFlowFieldFunction,
    });

    return baseConfig;
  };

  let config = getConfig();

  flowFieldFunctionInput.addEventListener("change", () => {
    switch (flowFieldFunctionInput.value) {
      case "custom":
        hideNode(resolutionContainer);
        showNode(customFlowFieldFunctionContainer);
        break;
      case "perlin":
        showNode(resolutionContainer);
        hideNode(customFlowFieldFunctionContainer);
        break;
      case "attractor":
        showNode(resolutionContainer);
        hideNode(customFlowFieldFunctionContainer);
        break;
    }
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
    refreshConfig: () => (config = getConfig()),
  };
};
