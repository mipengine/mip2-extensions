/**
 * @file mip-map.vue
 */
<template>
  <div
    id="allmap"
    :class="{hideMap: hideMap}"
    class="wrapper"
  />
</template>

<script>
export default {
  props: {
    ak: {
      type: String,
      default: ''
    },
    location: {
      type: Object,
      default: () => {
        return null
      }
    },
    controls: {
      type: Object,
      default: () => {
        return null
      }
    },
    info: {
      type: Object,
      default: () => {
        return null
      }
    },
    getPosition: {
      type: Boolean,
      default: false
    },
    dataOnlyGetSdk: {
      type: Boolean,
      default: false
    },
    hideMap: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      map: null,
      point: {},
      marker: null,
      currentMarker: null
    }
  },
  firstInviewCallback () {
    this.init()
  },
  methods: {
    init () {
      this.getMapJDK().then(() => {
        this.resolveOptions()
      })
    },

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
            window.document.body.removeChild($script)
            window.BMap._insertScript = null
            window._initBaiduMap = null
          }
          let $script = document.createElement('script')
          window.document.body.appendChild($script)
          $script.src = `https://api.map.baidu.com/api?v=2.0&ak=${this.ak}&callback=_initBaiduMap`
        })
        return window.BMap._insertScript
      } else if (!window.BMap._insertScript) {
        return Promise.resolve(window.BMap)
      }
      return window.BMap._insertScript
    },

    /**
     * 根据配置执行相应方法
     *
     */
    resolveOptions () {
      let BMap = window.BMap

      // 仅加载SDK，不初始化地图
      if (this.dataOnlyGetSdk) {
        return this.loadSdk()
      }

      // 初始化地图
      this.map = new BMap.Map('allmap')
      this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 15)

      // 隐藏地图
      this.hideMap && this.hideMapView()

      // 自动定位、或者手动定位
      this.getPosition ? this.getCurrentLocation() : this.searchLocation()

      // 暴露自动定位方法
      this.$on('getLocal', () => {
        // 可能会在未完全初始化的时候调用
        this.getMapJDK().then(() => {
          this.getCurrentLocation()
        })
      })
      // 配置控件
      this.controls && this.addControls()
    },

    /**
     * 隐藏地图
     *
     */
    hideMapView () {
      let mipMap = this.$element
      MIP.util.css(mipMap, {
        width: 0,
        height: 0
      })
    },

    /**
     * 仅加载sdk
     *
     */
    loadSdk () {
      let BMap = window.BMap

      // BMap注入沙盒
      Object.defineProperty(MIP.sandbox, 'BMap', {
        value: BMap,
        writable: false,
        enumerable: true,
        configurable: true
      })

      // 派发事件
      this.$emit('loaded', {})
    },

    /**
     * 自动定位
     *
     */
    getCurrentLocation () {
      let BMap = window.BMap
      let geolocation = new BMap.Geolocation()
      geolocation.getCurrentPosition((res) => {
        // 无定位权限
        if (!res.accuracy) {
          return this.$emit('getPositionFailed', res)
        } else if (geolocation.getStatus() === window.BMAP_STATUS_SUCCESS) {
          this.currentMarker = new BMap.Marker(res.point)
          this.map.addOverlay(this.currentMarker)
          this.map.panTo(res.point)

          // 派发事件
          this.$emit('getPositionComplete', res)
        }
      }, { enableHighAccuracy: true })
    },

    /**
     * 定位至local配置的位置
     *
     */
    searchLocation () {
      let BMap = window.BMap
      let { location, map } = this

      // 配置地址
      let address = this.traverseAndConcat(location)

      // 没有定位信息，则使用自动定位
      if (!address || !this.location.city) {
        this.getCurrentLocation()
        this.$emit('searchLocalFailed', {})
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
          let { marker, point } = this
          map.addOverlay(marker)
          map.centerAndZoom(point, 15)

          // 配置弹层
          this.setInfoWindow()
        }
      }

      // 搜索并定位地址
      let local = new BMap.LocalSearch(map, options)
      local.search(address)
    },

    /**
     * 配置弹层信息
     *
     */
    setInfoWindow () {
      let BMap = window.BMap
      let { info, map, marker, point } = this
      if (!info) {
        return
      }
      let infoWindow = new BMap.InfoWindow(info.content, info)
      marker.addEventListener('click', () => {
        map.openInfoWindow(infoWindow, point)
      })
    },

    /**
     * 配置地图控件
     *
     */
    addControls () {
      let BMap = window.BMap
      let { controls, map } = this
      for (let key in controls) {
        if (controls.hasOwnProperty(key)) {
          let params = controls[key] || {}
          let Fn = BMap[key]
          Fn && map.addControl(new Fn(params))
        }
      }
    },

    /**
     * 工具方法 拼接键值对
     *
     * @param {Object} obj 需要处理的对象
     * @returns {string} 拼接字符串
     */
    traverseAndConcat (obj) {
      let output = ''
      for (let key in obj) {
        if (!obj.hasOwnProperty(key) || !obj[key]) {
          continue
        }
        output += obj[key]
      }
      return output
    }
  }
}
</script>

<style lang="less" scoped>
#allmap {
  width: 100%;
  height: 100%;

  &.hideMap {
    width: 0;
    height: 0;
    visibility: hidden;
  }
  // mip核心css 会覆盖地图定位图片样式
  & /deep/ img {
    width: auto;
  }
}
</style>
