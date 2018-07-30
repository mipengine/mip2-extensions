<template>
  <div class="mip-city-selection-wrapper">
    <div class="mip-city-selection-content lasted-visted-hot ">
      <!-- 最近访问的城市 -->
      <div
        v-show="visit"
        class="mip-city-selection-part-letter content-wrapper"
      >
        <div class="mip-city-selection-title">最近访问的城市</div>
        <p
          v-for="city in history"
          :key="city"
          class="mip-city-selection-item"
          @click="showInfo(city)"
        >
          {{ city.city }}
        </p>
      </div>

    </div>

    <div class="mip-city-selection-content">
      <!--  热门城市本地 -->
      <div v-if="local">
        <div
          v-for="item in list"
          :key="item"
          class="mip-city-selection-city mip-city-selection-part-letter city-json-content content-wrapper"
        >
          <div class="mip-city-selection-title"> {{ item.key }}</div>
          <p
            v-for="city in item.cities"
            :key="city"
            class="mip-city-selection-item"
            @click="showInfo(city)"
          >
            {{ city.city }}
          </p>
        </div>
      </div>

      <!--  热门城市异步 -->
      <div v-show="async">
        <div
          v-for="item in listOnline"
          :key="item"
          class="mip-city-selection-city mip-city-selection-part-letter city-json-content  content-wrapper"
        >
          <div class="mip-city-selection-title"> {{ item.key }}</div>
          <p
            v-for="city in item.cities"
            :key="city"
            class="mip-city-selection-item"
            @click="showInfo(city)"
          >
            {{ city.city }}
          </p>
        </div>
      </div>
    </div>
    <div>
      <mip-fixed
        class="mip-city-selection-sidebar-wrapper"
        type="right"
      >
        <div class="mip-city-selection-sidebar">
          <div
            v-for="(item, index) in listOnline"
            :key="index"
            @click="scrollTocity(index)"
          >
            <a class="mip-city-selection-link"> {{ item.key }}</a>
          </div>
        </div>
      </mip-fixed>
    </div>
    <slot/>
  </div>

</template>
<style lang="less" scoped>
.wrapper {
  margin: 0 auto;
  text-align: center;
}

.content-wrapper {
  padding-left: 8px;
  padding-right: 8px;
}

.city-json-content:first-child {
  background: #f2f2f2;
  padding-right: 5%;
}

.city-json-content:first-child p,
.lasted-visted-hot p {
  border-bottom: 0;
  display: inline-block;
  width: 20%;
  max-height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  margin-bottom: 15px;
  margin-right: 2%;
  margin-left: 2%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-json-content:not(:first-child) {
  background: #fff;
}

.mip-city-selection-content {
  overflow-x: hidden;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 0 800px 0;
  color: #333;
}

.lasted-visted-hot {
  padding-bottom: 0;
  background: #f2f2f2;
  padding-right: 5%;
  padding-top: 18px;
}

.lasted-visted-hot p {
  border-bottom: 0;
}

.hotCity {
  background: #666;
}

.mip-city-selection-city {
  padding-top: 18px;
  &:last-child {
    margin-bottom: 800px;
  }
}

.mip-city-selection-title {
  padding: 0 10px;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 12px;
  margin-top: 0;
}

.mip-city-selection-part-history {
  display: none;
}

.mip-city-selection-btn {
  height: 38px;
  line-height: 38px;
  text-align: center;
  background: #f8f8f8;
}

.mip-city-selection-item {
  height: 39px;
  border-bottom: 1px solid #eee;
  line-height: 39px;
  padding: 0 10px;
  display: block;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
}

.mip-city-selection-item.down {
  background: rgba(0, 0, 0, 0.1);
}

.mip-city-selection-sidebar-wrapper {
  top: 0;
  right: 10px;
  bottom: 0;
  margin: 10px 0;
}

.mip-city-selection-sidebar {
  z-index: 50;
  right: 7px;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  max-height: 100%;
  padding: 20px 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
  text-align: center;
  color: #666;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
}

.mip-city-selection-link {
  display: block;
  padding: 0 10px;
  font-size: 13px;
  font-weight: bold;
  line-height: 3;
  color: #38f;
  border-radius: 50%;
}

.mip-city-selection-letter-top {
  position: absolute;
  z-index: 40;
  top: 44px;
  left: 0;
  display: none;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  padding-left: 16px;
  line-height: 50px;
  background: #fff;
}

.mip-city-selection-large-char {
  position: absolute;
  top: 50%;
  left: 50%;
  display: none;
  width: 78px;
  height: 78px;
  margin-top: -39px;
  margin-left: -39px;
  font-size: 36px;
  line-height: 78px;
  text-align: center;
  color: #fff;
  border-radius: 3px;
  background: rgba(51, 51, 51, 0.4);
}
</style>

<script>
let viewport = MIP.viewport
let util = MIP.util
let rect = util.rect
let CustomStorage = util.customStorage
let Storage = new CustomStorage(0)
let cityData
export default {
  props: {
    list: {
      type: Object,
      default: function () {
        return {}
      }
    },
    maxHistory: {
      type: Number,
      default: 3
    },
    dataSrc: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      local: true,
      async: false,
      listOnline: [],
      history: [],
      offsetX: [],
      currentCity: {},
      cityData: '',
      visit: false
    }
  },
  mounted () {
    this.init(this.list)
    viewport.on('scroll', () => {
      this.getOffsetX()
    })
  },
  methods: {
    getOffsetX () {
      let scrollTop = viewport.getScrollTop()
      let offsetX = []
      let currentCitys = [...this.$element.querySelectorAll('.mip-city-selection-city')]
      for (let city of currentCitys) {
        offsetX.push(rect.getElementOffset(city).top + scrollTop)
      }
      this.offsetX = offsetX
    },
    showInfo (city) {
      this.getOffsetX()
      this.currentCity = city
      let isExit = false
      for (let i = 0; i < this.history.length; i++) {
        if (this.history[i].city === city.city) {
          let newCity = this.history[i]
          this.history.splice(i, 1)
          this.history.unshift(newCity)
          isExit = true
        }
      } if (!isExit) {
        this.history.unshift(city)
        this.history = this.history.slice(0, this.maxHistory)
      }
      cityData = JSON.stringify(this.history)
      Storage.set('cityData', cityData)
      this.$emit('citySelected', city)
      this.cityData = JSON.parse(Storage.get('cityData'))
      this.history = this.cityData
      let locationStorage = Storage.get('cityData', cityData)
      if (locationStorage) {
        this.history = JSON.parse(locationStorage)
        this.visit = true
      } else {
        this.visit = false
        return false
      }
    },
    scrollTocity (index) {
      this.getOffsetX()
      let finalOffsetX = this.offsetX[index]
      viewport.setScrollTop(finalOffsetX)
    },
    // 城市初始化，本地或异步加载方式加载
    init (list) {
      let url = this.$element.dataset.src || ''
      let that = this
      let getdata = new Promise(function (resolve, reject) {
        let cityData
        if (url) {
          that.local = false
          // 优先远程获取数据，覆盖本地配置数据
          fetch(url, {}).then(function (res) {
            if (res.ok) {
              res.json().then(function (data) {
                that.listOnline = data.list
                that.list = data.list
                resolve(data)
              })
            } else {
              reject(new Error('mip-city-selection 组件 Fetch 请求失败!'))
            }
          }).catch(function (e) {
            reject(new Error('mip-city-selection 组件 Fetch 请求失败!'))
          })
          that.async = true
        } else {
          that.listOnline = that.list
          cityData = that.$element.querySelector('script[type="application/json"]')
          that.async = false
          try {
            cityData = JSON.parse(cityData.textContent)
          } catch (e) {
            reject(new Error('mip-city-selection 组件 json 配置错误, 请检查 json 格式。'))
          }
          resolve(cityData)
          that.local = true
        }
      })
      getdata.then(function (data) {
        if (!data) {
          console.error('mip-city-selection 需要配置分组选项。可以配置到组件中，也可以配置远程数据。')
        }
      })
      //  缓存数据
      this.getOffsetX()
      //  显示locationStorage数据
      let locationStorage = Storage.get('cityData', cityData)
      if (locationStorage) {
        this.history = JSON.parse(locationStorage)
        this.visit = true
      } else {
        this.visit = false
      }
    }
  }
}
</script>
