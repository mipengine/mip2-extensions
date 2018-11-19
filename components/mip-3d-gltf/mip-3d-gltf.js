/**
 * @file mip gltf格式3D模型展示组件
 * @author guozhuorong@baidu.com
 */

/* global MIP, fetch */
let { CustomElement } = MIP

export default class MipGLTF extends CustomElement {
  constructor (element) {
    super(element)

    /**
     * 自由空间是否透明
     * @type boolean
     */
    this.alpha = false

    /**
     * 最大设备像素比
     * @type number
     */
    this.maxPixelRatio = window.devicePixelRatio

    /**
     * 远程3D模型的链接
     * @type string
     */
    this.src = null

    /**
     * 窗口宽度
     * @type number
     */
    this.width = window.innerWidth

    /**
     * 计算后的高度
     * @type number
     */
    this.height = window.innerHeight

    /**
     * 自由空间颜色
     * @type string
     */
    this.clearColor = '#FFFFFF'

    /**
     * 是否开启抗锯齿
     * @type boolean
     */
    this.antialiasing = false

    /**
     * 是否可以缩放
     * @type boolean
     */
    this.enableZoom = true

    /**
     * 是否自动旋转
     * @type boolean
     */
    this.autoRotate = false

    /**
     * 属性配置
     * @type Object
     */
    this.option = null

    /**
     * controls对象
     * @type Object
     */
    this.controls = null

    /**
     * camera对象
     * @type Object
     */
    this.camera = null

    /**
     * scene对象
     * @type Object
     */
    this.scene = null

    /**
     * renderer对象
     * @type Object
     */
    this.renderer = null

    /**
     * light对象
     * @type Object
     */
    this.light = null

    /**
     * 展示容器
     * @type HTMLElement
     */
    this.container = null

    this.animate = this.animate.bind(this)
  }

  isLoadingEnabled () {
    return true
  }

  prerenderAllowed () {
    return true
  }

  build () {
    const getAttr = (name, formatter, defaultValue) =>
      this.element.hasAttribute(name) ? formatter(this.element.getAttribute(name)) : defaultValue

    const boolFmt = x => x !== 'false'
    const stringFmt = x => x
    const numberFmt = x => parseFloat(x)

    this.src = getAttr('src', stringFmt, '')
    this.alpha = getAttr('alpha', boolFmt, false)
    this.antialiasing = getAttr('antialiasing', boolFmt, false)
    this.autoRotate = getAttr('auto-rotate', boolFmt, false)
    this.clearColor = getAttr('clear-color', stringFmt, '#FFFFFF')
    this.maxPixelRatio = getAttr('max-pixel-ratio', numberFmt, window.devicePixelRatio)
    this.width = getAttr('width', numberFmt, window.innerWidth)
    this.height = getAttr('height', numberFmt, window.innerHeight)
    this.option = this.getOption()

    this.container = this.element.ownerDocument.createElement('div')
    this.applyFillContent(this.container, true)
    this.element.appendChild(this.container)
  }

  layoutCallback () {
    return import('./three.min')
      .then(() => Promise.all([
        import('./GLTFLoader'),
        import('./OrbitControls')
      ]))
      .then(() => {
        if ( this.isWebGLAvailable() === false ) {
          this.container.appendChild(this.getErrorMessage())
          return Promise.reject('WebGL')
        }
      })
      .then(() => this.initialize())
      .then(() => {
        this.container.appendChild(this.renderer.domElement)
        this.animate()
      })
      .catch(err => {
        if(err === 'WebGL') {
          console.warn('WebGL is not available!')
        }
        else {
          console.error('import err:', err)
        }
      })
  }

  isWebGLAvailable () {
    try {
      let canvas = document.createElement('canvas')
      return !! (window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    } catch (e) {
      return false
    }
  }
  
  getErrorMessage () {
    let message = 'Your browser does not seem to support WebGL'
    let element = document.createElement('div')
    element.id = 'webglmessage'
    let style = 'font-family: monospace; font-size: 13px; font-weight: normal; text-align: center;'+
                  'background: rgb(255, 255, 255); color: rgb(0, 0, 0); padding: 1.5em'
    element.setAttribute('style', style)

    element.innerHTML = message
    return element
  }

  initialize () {
    this.setupScene()
    this.setupRenderer()
    this.setupCamera()
    this.setupControls()
    this.setupLight()
    return this.loadModel()
  }

  setupScene () {
    let scene = new THREE.Scene()

    this.scene = scene
  }

  setupRenderer () {
    let renderer = new THREE.WebGLRenderer(this.option['renderer'])

    renderer.setPixelRatio(Math.min(this.option['rendererSettings']['maxPixelRatio'], window.devicePixelRatio))
    renderer.setClearColor(this.option['rendererSettings']['clearColor'], this.option['rendererSettings']['clearAlpha'])
    renderer.gammaOutput = true
    renderer.gammaFactor = 2.2
    renderer.setSize(this.width, this.height)

    this.renderer = renderer
  }

  setupCamera () {
    let camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.25, 20)
    camera.position.set(-1.8, 0.9, 5)

    this.camera = camera
  }

  setupControls () {
    let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    controls.target.set(0, - 0.2, - 0.2)
    Object.assign(controls, this.option['controls'])

    this.controls = controls
  }

  setupLight () {
    const amb = new THREE.AmbientLight(0xEDECD5, .5)

    const dir1 = new THREE.DirectionalLight(0xFFFFFF, .5)
    dir1.position.set(0, 5, 3)

    const dir2 = new THREE.DirectionalLight(0xAECDD6, .4)
    dir2.position.set(-1, -2, 4)

    const light = new THREE.Group()
    light.add(amb, dir1, dir2)
    this.scene.add(light)
  }

  loadModel () {
    let loader = new THREE.GLTFLoader()
    return new Promise(resolve => {
      loader.load(this.option['src'], gltf => {
        this.scene.add(gltf.scene)
        resolve()
      }, undefined, e => {
        console.error(e)
      })
    })
  }

  animate () {
    requestAnimationFrame(this.animate)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  getOption () {
    return {
      src: this.src,
      renderer: {
        alpha: this.alpha,
        antialias: this.antialiasing
      },
      rendererSettings: {
        clearColor: this.clearColor,
        clearAlpha: this.alpha,
        maxPixelRatio: this.maxPixelRatio
      },
      controls: {
        enableZoom: this.enableZoom,
        autoRotate: this.autoRotate
      }
    }
  }
}
