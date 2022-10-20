import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

export default class OutLineHighlight {
  constructor(option) {
    this.effectFXAA = null
    this.outlinePass = null

    this.init(option);
  }

  init(option) {
    const { renderer, scene, camera } = option;

    // 实例化 效果合成器（EffectComposer）
    this.composer = new EffectComposer(renderer);

    // 实例化 RenderPass
    const renderPass = new RenderPass(scene, camera);
    // 将渲染通道添加到composer中 该通道在指定的场景和相机的基础上渲染出一个新的场景
    this.composer.addPass(renderPass);

    // 实例化边框对象
    this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    // 添加到效果合成器中
    this.composer.addPass(this.outlinePass);

    // 加载材质，添加到边框中
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('./textures/tri_pattern.jpg', (texture) => {
      this.outlinePass.patternTexture = texture;
      // 设置重复规则
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

    });

    // 自定义着色器通道，可以传入自定义着色器作为参数，以生成一个高级、自定义的后期处理通道。
    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    this.composer.addPass(this.effectFXAA);
  }
}