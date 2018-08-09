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

mip-sidebar[side="left"] .fold-enter-active {
  -webkit-animation: sidebarLeftOpen 233ms cubic-bezier(0, 0, 0.21, 1);
  animation: sidebarLeftOpen 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side="left"] .fold-leave-active {
  -webkit-animation: sidebarLeftLeave 233ms cubic-bezier(0, 0, 0.21, 1);
  animation: sidebarLeftLeave 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side="right"] .fold-enter-active {
  -webkit-animation: sidebarRightOpen 233ms cubic-bezier(0, 0, 0.21, 1);
  animation: sidebarRightOpen 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side="right"] .fold-leave-active {
  -webkit-animation: sidebarRightLeave 233ms cubic-bezier(0, 0, 0.21, 1);
  animation: sidebarRightLeave 233ms cubic-bezier(0, 0, 0.21, 1);
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
  will-change: transform;
  display: block;
}

@keyframes sidebarLeftOpen {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes sidebarLeftLeave {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-100%);
  }
}
@keyframes sidebarRightOpen {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes sidebarRightLeave {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
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
      Runing: false
    }
  },
  mounted () {
    this.init()
    this.bindEvents()
  },
  methods: {
    init () {
      let self = this
      self.side = self.$element.getAttribute('side')
      if (self.side !== 'left' && self.side !== 'right') {
        self.side = 'left'
        self.$element.setAttribute('side', self.side)
      }
      if (!self.isOpen) {
        self.$element.setAttribute('aria-hidden', 'true')
      }
    },
    bindEvents () {
      let self = this
      self.$on('toggle', function (event) {
        self.toggle(self, event)
      })
      self.$on('open', function () {
        self.open(self)
      })
      self.$on('close', function (event) {
        self.close(self, event)
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
        this.Runing = !this.Runing
      }, ANIMATION_TIMEOUT)
      this.bodyOverflow = getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      this.$element.setAttribute('aria-hidden', 'false')
    },
    /**
     * [close 关闭 sidebar和 mask]
     *
     * @param  {Object} e 点击事件
     */
    close (e) {
      let self = this
      if (!self.Runing) {
        return
      }
      setTimeout(() => {
        self.Runing = !self.Runing
      }, ANIMATION_TIMEOUT)
      self.isOpen = !self.isOpen
      self.$element.setAttribute('aria-hidden', 'true')
      document.body.style.overflow = self.bodyOverflow
      let closeTimer = setTimeout(() => {
        util.css(self.$element, { display: 'none' })
        clearTimeout(closeTimer)
      }, ANIMATION_TIMEOUT)
      if (self.Runing) {
        return
      }
      self.Runing = !self.Runing
    },
    closeSidebar (e) {
      this.$emit('close', e)
    },
    /**
     * [toggle 打开或关闭 sidebar 入口]
     */
    toggle (event) {
      this.isOpen ? this.close(this, event) : this.open(this)
    }
  },
  prerenderAllowed () {
    return true
  }
}
</script>
