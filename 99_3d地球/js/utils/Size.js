export default class Sizes {
  /**
   * Constructor
   */
  constructor(options) {
    // Viewport size
    this.$sizeViewport = options.dom

    this.viewport = { width: 0, height: 0 }

    this.resizeFuns = {}

    // Resize event
    this.resize = this.resize.bind(this)
    window.addEventListener('resize', this.resize)

    this.resize()
  }

  onResize = (key, fun) => {
    this.resizeFuns[key] = fun
  }

  offResize = (key) => {
    delete this.resizeFuns[key]
  }

  /**
   * Resize
   */
  resize() {
    // 可视区域大小
    this.viewport.width = this.$sizeViewport.offsetWidth
    this.viewport.height = this.$sizeViewport.offsetHeight

    // 遍历调用所有Resize后需要调用的方法
    for (const key in this.resizeFuns) {
      this.resizeFuns[key]();
    }
  }
}