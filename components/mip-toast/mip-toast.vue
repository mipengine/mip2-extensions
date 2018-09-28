<template>
  <transtion name="fade">
    <div class="wrapper">
      <mip-fixed
        v-show="close"
        :class="station"
        type="top"
      >
        <div :class="{limitWdith:hasPic}">
          <div class="toast">
            <img
              v-if="show"
              :src="infoIconSrc"
              class="icon"
            >
            <p :class="{block:isBlock}"> {{ showToastText }} </p>
          </div>
        </div>
      </mip-fixed>
    </div>
  </transtion>
</template>
<script>
export default {
  props: {
    infoIconSrc: {
      type: String,
      default: ''
    },
    infoText: {
      type: String,
      default: ''
    },
    autoClose: {
      type: Boolean,
      default: true
    },
    closeTime: {
      type: Number,
      default: 2500
    },
    station: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      show: true,
      close: false,
      isBlock: false,
      hasPic: false,
      showToastText: '',
      showTime: 2500
    }
  },
  mounted () {
    this.$on('show', (info) => {
      this.close = true
      if (typeof info === 'string') {
        this.showToastText = info
      } else {
        this.showToastText = this.infoText
      }
      this.init()
    })
    this.$on('hidden', () => {
      this.close = false
    })
  },
  methods: {
    init () {
      if (typeof this.closeTime === 'number' && !!this.closeTime && this.closeTime !== 2500) {
        this.showTime = this.closeTime * 1000
      }
      if (!this.infoIconSrc) {
        this.show = false
      } else {
        this.isBlock = true
        this.hasPic = true
      }
      if (this.autoClose) {
        setTimeout(() => {
          this.close = false
        }, this.showTime)
      }
    }
  }
}
</script>
<style scoped>
.wrapper {
  z-index: 1000;
  margin: 0 auto;
  text-align: center;
  top: 33%;
}

.limitWdith {
  width: 70%;
  margin: 0 auto;
}

.block {
  display: block !important;
}

.toast {
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  font-size: 14px;
  line-height: 100%;
  height: auto;
  display: inline-block;
}

.center {
  top: 33%;
  text-align: center;
}

.top {
  top: 10%;
  text-align: center;
}

.bottom {
  top: 70%;
  text-align: center;
}

.icon {
  margin-top: 12px;
  width: 60%;
}

p {
  display: inline-block;
  padding: 15px 15px;
}

.fade-enter-active {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
  transition: opacity linear 240ms;
}
</style>
