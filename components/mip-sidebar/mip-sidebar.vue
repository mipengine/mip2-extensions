<template>
  <div>
    <mip-fixed
      type="top"
      still
      class="sidebar">
      <transition name="fold">
        <div
          v-show="isOpen"
          class="mip-sidebar-content"><slot/></div>
      </transition>
      <div
        v-show="isOpen"
        class="mip-sidebar-mask"
        @touchmove.prevent
        @click="closeSidebar"/>
    </mip-fixed>
  </div>
</template>

<style scoped>

.fold-enter {
  display: none;
}

mip-sidebar[side='left'] .fold-enter,
mip-sidebar[side='left'] .fold-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

mip-sidebar[side='left'] .fold-enter-active,
mip-sidebar[side='left'] .fold-leave-active {
  transition: all 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side='right'] .fold-enter-active,
mip-sidebar[side='right'] .fold-leave-active {
  transition: all 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side='right'] .fold-enter,
mip-sidebar[side='right'] .fold-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.sidebar {
  height: 100%;
}

.mip-sidebar-content {
  position: absolute !important;
  top: 0;
  max-height: 100% !important;
  height: 100%;
  max-width: 80% !important;
  background-color: white;
  min-width: 45px !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  z-index: 9999 !important;
  -webkit-overflow-scrolling: touch;
  display: block;
}

@keyframes sidebarMaskShow {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

mip-sidebar[side="left"] .mip-sidebar-content {
  left: 0 !important;
}

mip-sidebar[side="right"] .mip-sidebar-content {
  right: 0 !important;
}

.mip-sidebar-mask {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 9998 !important;
  transition: background-color 0.5s 0.05s;
  animation: sidebarMaskShow 0.5s cubic-bezier(0, 0, 0.21, 1);
}
</style>

<script>

const ANIMATION_TIMEOUT = 400

const util = MIP.util

export default {
  data () {
    return {
      isOpen: false,
      runing: false,
      side: null
    }
  },
  mounted () {
    this.init()
    this.bindEvents()
  },
  methods: {
    init () {
      this.side = this.$element.getAttribute('side')
      if (this.side !== 'left' && this.side !== 'right') {
        this.side = 'left'
        this.$element.setAttribute('side', this.side)
      }
      if (!this.isOpen) {
        this.$element.setAttribute('aria-hidden', 'true')
      }
    },
    bindEvents () {
      this.$on('toggle', e => {
        this.toggle(this, e)
      })
      this.$on('open', () => {
        this.open(this)
      })
      this.$on('close', e => {
        this.close(this, e)
      })
    },
    /**
     * [open 打开 sidebar和 mask]
     */
    open () {
      if (this.isOpen) {
        return
      }
      util.css(this.$element, { display: 'block' })
      this.isOpen = !this.isOpen

      setTimeout(() => {
        this.runing = !this.runing
      }, ANIMATION_TIMEOUT)
      this.bodyOverflow = getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      this.$element.setAttribute('aria-hidden', 'false')
    },
    /**
     * [close 关闭 sidebar和 mask]
     *
     * @param {Object} e 点击事件
     */
    close (e) {
      if (!this.runing) {
        return
      }
      setTimeout(() => {
        this.runing = !this.runing
      }, ANIMATION_TIMEOUT)
      this.isOpen = false
      this.$element.setAttribute('aria-hidden', 'true')
      document.body.style.overflow = this.bodyOverflow
      let closeTimer = setTimeout(() => {
        util.css(this.$element, { display: 'none' })
        clearTimeout(closeTimer)
      }, ANIMATION_TIMEOUT)
      if (this.runing) {
        return
      }
      this.runing = !this.runing
    },
    closeSidebar (e) {
      this.$emit('close', e)
    },
    /**
     * [toggle 打开或关闭 sidebar 入口]
     *
     * @param {Object} e 事件
     */
    toggle (e) {
      this.isOpen ? this.close(this, e) : this.open(this)
    }
  },
  prerenderAllowed () {
    return true
  }
}
</script>
