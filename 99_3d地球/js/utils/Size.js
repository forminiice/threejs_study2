export default class Sizes {
  /**
   * Constructor
   */
   constructor(options) {
    // Viewport size
    this.$sizeViewport = options.dom

    this.viewport = {
      width: 0,
      height: 0
    }

    // Resize event
    this.resize = this.resize.bind(this)
    window.addEventListener('resize', this.resize)

    this.resize()
  }
  
  /**
   * Resize
   */
  resize() {
    // 可视区域大小
    this.viewport.width = this.$sizeViewport.offsetWidth
    this.viewport.height = this.$sizeViewport.offsetHeight

    this.emitter.emit('resize')
  }
}