import Konva from "konva"

export class KonvaController {
  constructor() {
    this.stage = null;
    this.layer = null;
    this.tool = {
      enable: false,
      startPos: null,
      currentPos: null,
      endPos: null,
    }
    this.startDrawing = false;
    this.startTransform = false;
    this.items = [];
    this.currentItem = null;
    this.anchorTool = new Konva.Transformer({
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      rotateEnabled: false,
    })
  }

  initialize() {
    this.stage = new Konva.Stage({
      container: "konva-container",
      width: 800,
      height: 800,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.initializeStageEvents();
  }

  setEnableTool(bool) {
    this.tool.enable = bool;
  }

  resetTool() {
    this.tool = {
      ...this.tool,
      startDrawing: false,
      startPos: null,
      currentPos: null,
      endPos: null,
    }
  }

  activateAnchor(target) {
    this.anchorTool.nodes([target]);
    target.on("transformstart", e => {
      this.startTransform = true;
    });
    target.on("transformend", e => {
      this.startTransform = false;
    })

    this.layer.add(this.anchorTool);
  }

  initializeStageEvents() {
    this.stage.on('mousedown', e => {
      if(this.startTransform) return;
      if(!this.tool.enable) return;
      this.tool.startPos = this.stage.getPointerPosition();
      console.log("Start drawing");
      this.startDrawing = true;
      this.currentItem = new TextBox(this.tool.startPos.x, this.tool.startPos.y, 0, 0);
      this.layer.add(this.currentItem.getInstance());
      this.items.push(this.currentItem);
    });

    this.stage.on('mousemove', e => {
      if(!this.tool.enable) return;
      if(!this.startDrawing) return;
      this.tool.currentPos= this.stage.getPointerPosition();
      const w = this.tool.currentPos.x - this.tool.startPos.x;
      const h = this.tool.currentPos.y - this.tool.startPos.y;
      this.currentItem.getInstance().width(w);
      this.currentItem.getInstance().height(h);
    });

    this.stage.on('mouseup', e => {
      if(!this.tool.enable) return;
      this.tool.endPos = this.stage.getPointerPosition();
      this.startDrawing = false;
      this.activateAnchor(this.currentItem.getInstance());
    });
  }


}

class TextBox {
  constructor(x, y, width, height) {
    this.instance = new Konva.Rect({
      x,
      y,
      width,
      height,
      stroke: '#405bef',
      strokeWidth: 1,
    })
  }

  getInstance() {
    return this.instance;
  }
}