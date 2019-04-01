/* global BMap, BMapLib */
import './mip-map.less'

const {CustomElement, viewer, sandbox, templates, util: {Deferred, jsonParse}} = MIP

const EXTENSIONS_METADATA = {
  SearchInfoWindow: {
    version: '1.5'
  }
}

const capitalize = name => name[0].toUpperCase() + name.slice(1)

export default class MIPMap extends CustomElement {
  constructor (...args) {
    super(...args)

    this.map = null
    this.point = {}
    this.marker = null
    this.currentMarker = null
    this.loadExtension = this.loadExtension.bind(this)
    this.handleSearchInfoWindowOpen = this.handleSearchInfoWindowOpen.bind(this)
  }

  async firstInviewCallback () {
    const {hideMap} = this.props
    const container = document.createElement('div')

    container.id = 'allmap'
    hideMap && container.classList.add('hide-map')
    this.element.appendChild(container)

    await this.getMapJDK()
    await this.loadExtensions()

    this.render()
  }

  build () {
    this.addEventAction(
      'openSearchInfoWindow',
      (event, arg) => {
        const point = jsonParse(arg)
        const marker = this.renderPointMarker(point)

        this.handleSearchInfoWindowOpen({currentTarget: marker})
      }
    )
  }

  loadResources (tag, options) {
    const {promise, resolve, reject} = new Deferred()

    const element = document.createElement(tag)

    element.addEventListener('load', resolve)
    element.addEventListener('error', reject)
    Object.assign(element, options)

    document.head.appendChild(element)

    return promise
  }

  loadStyle (href) {
    return this.loadResources('link', {rel: 'stylesheet', href})
  }

  loadScript (src) {
    return this.loadResources('script', {async: true, src})
  }

  loadExtension (name) {
    const {version} = EXTENSIONS_METADATA[name]

    if (!version) {
      return Promise.reject(new Error(`Extension ${name} not found.`))
    }

    const baseUrl = `http://api.map.baidu.com/library/${name}/${version}/src/${name}_min`

    return Promise.all([
      this.loadStyle(`${baseUrl}.css`),
      this.loadScript(`${baseUrl}.js`)
    ])
  }

  loadExtensions () {
    const {extensions} = this.props

    return Promise.all(Object.keys(extensions).map(capitalize).map(this.loadExtension))
  }

  /**
   * 异步加载地图jdk
   *
   */
  getMapJDK () {
    if (!window.BMap) {
      window.BMap = {}
      window.BMap._insertScript = new Promise(resolve => {
        window._initBaiduMap = () => {
          resolve(window.BMap)
          window.document.body.removeChild(script)
          window.BMap._insertScript = null
          window._initBaiduMap = null
        }
        let script = document.createElement('script')
        window.document.body.appendChild(script)
        script.src = `https://api.map.baidu.com/api?v=2.0&ak=${this.ak}&callback=_initBaiduMap`
      })
      return window.BMap._insertScript
    } else if (!window.BMap._insertScript) {
      return Promise.resolve(window.BMap)
    }
    return window.BMap._insertScript
  }

  /**
   * 仅加载sdk
   *
   */
  loadSdk () {
    let BMap = window.BMap

    // BMap注入沙盒
    Object.defineProperty(sandbox, 'BMap', {
      value: BMap,
      writable: false,
      enumerable: true,
      configurable: true
    })

    // 派发事件
    viewer.eventAction.execute('loaded', this.element, {})
  }

  /**
   * 自动定位
   *
   */
  getCurrentLocation () {
    let geolocation = new BMap.Geolocation()
    geolocation.getCurrentPosition(res => {
      // 无定位权限
      if (!res.accuracy) {
        return viewer.eventAction.execute('getPositionFailed', this.element, res)
      } else if (geolocation.getStatus() === window.BMAP_STATUS_SUCCESS) {
        this.currentMarker = new BMap.Marker(res.point)
        this.map.addOverlay(this.currentMarker)
        this.map.panTo(res.point)

        // 派发事件
        viewer.eventAction.execute('getPositionComplete', this.element, res)
      }
    }, {enableHighAccuracy: true})
  }

  /**
   * 定位至local配置的位置
   *
   */
  searchLocation () {
    const {location} = this.props

    // 配置地址
    let address = Object.values(location).join('')

    // 没有定位信息，则使用自动定位
    if (!address || !location.city) {
      this.getCurrentLocation()
      viewer.eventAction.execute('searchLocalFailed', this.element, {})
      return
    }
    let options = {
      onSearchComplete: results => {
        if (local.getStatus() !== window.BMAP_STATUS_SUCCESS) {
          return
        }
        let firstResult = results.getPoi(0)
        this.point = firstResult.point
        if (!firstResult || !this.point) {
          return
        }
        this.marker = new BMap.Marker(this.point)
        this.map.addOverlay(this.marker)
        this.map.centerAndZoom(this.point, 16)

        // 配置弹层
        this.setInfoWindow()
      }
    }

    // 搜索并定位地址
    let local = new BMap.LocalSearch(this.map, options)
    local.search(address)
  }

  /**
   * 配置弹层信息
   *
   */
  setInfoWindow () {
    if (!this.info) {
      return
    }
    let infoWindow = new BMap.InfoWindow(this.info.content, this.info)
    this.marker.addEventListener('click', () => {
      this.map.openInfoWindow(infoWindow, this.point)
    })
  }

  /**
   * 配置地图控件
   *
   */
  addControls () {
    const {controls} = this.props

    Object.keys(controls).forEach(key => {
      let params = controls[key] || {}

      // 识别 BMAP_* 常量
      Object.keys(params).forEach(prop => {
        let val = params[prop]
        if (typeof val === 'string' && val.indexOf('BMAP_') !== -1) {
          params[prop] = window[val]
        }
        if (Array.isArray(val)) {
          let array = val.map(v => {
            if (v.indexOf('BMAP_') !== -1) {
              return window[v]
            }
            return v
          })
          params[prop] = array
        }
      })

      let Fn = BMap[key]
      Fn && this.map.addControl(new Fn(params))
    })
  }

  createPointMarker ({lng, lat, metadata}) {
    const point = new BMap.Point(lng, lat)
    const marker = new BMap.Marker(point)

    marker.metadata = metadata

    return marker
  }

  async getSearchInfoWindowOptions (point, metadata) {
    const {extensions: {searchInfoWindow: options}} = this.props
    const slots = [...this.element.querySelectorAll('template[search-info-window][key]')]
    const dynamicOptions = {}

    await Promise.all(slots.map(async (slot) => {
      dynamicOptions[slot.getAttribute('key')] = await templates.render(slot, metadata)
    }))

    return {...options, ...dynamicOptions}
  }

  async openSearchInfoWindow (point, metadata) {
    const {content, ...options} = await this.getSearchInfoWindowOptions(point, metadata)
    const searchInfoWindow = new BMapLib.SearchInfoWindow(this.map, content, options)

    searchInfoWindow.open(point)
  }

  handleSearchInfoWindowOpen (event) {
    const {currentTarget: {point, metadata}} = event

    this.map.centerAndZoom(point, 16)
    this.openSearchInfoWindow(point, metadata)
  }

  renderPointMarker (point) {
    const marker = this.createPointMarker(point)

    this.map.addOverlay(marker)

    return marker
  }

  renderPoints () {
    const {points, extensions} = this.props

    points.forEach((point) => {
      const marker = this.renderPointMarker(point)

      if (extensions.searchInfoWindow) {
        marker.addEventListener('click', this.handleSearchInfoWindowOpen)
      }
    })
  }

  /**
   * 根据配置执行相应方法
   *
   */
  render () {
    const {controls, dataOnlyGetSdk} = this.props

    // 仅加载SDK，不初始化地图
    if (dataOnlyGetSdk) {
      return this.loadSdk()
    }

    // 初始化地图
    this.map = new BMap.Map('allmap')
    this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 15)

    // 自动定位、或者手动定位
    this.getPosition ? this.getCurrentLocation() : this.searchLocation()

    // 暴露自动定位方法
    this.addEventAction('getLocal', () => {
      // 可能会在未完全初始化的时候调用
      this.getMapJDK().then(this.getCurrentLocation.bind(this))
    })
    // 配置控件
    controls && this.addControls()
    this.renderPoints()
  }
}

MIPMap.props = {
  ak: {
    type: String,
    default: ''
  },
  location: Object,
  controls: Object,
  info: Object,
  points: {
    type: Array,
    default: () => []
  },
  hideMap: Boolean,
  getPosition: Boolean,
  dataOnlyGetSdk: Boolean,
  extensions: {
    type: Object,
    default: () => ({})
  }
}
