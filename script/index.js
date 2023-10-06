/**
 * @link https://medium.com/@bit101/flow-fields-part-i-3ebebc688fd8
 */

import { form } from "./form";

const fillPoints = (points, count) => {
  points.splice(0, points.length);

  for (let i = 0; i < count; i += 1) {
    points.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
    });
  }
};

const main = () => {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const flowCanvas = document.querySelector("#flow-canvas");
  const flowContext = flowCanvas.getContext("2d", { willReadFrequently: true });
  flowCanvas.width = window.innerWidth;
  flowCanvas.height = window.innerHeight;

  let renderFrameId = -1;
  const f = form();

  const points = [];
  let step = 0;
  fillPoints(points, f.getConfig().numPoints);
  context.lineWidth = f.getConfig().penWidth;

  document.querySelector("#restart").addEventListener("click", () => {
    f.refreshConfig();

    step = 0;
    fillPoints(points, f.getConfig().numPoints);
    context.lineWidth = f.getConfig().penWidth;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    cancelAnimationFrame(renderFrameId);
    render();
  });

  const renderFlow = () => {
    const previousStrokeStyle = flowContext.strokeStyle;
    flowContext.lineWidth = 1;
    flowContext.strokeStyle = "#222";

    for (let x = 0; x < window.innerWidth; x += 10) {
      for (let y = 0; y < window.innerHeight; y += 10) {
        const value = f.getConfig().flowFieldFn(x, y);

        flowContext.save();
        flowContext.translate(x, y);
        flowContext.rotate(value);
        flowContext.beginPath();
        flowContext.moveTo(0, 0);
        flowContext.lineTo(10, 0);
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

  let currentColor = f.getConfig().gradientFn(step / f.getConfig().maxSteps);
  const render = () => {
    points.forEach((point) => {
      /**
       * 1. Update the point velocity according to its position
       *    following the field vectors
       * 2. Move the point according to its velocity and trace a path
       * 3. Reduce the velocity of the point (simulating friction)
       * 4. Update point position if it went out of bounds making
       *    the plane a continuum
       */
      const value = f.getConfig().flowFieldFn(point.x, point.y);
      context.strokeStyle = currentColor;

      point.vx += Math.cos(value) * f.getConfig().force;
      point.vy += Math.sin(value) * f.getConfig().force;

      context.beginPath();
      context.moveTo(point.x, point.y);

      point.x += point.vx;
      point.y += point.vy;
      context.lineTo(point.x, point.y);
      context.stroke();

      point.vx *= 1 - f.getConfig().friction;
      point.vy *= 1 - f.getConfig().friction;

      if (point.x > width) point.x = 0;
      if (point.y > height) point.y = 0;
      if (point.x < 0) point.x = width;
      if (point.y < 0) point.y = height;
    });

    step += 1;

    currentColor = f.getConfig().gradientFn(step / f.getConfig().maxSteps);

    if (f.getConfig().maxSteps === 0 || step < f.getConfig().maxSteps) {
      renderFrameId = requestAnimationFrame(render);
    }

    if (f.getConfig().forceReduction > 0) {
      f.getConfig().force *= 1 - f.getConfig().forceReduction;
    }
  };

  renderFrameId = requestAnimationFrame(render);
};

document.addEventListener("DOMContentLoaded", main);
