<template>
  <div class="mip-nav-wrapper">
    <div
      v-if="screenWidth <= dataWidth"
      class="navbar-header-contain">
      <div class="navbar-header">
        <a
          :href="dataBrandhref"
          class="navbar-brand">{{ dataBrandname }}</a>
        <button
          class="navbar-toggle collapsed"
          type="button"
          @click="openNavMenu">
          <span class="sr-only">导航</span>
          <span class="icon-bar"/>
          <span class="icon-bar"/>
          <span class="icon-bar"/>
        </button>
      </div>
      <div class="nav-list"><slot/></div>
    </div>
    <div
      v-else
      class="navbar-header">
      <a
        :href="dataBrandhref"
        class="navbar-brand">{{ dataBrandname }}</a>
      <div class="head-nav-list"><slot/></div>
    </div>
  </div>
</template>

<script>
const viewport = MIP.viewport

export default {
  props: {
    'data-id': {
      type: String,
      default: null
    },
    'data-width': {
      type: String,
      default: '767'
    },
    'data-showbrand': {
      type: String,
      default: null
    },
    'data-brandname': {
      type: String,
      default: null
    },
    'data-brandhref': {
      type: String,
      default: null
    }
  },
  firstInviewCallback (element) {
    this.bindEvents()
  },
  data () {
    return {
      show: false,
      screenWidth: viewport.getWidth()
    }
  },
  mounted () {
    const that = this
    window.onresize = () => {
      that.screenWidth = viewport.getWidth()
      this.show = !this.show
    }
  },
  methods: {
    bindEvents () {
      let that = this
      let ele = this.$el.querySelector('#navbar-wise-close-btn')
      ele.addEventListener('click', e => {
        that.closeNavMenu()
        e.preventDefault()
        e.stopPropagation()
      })
      let ele2 = this.$el.querySelector('.navbar-header-contain')
      ele2.addEventListener('touchmove', e => {
        e.preventDefault()
        e.stopPropagation()
      })
      let ele3 = this.$el.querySelector('.nav-list')
      ele3.addEventListener('touchmove', e => {
        e.stopPropagation()
      })
      let ele4 = this.$el.querySelector('.navbar-toggle')
      ele4.addEventListener('touchmove', e => {
        e.stopPropagation()
      })
      let ele5 = this.$el.querySelector('.navbar-brand')
      ele5.addEventListener('touchmove', e => {
        e.stopPropagation()
      })
    },
    openNavMenu () {
      let navList = this.$el.querySelector('#' + this.dataId)
      let navHeader = this.$el.querySelector('.navbar-header')
      let navHeaderHeight = navHeader.offsetHeight
      let navHeaderTop = navHeader.offsetTop
      if (this.show) {
        this.closeNavMenu()
        return
      }
      navList.style.transform = 'scaleY(1)'
      navList.style.height = (viewport.getHeight() - navHeaderHeight - navHeaderTop) + 'px'
      this.$el.style.height = (viewport.getHeight() - navHeaderTop) + 'px'
      document.documentElement.setAttribute('style', 'height: 100% !important; overflow: hidden')
      document.body.setAttribute('style', 'height: 100% !important; overflow: hidden')
      this.show = !this.show
    },
    closeNavMenu () {
      let that = this
      let navList = this.$el.querySelector('#' + this.dataId)
      let navHeader = this.$el.querySelector('.navbar-header')
      let navHeaderHeight = navHeader.offsetHeight
      this.show = !this.show
      navList.style.transform = 'scaleY(0)'
      navList.addEventListener('transitionend', e => {
        if (!that.show) {
          navList.style.height = '0px'
          that.$el.style.height = navHeaderHeight + 'px'
          document.documentElement.style.overflow = 'scroll'
          document.documentElement.style.height = ''
          document.body.style.overflow = 'scroll'
          document.body.style.height = ''
        }
      })
    }
  }
}
</script>

<style lang="less">
  mip-nav-slidedown {
    .mip-nav-wrapper {
        &.show {
            opacity: 1!important;
        }
        .hr-xs {
            display: none;
        }
    }
    .navbar-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
    }
    .navbar-brand {
        background-size: 100% auto;
        font-size: 26px;
        &:hover,
        &:active {
            color: rgba(255, 255, 255, 0.85);
        }
    }
    .navbar-toggle {
        width: 33px;
        padding: 5px;
        border: 0;
        background: transparent;
        float: right;
        .icon-bar {
            background-color: white;
            height: 2px;
            width: 23px;
            background: #999;
            display: block;
        }
        .icon-bar + .icon-bar {
            margin-top: 6px;
        }
    }
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }
    #navbar-wise-close-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #d4d4d4;
        display: inline-block;
        position: relative;
        &:before {
            content: '';
            width: 1px;
            height: 25px;
            display: inline-block;
            position: absolute;
            background: #d4d4d4;
            transform: rotate(45deg);
            -webkit-transform: rotate(45deg);
            top: 7px;
        }
        &:after {
            content: '';
            width: 1px;
            height: 25px;
            display: inline-block;
            position: absolute;
            background: #d4d4d4;
            transform: rotate(-45deg);
            -webkit-transform: rotate(-45deg);
            top: 7px;
        }
        &.down {
            background: #f3f3f3;
        }
    }
    #bs-navbar {
      height: 0;
      transform: scaleY(0);
      transform-origin: 0 0;
      transition: transform .2s ease;
      overflow-y: scroll;
      -webkit-overflow-scrolling : touch;
      overflow-scrolling : touch;
      z-index: 1000;
      border: 0;
      background-color: white;
      .navbar-nav {
          margin: 0;
          height: 100%;
          display: block;
          a,
          mip-link,
          span {
              text-align: center;
              color: #333;
              font-size: 18px;
              padding: 0;
              margin: 0 auto;
              display: block;
          }
      }
    }
    .nav-list {
      position: absolute;
      width: 100%;
      z-index: 1000;
      #bs-navbar {
        .navbar-nav {
          li {
            line-height: 50px;
            padding: 5px 0;
          }
        }
      }
    }
    .head-nav-list {
      display: block;
      #bs-navbar {
        height: 100%;
        transform: scaleY(1);
        overflow-x: hidden;
        .navbar-nav {
            display: -ms-flexbox;
            display: -webkit-box;
            display: -webkit-flex;
            display: flex;
            margin-right: -10px;
            li {
                list-style: none;
                &.active a,
                &.active mip-link
                &.active span {
                    color: black;
                    font-weight: bold;
                }
            }
            mip-link,
            a,
            span {
                white-space: nowrap;
                padding: 10px;
                color: #666;
                &:hover,
                &:focus {
                    text-decoration: none;
                    background: transparent;
                    color: black;
                }
            }
        }
        .navbar-wise-close {
            display: none;
        }
      }
    }
  }

</style>
