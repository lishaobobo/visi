import * as THREE from "three";
import * as util from "./util";

/**
 *
 * 该组件实现地图上分层色块
 * 继承{@link https://threejs.org/docs/#api/core/Object3D|THREE.Object3D}
 * @class
 *
 * let opt ={
 *  name: 'name',
 *  hasLayer: true, //=> default:true
 *  coord: [23,807],
 *  color: '0xffffff', //=>16进制颜色,rgb,hsl
 *  scale: 4,
 *  value: 2,
 *  boxSize: 120
 * }
 *
 */

class Box extends THREE.Object3D {
  constructor(pros) {
    super(pros);
    this.type = "Mark";
    this.name = pros.name;
    Object.assign(this.userData, pros);

    this.add(this.getGeometry(pros));
    Box.count++;
  }

  /**
   *
   * 生成geometry
   *
   */
  getGeometry(opt) {
    let box = new THREE.BoxBufferGeometry(
      opt.boxSize,
      opt.boxSize,
      opt.boxSize
    );
    let material = new THREE.MeshBasicMaterial({
      color: opt.color
    });
    let cube = new THREE.Mesh(box, material);
    cube.position.set(opt.cp[0], opt.cp[1], 0);
    this.extendsFun(cube);
    setTimeout(() => {
      cube.setPosition(
        { x: opt.cp[0], y: opt.cp[1], z: opt.z },
        1000
      );
      // cube.setScale({x:0,y:0,z:0})
    }, 2300);
    return cube;
  }
  /**
   *
   * 几何体继承类的方法
   *
   */
  extendsFun(cube) {
    cube.setScale = this.setScale;
    cube.setPosition = this.setPosition;
    cube.setRotation = this.setRotation;
  }

  /**
   *
   * 更新当前示例的所有信息,包括position,color,scale,rotation
   *
   */
  update() {
    // this.position.set(this.userData.cp[0], this.userData.cp[1], this.index * 1.3 + 1.5);
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
   * 设置区域颜色
   * @param {color} color - 格式 0xff9933,'#ff9933','rgb(255,160,50)','hsl(340,100%,50%)'
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   */
  setColor(color, time, delay, easing, callback) {}
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

/**
 * 所有标注数量,静态属性
 * @type {number}
 * @example
 * //查看地图所有标注数
 * console.log(Box.count);
 */
Box.count = 0;

export default Box;
