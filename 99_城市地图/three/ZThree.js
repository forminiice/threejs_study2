import * as THREE from 'three'
import { OrbitControls } from 'OrbitControls';

export default class ZThree {
  constructor(id) {
    this.id = id;
    this.el = document.getElementById(id);
  }

  // 初始化场景
  initThree() {
    let _this = this;
    let width = this.el.offsetWidth;
    let height = this.el.offsetHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 3000)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height)
    this.el.append(this.renderer.domElement)
    this.renderer.setClearColor('#000')

    window.addEventListener('resize', function () {
      _this.camera.aspect = _this.el.offsetWidth / _this.el.offsetWidth;
      _this.camera.updateProjectionMatrix();
      _this.renderer.setSize(_this.el.offsetWidth, _this.el.offsetWidth);
    }, false)
  }

  // 初始化helper
  initHelper() {
    this.scene.add(new THREE.AxesHelper(1000))
  }

  // 初始化控制器
  initOrbitControls() {
    let controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.enableDamping = true
    controls.enableZoom = true
    controls.autoRotate = false
    controls.autoRotateSpeed = 0.3
    controls.enablePan = true
    this.controls = controls
  }

  initLight() {
    let directionalLight = new THREE.DirectionalLight('#fff')
    directionalLight.position.set(30, 30, 30).normalize()
    this.scene.add(directionalLight)
    let ambientLight = new THREE.AmbientLight('#fff', 0.3)
    this.scene.add(ambientLight)
    return {
      directionalLight,
      ambientLight
    }
  }
}