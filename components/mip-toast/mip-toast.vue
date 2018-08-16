<template>
  <transtion name="fade">
    <div class="wrapper">
      <mip-fixed
        v-show="close"
        :class="station"
        type="top"
      >
        <div class="toast">
          <img
            v-if="show"
            :src="infoIconSrc"
            class="icon"
          >
          <p>{{ infoText }}</p>
        </div>
      </mip-fixed>
    </div>
  </transtion>
</template>
<style scoped>
.wrapper {
  z-index: 1000;
  margin: 0 auto;
  text-align: center;
  top: 33%;
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
  width: 1.4rem;
}

.center {
  top: 33%;
}

.top {
  top: 10%;
}

.bottom {
  top: 70%;
}

.icon {
  margin-top: 12px;
  width: 60%;
}

.toast p {
  padding: 15px 10px;
}

.fade-enter-active {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
  transition: opacity linear 240ms;
}
</style>

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
    station: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      show: true,
      close: false
    }
  },
  mounted () {
    this.$on('show', (str) => {
      this.close = true
      this.init()
    })
    this.$on('hidden', (str) => {
      this.close = false
    })
  },
  methods: {
    init () {
      if (!this.infoIconSrc) {
        this.show = false
      }
      if (this.autoClose) {
        setTimeout(() => {
          this.close = false
        }, 2500)
      }
    }
  }
}
</script>
