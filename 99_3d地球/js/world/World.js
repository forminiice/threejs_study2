
import {
  MeshBasicMaterial,  // 基础网格材质（不受光照的影响）
  PerspectiveCamera,  // 透视相机
  Scene,              // 场景
  ShaderMaterial,     // 使用自定义shader渲染的材质 自定义着色器GLSL代码
  WebGLRenderer       // WebGL渲染器
} from "three";
import {
  OrbitControls
} from "OrbitControls";

import { Basic } from './Basic.js';

export default class World {
  constructor(option) {
    /**
     * 加载资源
     */
    this.option = option;

    this.basic = new Basic(option.dom);
    this.scene = this.basic.scene;
    this.renderer = this.basic.renderer;
    this.controls = this.basic.controls;
    this.camera = this.basic.camera;

    console.log("basic", this.basic)

  }
}