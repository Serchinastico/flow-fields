/**
 * @link https://medium.com/@bit101/flow-fields-part-i-3ebebc688fd8
 */

import { form, serializeConfig } from "./form";
import { renderFrame } from "./render";
import { createParticles } from "./simulation";
import { downloadFile } from "./download";

const main = () => {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  /**
   * @type {HTMLCanvasElement}
   */
  const flowCanvas = document.querySelector("#flow-canvas");
  const flowContext = flowCanvas.getContext("2d");
  flowCanvas.width = window.innerWidth;
  flowCanvas.height = window.innerHeight;

  const svgWorker = new Worker(new URL("svg.js", import.meta.url), {
    type: "module",
  });
  let renderFrameId = -1;
  const f = form();
  let step = 0;
  let particles = createParticles(f.getConfig());

  document.querySelector("#restart").addEventListener("click", () => {
    f.refreshConfig();

    step = 0;
    particles = createParticles(f.getConfig());

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    cancelAnimationFrame(renderFrameId);
    render();
  });

  const renderFlow = () => {
    const config = f.getConfig();

    flowContext.clearRect(0, 0, config.width, config.height);

    if (config.flowFieldFunction === "image") {
      flowContext.putImageData(config.flowFieldFnData.imageData, 0, 0);
    }

    const resolution = 16;
    const previousStrokeStyle = flowContext.strokeStyle;
    flowContext.lineWidth = 1;
    flowContext.strokeStyle = "#FA0F22";

    for (let x = 0; x < window.innerWidth; x += resolution) {
      for (let y = 0; y < window.innerHeight; y += resolution) {
        const { force, angle } = config.flowFieldFn(
          config.flowFieldFnData,
          x,
          y,
          config.width,
          config.height
        );

        flowContext.save();
        flowContext.translate(x, y);
        flowContext.rotate(angle);
        flowContext.beginPath();
        flowContext.moveTo(0, 0);
        flowContext.lineTo(resolution * force, 0);
        flowContext.lineTo(resolution * force - 4, -4);
        flowContext.moveTo(resolution * force, 0);
        flowContext.lineTo(resolution * force - 4, 4);
        flowContext.stroke();
        flowContext.restore();
      }
    }

    flowContext.strokeStyle = previousStrokeStyle;
  };

  const toggleFlowVisibilityTurnOnIcon = document.querySelector(
    "#toggle-flow-visibility #turn-on"
  );
  const toggleFlowVisibilityTurnOffIcon = document.querySelector(
    "#toggle-flow-visibility #turn-off"
  );
  document
    .querySelector("#toggle-flow-visibility")
    .addEventListener("click", () => {
      toggleFlowVisibilityTurnOnIcon.classList.toggle("dn");
      toggleFlowVisibilityTurnOffIcon.classList.toggle("dn");

      if (toggleFlowVisibilityTurnOnIcon.classList.contains("dn")) {
        renderFlow();
      } else {
        flowContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    });

  document.querySelector("#save").addEventListener("click", () => {
    svgWorker.postMessage(serializeConfig(f.getConfig()));
  });

  svgWorker.onmessage = ({ data: svg }) => {
    downloadFile(svg, "output.svg", "image/svg+xml");
  };

  const render = () => {
    renderFrame(context, step, particles, f.getConfig());

    step += 1;
    if (f.getConfig().maxSteps === 0 || step < f.getConfig().maxSteps) {
      renderFrameId = requestAnimationFrame(render);
    }
  };

  renderFrameId = requestAnimationFrame(render);
};

document.addEventListener("DOMContentLoaded", main);
