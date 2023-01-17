import { fabric } from "fabric";
import { SNAP_CHECK_DIRECTION } from "../utils/constants";

export const checkVSnap = (
  lineV: fabric.Line | null,
  artBoardLeft: number,
  artBoardWidth: number,
  a: number,
  b: number,
  snapZone: number,
  e: fabric.IEvent<MouseEvent>,
  type: number
) => {
  if (a > b - snapZone && a < b + snapZone) {
    const height = e.target?.get("height") as number;
    const scaleY = e.target?.get("scaleY") as number;
    lineV!.opacity = 1;
    lineV?.bringToFront();
    let value = b;

    if (type == SNAP_CHECK_DIRECTION.BOTTOM) {
      value = b - (height * scaleY) / 2;
    } else if (type == SNAP_CHECK_DIRECTION.TOP) {
      value = b + (height * scaleY) / 2;
    }

    e.target
      ?.set({
        top: value
      })
      .setCoords();
    lineV!
      .set({
        y1: b,
        x1: artBoardLeft,
        y2: b,
        x2: artBoardWidth + artBoardLeft
      })
      .setCoords();
  }
};

export const checkHSnap = (
  lineH: fabric.Line | null,
  artBoardTop: number,
  artBoardHeight: number,
  a: number,
  b: number,
  snapZone: number,
  e: fabric.IEvent<MouseEvent>,
  type: number
) => {
  if (a > b - snapZone && a < b + snapZone) {
    const width = e.target?.get("height") as number;
    const scaleX = e.target?.get("scaleX") as number;
    lineH!.opacity = 1;
    lineH?.bringToFront();
    let value = b;

    if (type == SNAP_CHECK_DIRECTION.BOTTOM) {
      value = b - (width * scaleX) / 2;
    } else if (type == SNAP_CHECK_DIRECTION.TOP) {
      value = b + (width * scaleX) / 2;
    }

    e.target
      ?.set({
        left: value
      })
      .setCoords();
    lineH!
      .set({
        x1: b,
        y1: artBoardTop,
        x2: b,
        y2: artBoardHeight + artBoardTop
      })
      .setCoords();
  }
};

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

  fCanvas.on("object:rotating", (e) => {
    if (e.e.shiftKey) fCanvas.getActiveObject()!.snapAngle = 15;
    else fCanvas.getActiveObject()!.snapAngle = 0;
    e.target!.hasControls = false;
  });

  fCanvas.on("object:modified", (e) => {
    e.target!.hasControls = true;
    fCanvas.renderAll();
  });

  return fCanvas;
};

export const getObjectById = (
  fabricCanvas: fabric.Canvas | null,
  id: string
) => {
  let object = null;
  const allObjects = fabricCanvas!.getObjects();
  for (let i = 0; i < fabricCanvas!.size(); i++) {
    if (allObjects[i].get("type") == "group") {
      //@ts-ignore
      if (allObjects[i].get("id") && allObjects[i].get("id") === id) {
        object = allObjects[i];
        break;
      }
      const wip = i;
      //@ts-ignore
      for (let o = 0; o < allObjects[i]._objects.length; o++) {
        if (
          //@ts-ignore
          allObjects[wip]._objects[o].id &&
          //@ts-ignore
          allObjects[wip]._objects[o].id === id
        ) {
          //@ts-ignore
          object = allObjects[wip]._objects[o];
          break;
        }
      }
      //@ts-ignore
    } else if (allObjects[i].id && allObjects[i].id === id) {
      object = allObjects[i];
      break;
    }
  }
  return object;
};
