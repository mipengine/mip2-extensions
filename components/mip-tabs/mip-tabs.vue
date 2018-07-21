<template>
  <div class="mip-tabs">
    <div
      ref="labelWrap"
      class="mip-tabs-label-wrap"
    >
      <div ref="labelContainer">
        <div
          v-for="(label, index) in labels"
          :key="index"
          :class="{ optionColor: index === currentIndex}"
          :disabled="label.disabled"
          class="mip-tabs-label"
          @click="changeTab(index, label.disabled)"
        >
          <span>{{ label.name }}</span>
        </div>
        <div
          :style="lineStyle"
          class="mip-tabs-line"
        />
      </div>
    </div>
    <div
      :style="contentStyle"
      class="mip-tabs-content-wrap"
    >
      <slot/>
    </div>
  </div>
</template>

<script>
let util = MIP.util
let rect = util.rect
// let log = console.log.bind('MIP')

export default {
  props: {
    initialTab: {
      type: Number,
      default: 0
    },
    resetTab: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      labels: [],
      tabs: [],
      labelDom: [],
      lastIndex: this.initialTab,
      currentIndex: this.initialTab,
      lineStyle: {},
      contentStyle: {}
    }
  },
  watch: {
    currentIndex (cur, pre) {
      this.tabs[pre].setAttribute('is-active', false)
      this.tabs[cur].setAttribute('is-active', true)
    },
    resetTab (cur, pre) {
      cur && this.initTab()
    }
  },
  mounted () {
    // 初始化
    this.initTab()

    // 注册方法
    this.registerEvent()
  },
  methods: {
    /**
     * 初始化组件
     *
     */
    initTab () {
      this.setTabLabel()
    },
    /**
     * 注册方法
     *
     */
    registerEvent () {
      // 外部切换标签
      this.$on('slideTab', (index) => {
        this.changeTab(index)
      })
    },
    /**
     * 获取标签数据
     *
     */
    setTabLabel () {
      let labels = []

      // 获遍历tab下一级子节点的label
      let tabContent = this.$element.querySelector('.mip-tabs-content-wrap')
      let childLabel = tabContent.children

      for (let item of [...childLabel]) {
        // 过滤非<mip-tabs-item/>节点
        if (item.nodeName !== 'MIP-TABS-ITEM') {
          continue
        }

        // 存储tabs & label 节点
        this.tabs.push(item)
        labels.push({
          'name': item.getAttribute('label'),
          'disabled': item.getAttribute('disabled')
        })
      }

      this.labels = labels

      // label渲染完成后
      this.$nextTick(() => {
        // 初始的tab内容显示
        this.tabs[this.initialTab].setAttribute('is-active', true)

        // 缓存label
        this.labelDom = this.$refs.labelContainer.querySelectorAll('.mip-tabs-label')

        // 初始化tab-line、tab-item位置
        this.moveTab(this.initialTab)
      })
    },

    /**
     * 切换内容
     *
     * @param  {number} index  当前tab的下标
     * @param  {boolean} dis  是否有disabled属性
     */
    changeTab (index, dis) {
      // disabled 时直接返回
      if (dis) {
        return
      }

      this.currentIndex = index

      // tab-line 及 tab-item 动画
      this.moveTab(index)

      // 派发事件 透传当前下标
      this.$emit('changeEnd', index)
    },

    /**
     * tab切换时的动画
     *
     * @param  {number} index  当前tab的下标
     */
    moveTab (index) {
      // 当前标签的rect值
      let currenLabel = this.labelDom[index].querySelector('span')

      let tabRect = rect.getElementRect(currenLabel)

      // label 滑动距离
      let firstLabel = this.labelDom[0]
      let firstLabelRect = rect.getElementRect(firstLabel)

      // tab line的偏移量
      let offsetX = tabRect.left - firstLabelRect.left
      this.lineStyle = {
        'width': `${tabRect.width}px`,
        'transform': `translate3d(${offsetX}px, 0, 0)`
      }

      // 容器宽度
      let translateX = -rect.getElementRect(this.$el).width * index
      this.contentStyle = {
        'transform': `translate3d(${translateX}px, 0, 0)`
      }
    },

    /**
     * 色值校验
     *
     * @param  {string} color  色值
     */
    checkColor (color) {
      if (color.charAt(0) === '#') {
        color = color.substring(1)
        return [3, 4, 6, 8].indexOf(color.length) > -1 && !isNaN(parseInt(color, 16))
      } else {
        return /^(rgb|hsl)a?\((\d+%?(deg|rad|grad|turn)?[,\s]+){2,3}[\s/]*[\d.]+%?\)$/i.test(color)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.mip-tabs {
  margin: 0 auto;
  height: 100%;
  padding-bottom: 40px;
  overflow: hidden;
  .mip-tabs-label-wrap {
    font-size: 14px;
    line-height: 1.5;
    position: relative;
    background: #fff;
    z-index: 2;
    .optionColor {
      color: #1890ff;
      span {
        color: #1890ff;
      }
    }
    & > div {
      overflow-x: auto;
      white-space: nowrap;
      position: relative;
      &::-webkit-scrollbar {
        display: none;
      }
    }
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 2px;
      background-color: #e4e7ed;
      z-index: 1;
    }

    .mip-tabs-label {
      padding: 0 20px;
      height: 40px;
      box-sizing: border-box;
      line-height: 40px;
      display: inline-block;
      list-style: none;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      position: relative;
      text-decoration: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      cursor: pointer;
      &[disabled] {
        color: #ccc;
      }
    }

    .mip-tabs-line {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background-color: #409eff;
      z-index: 2;
      transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      list-style: none;
      transition: all 0.3s;
    }
  }

  .mip-tabs-content-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    box-sizing: content-box;
    transition: all 0.3s;
    /deep/ mip-tabs-item {
      padding-left: 20px;
      width: 100%;
      box-sizing: border-box;
      overflow: auto;
      flex-shrink: 0;
      width: 100%;
      height: 100%;
      position: relative;
      transition-property: -webkit-transform;
      transition-property: transform;
      transition-property: transform, -webkit-transform;
    }
  }
}
</style>
