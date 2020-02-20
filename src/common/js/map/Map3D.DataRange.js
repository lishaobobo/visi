import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import * as util from "./util";

/**
 * 数据范围
 * @class
 * @extends THREE.Mesh
 */
class DataRange extends THREE.Object3D {
  constructor(pros) {
    super(pros);
    this.type = "DataRange";
    this.name = pros.name;
    Object.assign(this.userData, pros);
    let boxGeo = new THREE.BoxGeometry(
      pros.width,
      pros.height,
      pros.extrudeHeight
    );
    let boxMate = new THREE.MeshPhongMaterial({ color: pros.color });
    let range = new THREE.Mesh(boxGeo, boxMate);

    this.position.y =
      this.position.y - DataRange.count * (pros.height + pros.spacing);
    if (pros.showName) {
      let txt = Font3D.create(pros.name, { color: "#ffffff" });
      txt.position.copy(range.position);
      txt.position.y = txt.position.y - 0.3;
      txt.position.add(pros.namePosition);
      this.add(txt);
      this.txt = txt;
    }

    this.mesh = range;
    this.add(range);
    DataRange.count++;
  }

  /**
   * 选中并返回其关联区域
   * @returns {Area[]}
   */
  select() {
    return this.rangeAreas.map(area => {
      area.setColor(this.userData.hoverColor);
      if (area.userData.hasHoverHeight) {
        new TWEEN.Tween(area.position)
          .to(
            { z: area.userData.extrude.depth / 2 },
            area.userData.hoverAnimaTime
          )
          .start();
      }
    });
  }

  /**
   * 取消选中状态
   */
  unselect() {
    this.rangeAreas.map(area => {
      area.setColor(this.userData.color);
      if (area.userData.hasHoverHeight) {
        new TWEEN.Tween(area.position)
          .to({ z: 0 }, area.userData.hoverAnimaTime)
          .start();
      }
    });
  }
  onmouseout(dispatcher, event) {
    this.unselect();
    new TWEEN.Tween(this.mesh.material.color)
      .to(
        new THREE.Color(util.colorToHex(this.userData.color)),
        this.userData.hoverAnimaTime
      )
      .start();
    if (!this.userData.hasEvent) return;
    dispatcher.dispatchEvent({
      type: "mouseout",
      target: this,
      orgEvent: event
    });
  }
  onmouseover(dispatcher, event) {
    this.select();
    new TWEEN.Tween(this.mesh.material.color)
      .to(
        new THREE.Color(util.colorToHex(this.userData.hoverColor)),
        this.userData.hoverAnimaTime
      )
      .start();
    if (!this.userData.hasEvent) return;
    dispatcher.dispatchEvent({
      type: "mouseover",
      target: this,
      orgEvent: event
    });
  }
  onmousedown(dispatcher, event) {
    if (!this.userData.hasEvent) return;
    dispatcher.dispatchEvent({
      type: "mousedown",
      target: this,
      orgEvent: event
    });
  }
}
/**
 * 数据范围数量
 * @static
 * @type {number}
 */
DataRange.count = 0;

export default DataRange;
