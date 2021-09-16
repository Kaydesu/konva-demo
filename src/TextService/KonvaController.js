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
          if (!this.startTransform) return;
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
          ReactDOM.render(
            <TexboxController
              id={this.currentItem.getInstance()._id}
              onConfirm={this.confirm.bind(this)}
              onRemove={this.remove.bind(this)}
            />,
            this.currentItem.getControlElement()
          );
          this.currentItem.getInstance().strokeWidth(0);
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
    if (this.isAnchorSelected(target)) return;
    this.currentItem = this.items.find(item => item.getInstance()._id === target._id);
    this.anchorTool.nodes([target]);
  }

  isAnchorSelected(target) {
    return target.parent === this.anchorTool;
  }

  add(target) {
    this.layer.add(target);
  }

  confirm(id) {
    const target = this.items.find(item => item.getInstance()._id === id);
    target.confirm();
    this.layer.add(target.text);
  }

  remove(id) {
    const target = this.items.find(item => item.getInstance()._id === id);
    target.remove();
    target.getInstance().remove();
    if (this.currentItem && this.currentItem.getInstance()._id === id) {
      this.currentItem = null;
      this.anchorTool.remove();
    }
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
      fill: "rgba(0, 0, 0, 0.2)",
      draggable: true,
    });

    this.text = new Konva.Text();

    this.controlElement = null;
    this.textArea = null;
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
    this.controlElement.addEventListener("mousedown", e => {
      e.stopPropagation();
    });
    this.textArea = document.createElement("textarea");
    this.textArea.className = "text-tool-textarea";
    this.updateControllerPosition()
    stage.content.appendChild(this.controlElement);
    stage.content.appendChild(this.textArea);
    this.textArea.focus();
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

    const padding = this.getPadding();

    this.textArea.style.left = `${padding.left}px`;
    this.textArea.style.top = `${padding.top}px`;
    this.textArea.style.width = `${padding.width}px`;
    this.textArea.style.height = `${padding.height}px`;
  }

  getPadding() {
    const x = this.instance.position().x;
    const y = this.instance.position().y;
    const w = this.instance.getSize().width;
    const h = this.instance.getSize().height;

    return {
      left: x + 10,
      top: y + 10,
      width: w - 20,
      height: h - 20,
    }
  }

  confirm() {
    const padding = this.getPadding();
    this.text.text(this.textArea.value);
    this.text.x(padding.left);
    this.text.y(padding.top);
    this.text.width(padding.width);
    this.text.height(padding.height);
    this.textArea.remove();
  }

  remove() {
    this.controlElement.remove();
    this.textArea.remove();
  }
}