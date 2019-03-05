/**
 * @file mip gltf 格式 3D 模型展示组件
 * @author guozhuorong@baidu.com
 */

/* global THREE */
let { CustomElement, util } = MIP
const { raf } = util.fn
const log = util.log('mip-3d-gltf')

const CAMERA_DISTANCE_FACTOR = 1
const CAMERA_FAR_FACTOR = 50
const CAMERA_NEAR_FACTOR = 0.1

/**
 * 布尔类型属性值转换
 *
 * @param {string} attr 属性字符串
 * @returns {boolean} 布尔值
 */
function boolFmt (attr) {
  return attr !== 'false'
}

/**
 * 数字类型属性值转换
 *
 * @param {string} attr 属性字符串
 * @returns {number} 数字
 */
function numberFmt (attr) {
  return parseFloat(attr)
}

/**
 * 是否支持 WebGL
 *
 */
function isWebGLAvailable () {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  return gl && gl instanceof WebGLRenderingContext
}

/**
 * 生成错误信息
 *
 */
function getErrorMessage () {
  let message = 'Your browser does not seem to support WebGL'
  let element = document.createElement('div')
  element.id = 'webglmessage'
  let style = 'font-family: monospace; font-size: 13px; font-weight: normal; text-align: center;' +
                'background: rgb(255, 255, 255); color: rgb(0, 0, 0); padding: 1.5em'
  element.setAttribute('style', style)

  element.innerHTML = message
  return element
}

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
     * 远程 3D 模型的地址
     * @type string
     */
    this.src = null

    /**
     * 窗口宽度
     * @type number
     */
    this.width = window.innerWidth

    /**
     * 窗口高度
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

    this.controls = null
    this.camera = null
    this.scene = null
    this.renderer = null
    this.light = null
    this.container = null
    this.model = null

    this.animate = this.animate.bind(this)
  }

  isLoadingEnabled () {
    return true
  }

  prerenderAllowed () {
    return true
  }

  getAttr (name, formatter, defaultValue) {
    return this.element.hasAttribute(name) ? formatter(this.element.getAttribute(name)) : defaultValue
  }

  build () {
    let el = this.element
    this.src = el.getAttribute('src') || ''
    this.alpha = this.getAttr('alpha', boolFmt, false)
    this.antialiasing = this.getAttr('antialiasing', boolFmt, false)
    this.autoRotate = this.getAttr('auto-rotate', boolFmt, false)
    this.clearColor = el.getAttribute('clear-color') || '#FFFFFF'
    this.maxPixelRatio = this.getAttr('max-pixel-ratio', numberFmt, window.devicePixelRatio)
    this.width = this.getAttr('width', numberFmt, window.innerWidth)
    this.height = this.getAttr('height', numberFmt, window.innerHeight)
    this.option = this.getOption()

    this.container = el.ownerDocument.createElement('div')
    this.applyFillContent(this.container, true)
    el.appendChild(this.container)
  }

  layoutCallback () {
    return import('./three.min')
      .then(() => Promise.all([
        import('./GLTFLoader'),
        import('./OrbitControls')
      ]))
      .then(() => {
        if (!isWebGLAvailable()) {
          this.container.appendChild(getErrorMessage())
          return Promise.reject(new Error('WebGL'))
        }
        return this.initialize()
      })
      .then(() => {
        this.addEventAction('setModelRotation', (e, args) => {
          this.model.rotation.set(...this.getModelRotation(args))
        })
        this.animate()
      })
      .catch(err => {
        if (err.message === 'WebGL') {
          log.warn('WebGL is not available!')
        } else {
          log.error('import err:', err)
        }
      })
  }

  /**
   * 解析参数字符串，计算转动参数
   *
   * @param {string} args 参数字符串
   * @returns {number[]} 三维转动参数
   */
  getModelRotation (args) {
    let axisNames = ['x', 'y', 'z']
    let array = args.trim().split(',')
    let argObj = {}
    array.forEach(item => {
      item = item.trim().split('=')
      let value = parseFloat(item[1])
      if (!isNaN(value)) {
        argObj[item[0]] = value
      }
    })
    return axisNames.map(axis => {
      const {
        [axis]: val = -1,
        [axis + 'Min']: min = 0,
        [axis + 'Max']: max = Math.PI * 2
      } = argObj
      if (val === -1) {
        return this.model.rotation[axis]
      }
      return val * max + (1 - val) * min
    })
  }

  initialize () {
    this.scene = new THREE.Scene()
    this.model = new THREE.Group()
    this.camera = new THREE.PerspectiveCamera()
    this.setupRenderer()
    this.setupControls()
    this.setupLight()
    return this.loadModel()
  }

  setupRenderer () {
    let renderer = new THREE.WebGLRenderer(this.option['renderer'])
    let el = renderer.domElement
    let style = 'position: absolute; top: 0; right: 0; bottom: 0; left: 0;'
    el.setAttribute('style', style)
    this.container.appendChild(el)

    renderer.setPixelRatio(Math.min(this.option['rendererSettings']['maxPixelRatio'], window.devicePixelRatio))
    renderer.setClearColor(this.option['rendererSettings']['clearColor'], this.option['rendererSettings']['clearAlpha'])
    renderer.gammaOutput = true
    renderer.gammaFactor = 2.2
    renderer.setSize(this.width, this.height)

    this.renderer = renderer
  }

  setupCameraForObj (object) {
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    const bbox = new THREE.Box3()
    bbox.setFromObject(object)
    bbox.getCenter(center)
    bbox.getSize(size)

    const sizeLength = size.length()
    this.camera.far = sizeLength * CAMERA_FAR_FACTOR
    this.camera.near = sizeLength * CAMERA_NEAR_FACTOR
    this.camera.aspect = this.width / this.height
    this.camera.position.lerpVectors(
      center,
      bbox.max,
      1 + CAMERA_DISTANCE_FACTOR
    )
    this.camera.lookAt(center)

    this.camera.updateProjectionMatrix()
    this.camera.updateMatrixWorld()

    this.controls.target.copy(center)
  }

  setupControls () {
    let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    controls.target.set(0, -0.2, -0.2)
    Object.assign(controls, this.option['controls'])

    this.controls = controls
  }

  setupLight () {
    const amb = new THREE.AmbientLight(0xEDECD5, 0.5)

    const dir1 = new THREE.DirectionalLight(0xFFFFFF, 0.5)
    dir1.position.set(0, 5, 3)

    const dir2 = new THREE.DirectionalLight(0xAECDD6, 0.4)
    dir2.position.set(-1, -2, 4)

    const light = new THREE.Group()
    light.add(amb, dir1, dir2)
    this.scene.add(light)
  }

  loadModel () {
    let loader = new THREE.GLTFLoader()
    return new Promise(resolve => {
      loader.load(this.option['src'], gltf => {
        this.setupCameraForObj(gltf.scene)
        gltf.scene.children.slice().forEach(child => {
          this.model.add(child)
        })
        this.scene.add(this.model)
        resolve()
      }, undefined, e => {
        console.error(e)
      })
    })
  }

  animate () {
    raf(this.animate)
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
