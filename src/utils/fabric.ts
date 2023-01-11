import { fabric } from "fabric";

const renderIcon = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  styleOverride: any,
  fabricObject: fabric.Object,
  width: number,
  height: number,
  imgSrc: string
) => {
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
  const img = document.createElement("img");
  img.src = imgSrc;
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
};

const drawControls = () => {
  fabric.Object.prototype.controls.ml = new fabric.Control({
    x: -0.5,
    y: 0,
    offsetX: -1,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
    //@ts-ignore
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        20,
        25,
        "/controls/middlecontrol.svg"
      );
    }
  });

  fabric.Object.prototype.controls.mr = new fabric.Control({
    x: 0.5,
    y: 0,
    offsetX: 1,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
    //@ts-ignore
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        20,
        25,
        "/controls/middlecontrol.svg"
      );
    }
  });

  fabric.Object.prototype.controls.mb = new fabric.Control({
    x: 0,
    y: 0.5,
    offsetY: 1,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
    //@ts-ignore
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        25,
        20,
        "/controls/middlecontrolhoz.svg"
      );
    }
  });

  fabric.Object.prototype.controls.mt = new fabric.Control({
    x: 0,
    y: -0.5,
    offsetY: -1,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleSkewCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
    //@ts-ignore
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        25,
        20,
        "/controls/middlecontrolhoz.svg"
      );
    }
  });

  fabric.Object.prototype.controls.tl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        25,
        25,
        "/controls/edgecontrol.svg"
      );
    }
  });

  fabric.Object.prototype.controls.tr = new fabric.Control({
    x: 0.5,
    y: -0.5,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        25,
        25,
        "/controls/edgecontrol.svg"
      );
    }
  });

  fabric.Object.prototype.controls.bl = new fabric.Control({
    x: -0.5,
    y: 0.5,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        25,
        25,
        "/controls/edgecontrol.svg"
      );
    }
  });

  fabric.Object.prototype.controls.br = new fabric.Control({
    x: 0.5,
    y: 0.5,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        25,
        25,
        "/controls/edgecontrol.svg"
      );
    }
  });

  fabric.Object.prototype.controls.mtr = new fabric.Control({
    x: 0,
    y: 0.5,
    //@ts-ignore
    cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
    //@ts-ignore
    actionHandler: fabric.controlsUtils.rotationWithSnapping,
    offsetY: 30,
    withConnection: false,
    actionName: "rotate",
    render: (ctx, left, top, override, obj) => {
      renderIcon(
        ctx,
        left,
        top,
        override,
        obj,
        40,
        40,
        "/controls/rotateicon.svg"
      );
    }
  });
};

export const initializeFabric = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  backgroundColor: string
) => {
  const fCanvas = new fabric.Canvas(canvas, {
    width,
    height,
    backgroundColor,
    preserveObjectStacking: true,
    stateful: true,
    selection: false,
    controlsAboveOverlay: true,
    selectionColor: "#2e73fc10",
    selectionBorderColor: "#629bff80",
    selectionLineWidth: 1.5
  });

  fabric.Object.prototype.set({
    transparentCorners: false,
    borderColor: "#51B9F9",
    cornerColor: "#FFF",
    borderScaleFactor: 2.5,
    cornerStyle: "circle",
    cornerStrokeColor: "#0E98FC",
    borderOpacityWhenMoving: 1
  });

  // FIXME: Controls don't initialize immediately - only after moving the object around
  drawControls();

  return fCanvas;
};
