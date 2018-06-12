/**
 * @file mip-map.vue
 */
<template>
  <div
    id="allmap"
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
    }
  },
  data () {
    return {
      map: null,
      point: {},
      marker: null
    }
  },
  firstInviewCallback () {
    this.init()
  },
  methods: {
    init () {
      this.getMapJDK().then(() => {
        this.handleResult()
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
     * 初始化地图并加载控件
     *
     */
    handleResult () {
      let BMap = window.BMap

      // 初始化地图
      this.map = new BMap.Map('allmap')
      this.map.centerAndZoom(new BMap.Point(116.404, 39.915), 15)

      // 创建地址解析器实例
      let address = this.traverseAndConcat(this.location)
      if (address && this.location.city) {
        this.handlePoint()
      }
    },

    /**
     * 处理定位的函数
     *
     */
    handlePoint () {
      let BMap = window.BMap
      let { location, map } = this

      // 配置地址
      let address = this.traverseAndConcat(location)
      if (!address) {
        return
      }
      let options = {
        onSearchComplete: results => {
          if (local.getStatus() !== 0) {
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
          this.handleInfoWindow()
          // 配置控件
          this.handleControls()
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
    handleInfoWindow () {
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
    handleControls () {
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
     * @returns {Object} 拼接字符串
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
  // mip核心css 会覆盖地图定位图片样式
  & /deep/ img {
    width: auto;
  }
}
</style>
