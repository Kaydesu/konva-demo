import Konva from "konva";
import ReactDOM from 'react-dom';
import TexboxController from "./TexboxController";

const MODE = {
  DRAW: "DRAWING",
  TRANSFORM: "TRANSFORM",
}

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
    this.startDraw = false;
    this.startTransform = false;
    this.startMove = false;
    this.items = [];
    this.currentItem = null;
    this.anchorTool = new Konva.Transformer({
      rotateEnabled: false,
      keepRatio: false,
      borderStroke: "#405bef",
      anchorStroke: "#405bef",
      anchorStrokeWidth: 1,
      anchorCornerRadius: 5,
      draggable: true,
    });
    this.mode = MODE.DRAW;
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

  activateAnchor(target) {
    this.anchorTool.nodes([target]);
    this.layer.add(this.anchorTool);
  }

  initializeStageEvents() {
    this.stage.on('mousedown', e => {
      console.log("hello konva");
      if (!this.tool.enable) return;
      this.selectTarget(e);
      switch (this.mode) {
        case MODE.DRAW: {
          this.tool.startPos = this.stage.getPointerPosition();
          this.currentItem = new TextBox(this.tool.startPos.x, this.tool.startPos.y, 0, 0);
          this.layer.add(this.currentItem.getInstance());
          this.items.push(this.currentItem);
          this.startDraw = true;
          break;
        }
        case MODE.TRANSFORM: {
          this.startTransform = true;
          break;
        }
      }
    });

    this.stage.on('mousemove', e => {
      if (!this.tool.enable) return;
      switch (this.mode) {
        case MODE.DRAW: {
          if (!this.startDraw) return;
          this.tool.currentPos = this.stage.getPointerPosition();
          const w = this.tool.currentPos.x - this.tool.startPos.x;
          const h = this.tool.currentPos.y - this.tool.startPos.y;
          this.currentItem.getInstance().width(w);
          this.currentItem.getInstance().height(h);
          break;
        }
        case MODE.TRANSFORM: {
          if(!this.startTransform) return;
          let w = this.anchorTool.getSize().width;
          let h = this.anchorTool.getSize().height;
          this.currentItem.getInstance().width(w);
          this.currentItem.getInstance().height(h);
          break;
        }
      }
    });

    this.stage.on('mouseup', e => {
      if (!this.tool.enable) return;
      switch (this.mode) {
        case MODE.DRAW: {
          this.tool.endPos = this.stage.getPointerPosition();
          this.activateAnchor(this.currentItem.getInstance());
          this.currentItem.buildControl(this.stage);
          ReactDOM.render(<TexboxController />, this.currentItem.getControlElement());
          this.mode = MODE.TRANSFORM;
          break;
        }
        case MODE.TRANSFORM: {
          this.startTransform = false;
          break;
        }
      }
    });
  }

  selectTarget(e) {
    if (e.evt.button !== 0) return;
    let target = e.target === this.stage ? null : e.target;
    if (!target) {
      this.mode = MODE.DRAW;
      return;
    }
    this.mode = MODE.TRANSFORM;
    if(this.isAnchorSelected(target)) return;
    this.currentItem = this.items.find(item => item.getInstance()._id === target._id);
    this.anchorTool.nodes([target]);
  }

  isAnchorSelected(target) {
    return target.parent === this.anchorTool;
  }

}

class TextBox {
  constructor(x, y, width, height) {
    this.instance = new Konva.Rect({
      x,
      y,
      width,
      height,
      stroke: "#405bef",
      strokeWidth: 1,
      draggable: true,
    });
    this.controlElement = null;
    this.onTransform();
  }

  getInstance() {
    return this.instance;
  }

  getControlElement() {
    return this.controlElement;
  }

  buildControl(stage) {
    this.controlElement = document.createElement("div");
    this.controlElement.style.position = "absolute";
    this.updateControllerPosition()
    stage.content.appendChild(this.controlElement);
  }

  onTransform() {
    this.instance.on("transform", this.updateControllerPosition.bind(this));
    this.instance.on("xChange", this.updateControllerPosition.bind(this));
    this.instance.on("yChange", this.updateControllerPosition.bind(this));
  }

  updateControllerPosition() {
    const x = this.instance.position().x;
    const y = this.instance.position().y;
    const w = this.instance.getSize().width;
    this.controlElement.style.left = `${x + w + 10}px`;
    this.controlElement.style.top = `${y}px`;
  }
}