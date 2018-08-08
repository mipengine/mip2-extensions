<template>
  <div >
    <mip-fixed
      type="top"
      still
      class="MIP-SIDEBAR">
      <transition name="fold">
        <div
          v-show="IsOpen"
          class="MIP-SIDEBAR-CONTENT"><slot/></div>
      </transition>
      <div
        v-show="IsOpen"
        class="MIP-SIDEBAR-MASK"
        @click="closeSidebar"/>
    </mip-fixed>
  </div>
</template>

<style scoped>
mip-sidebar[side="left"] .fold-enter-active {
  animation: sidebarLeftOpen 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side="left"] .fold-leave-active {
  animation: sidebarLeftLeave 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side="right"] .fold-enter-active {
  animation: sidebarRightOpen 233ms cubic-bezier(0, 0, 0.21, 1);
}

mip-sidebar[side="right"] .fold-leave-active {
  animation: sidebarRightLeave 233ms cubic-bezier(0, 0, 0.21, 1);
}

.MIP-SIDEBAR {
  height: 100%;
}

.MIP-SIDEBAR-CONTENT {
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

mip-sidebar[side="left"] .MIP-SIDEBAR-CONTENT {
  left: 0 !important;
}

mip-sidebar[side="right"] .MIP-SIDEBAR-CONTENT {
  right: 0 !important;
}

.MIP-SIDEBAR-MASK {
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
      IsOpen: false,
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
      if (!self.IsOpen) {
        self.$element.setAttribute('aria-hidden', 'true')
      }
    },
    bindEvents () {
      let self = this
      let mask = self.$element.querySelector('.MIP-SIDEBAR-MASK')
      self.$on('toggle', function (event) {
        self.toggle(self, event)
      })
      self.$on('open', function () {
        self.open(self)
      })
      self.$on('close', function (event) {
        self.close(self, event)
      })
      document.addEventListener(
        'keydown',
        function (event) {
          if (event.keyCode === 27) {
            self.close(self, event)
          }
        },
        false
      )
      mask.addEventListener('touchmove', function (evt) {
        evt.preventDefault()
      }, false)
    },
    /**
     * [open 打开 sidebar和 mask]
     */
    open () {
      let self = this

      if (self.IsOpen) {
        return
      }
      util.css(self.$element, { display: 'block' })
      self.IsOpen = !self.IsOpen
      setTimeout(() => {
        self.Runing = !self.Runing
      }, ANIMATION_TIMEOUT)
      self.bodyOverflow = getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      self.$element.setAttribute('aria-hidden', 'false')
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
      self.IsOpen = !self.IsOpen
      e.preventDefault()
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
      this.IsOpen ? this.close(this, event) : this.open(this)
    }
  },
  prerenderAllowed () {
    return true
  }
}
</script>
