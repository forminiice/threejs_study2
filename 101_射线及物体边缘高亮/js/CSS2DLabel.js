import { Vector3 } from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export default class CSS2DLabel {
  constructor(el) {
    this.renderer = null

    // css2drenderer
    this.renderer = new CSS2DRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0px';
    this.renderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(this.renderer.domElement);
  }

  createLabel(position) {
    const text = document.createElement('div');
    // text.className = 'info-window';

    const label = new CSS2DObject(text);
    console.log("position instanceof Vector3", position instanceof Vector3)
    if (position instanceof Vector3) {
      label.position.copy(position)
    } else {
      label.position.set(0, 0, 0);
    }
    // label.element.innerHTML = `
    //   <div class="info-window"></div>
    // `
    // console.log("label", label.element)
    // scene.add(label);
    // label.visible = false;
    return label;
  }

  /**
   * 屏幕坐标转threejs世界坐标
   * @param mouse   鼠标位置 Vector2坐标
   * @param camera  相机对象
   * @returns 返回一个三维向量坐标
   */
  screenCoordToWorld(mouse, camera) {
    // 屏幕坐标转标准设备坐标
    //标准设备坐标(z=0.5这个值比较靠经验)
    const stdVector = new Vector3(mouse.x, mouse.y, 0.5);
    //世界坐标
    const worldVector = stdVector.unproject(camera);

    return worldVector;
  }
}