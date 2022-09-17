
import { Vector2, Color } from "three";

import { EffectComposer } from "EffectComposer"
import { RenderPass } from "RenderPass"
import { OutlinePass } from "OutlinePass"
import { ShaderPass } from "ShaderPass"
import { FXAAShader } from "FXAAShader"

export default class OutlineObj {
  constructor(options) {
    this.renderer
    this.composer = null
    this.renderPass = null
    this.outlinePass = null
    this.renderer = options.renderer
    this.scene = options.scene
    this.camera = options.camera
  }
  
  //高亮显示模型（呼吸灯）
  init(selectedObjects) {
    // 创建一个EffectComposer（效果组合器）对象，然后在该对象上添加后期处理通道。
    this.composer = new EffectComposer(this.renderer)
    // 新建一个场景通道  为了覆盖到原理来的场景上
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(this.renderPass);
    // 物体边缘发光通道
    this.outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera, selectedObjects)
    this.outlinePass.selectedObjects = selectedObjects
    this.outlinePass.edgeStrength = 10.0 // 边框的亮度
    this.outlinePass.edgeGlow = 1// 光晕[0,1]
    this.outlinePass.usePatternTexture = false // 是否使用父级的材质
    this.outlinePass.edgeThickness = 1.0 // 边框宽度
    this.outlinePass.downSampleRatio = 1 // 边框弯曲度
    this.outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
    this.outlinePass.visibleEdgeColor.set(parseInt(0xffff00)) // 呼吸显示的颜色
    this.outlinePass.hiddenEdgeColor = new Color(0, 1, 1) // 呼吸消失的颜色
    this.outlinePass.clear = true
    this.composer.addPass(this.outlinePass)
    // 自定义的着色器通道 作为参数
    var effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
    effectFXAA.renderToScreen = true
    this.composer.addPass(effectFXAA)
  }
}