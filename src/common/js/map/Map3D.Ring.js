import * as THREE from "three";
import * as util from "./util";
import TWEEN from "@tweenjs/tween.js";

/**
 *
 * 该组件实现地图上分层色块
 * 继承{@link https://threejs.org/docs/#api/core/Object3D|THREE.Object3D}
 * @class
 *
 */

class Ring extends THREE.Object3D {
  constructor(pros) {
    super(pros);
    this.type = "Ring";
    this.name = pros.name;
    Object.assign(this.userData, pros);
    this.getGeometry(pros);
    setTimeout(() => {
      this.animation();
      setInterval(() => {
        this.update();
      }, 3000);
    }, 5000);

    Ring.count++;
  }

  /**
   *
   * 生成RingGroup
   *
   */
  getGeometry(opt) {
    for (let i = 0; i < 5; i++) {
      this.add(this.createGeo(opt));
    }
  }
  /**
   *
   * 生成Geometry
   *
   */
  createGeo(opt) {
    let geo = new THREE.RingBufferGeometry(0.5, 0.53, 30, 1);
    let material = new THREE.MeshBasicMaterial({
      color: opt.color,
      opacity: 1,
      transparent: true
    });
    let ring = new THREE.Mesh(geo, material);
    ring.position.set(opt.cp[0], opt.cp[1], 0.9);
    this.extendsFun(ring);
    return ring;
  }
  /**
   *
   *
   */
  animation() {
    this.children.forEach((item, index) => {
      item.setScale(
        { x: 1.5, y: 1.5, z: 1.5 },
        1000,
        (index + 1) * 200,
        null,
        this.resetScale
      );
      item.setPosition(
        { x: this.userData.cp[0], y: this.userData.cp[1], z: 5 },
        1000,
        (index + 1) * 200,
        null,
        this.resetPosition
      );
      item.setOpacity(
        { opacity: 0.1 },
        1000,
        (index + 1) * 200,
        null,
        this.resetOpacity
      );
    });
  }
  /**
   *
   * 几何体继承类的方法
   *
   */
  extendsFun(ring) {
    ring.setScale = this.setScale;
    ring.setPosition = this.setPosition;
    ring.setRotation = this.setRotation;
    ring.setOpacity = this.setOpacity;
    ring.setDepthTest = this.setDepthTest;
  }
  /**
   *
   * 更新当前实例的所有信息,包括但不限于position,color,scale,rotation
   *
   */
  update() {
    this.animation();
  }

  /**
   *
   * 重置scale
   *
   */
  resetScale(scale) {
    scale.set(1, 1, 1);
  }
  /**
   *
   * 重置opacity
   *
   */
  resetOpacity(material) {
    material.opacity = 1;
  }
  /**
   *
   * 重置position
   *
   */
  resetPosition(position) {
    position.set(position.x, position.y, 0);
  }
  /**
   *
   * 设置box的位置
   * @param {v3} [vector3] =>{x:0,y:0,z:0}
   * @param {number} [duration] => 动画完成时间
   * @param {number} [delay] => 动画延迟
   * @param {Tween.Easing} [easing] => 缓动函数
   * @param {callback} [callback] => 动画完成回调
   *
   */

  setPosition(v, time, delay, easing, callback) {
    if (time && typeof time === "number") {
      util.transition(this.position, v, time, delay, easing, callback);
      return;
    }
    this.position.set(v.x, v.y, v.z);
  }

  /**
   * 设置区域透明度
   * @param {number} opacity - 格式 0 - 1.0
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   */
  setOpacity(opacity, time, delay, easing, callback, item) {
    if (typeof time === "number") {
      util.transition(
        this.material,
        opacity,
        time,
        delay,
        easing,
        callback,
        item
      );
      return;
    }
  }
  /**
   * 设置区域旋转
   * @param {v3} v3 - 格式{x:0,y:0,z:0}
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   */
  setRotation(v3, time, delay, easing, callback) {
    v3.x = v3.x * (Math.PI / 180);
    v3.y = v3.y * (Math.PI / 180);
    v3.z = v3.z * (Math.PI / 180);
    util.transition(this.rotation, v3, time, delay, easing, callback);
  }
  /**
   * 设置区域大小
   * @param {v3} v3 - 格式{x:0,y:0,z:0}
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   */
  setScale(v3, time, delay, easing, callback) {
    if (time && typeof time === "number")
      util.transition(this.scale, v3, time, delay, easing, callback);
    else this.scale.set(v3.x, v3.y, v3.z);
  }
  /**
   * 设置区域depthTest
   * @param {boolean} depthTest - 格式 true|false
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   */
  setDepthTest(depthTest, time, delay, easing, callback) {
    if (typeof time === "number") {
      util.transition(this.material, depthTest, time, delay, easing, callback);
      return;
    }
  }

  /**
   * 鼠标移出事件
   * @param dispatcher
   * @param event
   * @example
   *
   */
  onmouseout(dispatcher, event) {
    dispatcher.dispatchEvent({
      type: "mouseout",
      target: this,
      orgEvent: event
    });
  }
  /**
   * 鼠标移入事件
   * @param dispatcher
   * @param event
   * @example
   *
   */
  onmouseover(dispatcher, event) {
    //区域移入高度
    console.log("移入");
    dispatcher.dispatchEvent({
      type: "mouseover",
      target: this,
      orgEvent: event
    });
  }
  /**
   * 鼠标单击事件
   * @param dispatcher
   * @param event
   * @example
   *
   */
  onmousedown(dispatcher, event) {
    dispatcher.dispatchEvent({
      type: "mousedown",
      target: this,
      orgEvent: event
    });
  }
}

Ring.count = 0;

export default Ring;
