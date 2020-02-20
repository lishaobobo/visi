import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import OrbitControls from "three-orbitcontrols";
import Event from "./Event.js";
import Stats from "./stats.js";

import Detector from "./Detector.js";
import * as util from "./util";

var extrudeOption = {
  depth: 1, //厚度
  bevelThickness: 1,
  bevelSize: 0.2,
  bevelEnabled: false,
  bevelSegments: 5,
  curveSegments: 1,
  steps: 1
};
class SphereMap {
  constructor(o) {
    if (!Detector.webgl) {
      console.warn("不支持webgl,停止渲染.");
      return;
    }
    let opt = {
      name: "sphereMap",
      el: document.body,
      cameraPosition: { x: 0, y: 0, z: 40 }, //相机位置
      geoData: null,
      hasStats: true,
      hasControls: false,
      autoRotate: true,
      hasLoadEffect: false,
      debugger: false,
      extrude: extrudeOption,
      _w: 0,
      _h: 0,
      _event: null,
      mapObjects: null,
      areaObjects: null,
      lineObjects: null,
      ringObjects: null,
      markObjects: null,
      boxObjects: null,
      scene: null,
      renderer: null,
      camera: null,
      stats: null,
      controls: null
    };
    util.extend(true, opt, o);
    util.extend(true, this, opt);
    this._w = this.el.offsetWidth;
    this._h = this.el.offsetHeight;
    this.init();
  }
  init() {
    this.el.innerHTML = "";
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this._w / this._h, 0.1, 1000);

    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(this.scene.position);

    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this._w, this._h);
    this.renderer.setClearColor(0xeeeeee);

    /**
     * @param {0xhex} color
     * 添加光源
     */
    let spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, 10);
    this.scene.add(spotLight);

    var geometry = new THREE.SphereGeometry(5, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0x171c16 });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0, 0);
    this.scene.add(sphere);

    this.el.appendChild(this.renderer.domElement);
    this.renderScene();
  }

  /**
   *
   * 创建一个球面体
   *
   */
  createSphere() {}

  /**
   *
   * 球面体纹理映射
   *
   */
  textureMap2Sphere() {}

  /**
   *
   * geoJson映射到球面体上
   *
   */
  jsonMap2Sphere() {}

  /**
   *
   * geojson坐标转换成球面体坐标
   *
   */
  cartesian2spherical() {}

  renderScene() {
    this.renderer.clear();
    requestAnimationFrame(this.renderScene.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

export { SphereMap as default };
