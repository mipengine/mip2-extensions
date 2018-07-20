<template>
  <div>
    <transtion name="fade">
      <div v-show="myDialog">
        <mip-fixed
          type="top left bottom right"
          class="mask"
        />
        <mip-fixed
          class="wrapper"
          type="top"
        >
          <div class="toast">
            <div class="confirm-title">
              <div>{{ infoTitle }}</div>
            </div>
            <p class="confirm-content">{{ infoText }}</p>
            <div
              v-show="confirm"
              class="confirm-footer"
            >
              <button
                class="confirm-footer-btn confirm-footer-left"
                @click="cancel()"
              >
                取消
              </button>
              <button
                class="confirm-footer-btn confirm-footer-right"
                @click="isOk()"
              >
                确定
              </button>
            </div>
            <div
              v-show="dialog"
              class="confirm-footer"
            >
              <button
                class="confirm-footer-btn confirm-footer-bottom"
                @click="isOk()"
              >
                确定
              </button>
            </div>
          </div>
        </mip-fixed>
      </div>
    </transtion>
  </div>
</template>

<style scoped>
.wrapper {
  z-index: 1000;
  margin: 0 auto;
  text-align: center;
  top: 33%;
  width: 90%;
  line-height: 1.5;
  background-color: rgba(255, 255, 255, 0.95);
}
.mask {
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
}
.toast {
  border: 1px solid rgba(0, 0, 0, 0.6);
  margin: 0 auto;
  background: white;
  /*border-radius: 10px;*/
  color: black;
  text-align: center;
  white-space: nowrap;
  font-size: 14px;
  line-height: 100%;
  height: auto;
}
.confirm-title {
  position: relative;
  padding: 20px 20px 10px;
  margin-bottom: -25px;
  text-align: center;
}
.confirm-title div {
  margin: 0;
  padding: 0;
  font-weight: 400px;
  font-size: 18px;
}
.confirm-content {
  margin: 25px 20px;
  color: #666;
  text-align: center;
  font-size: 15px;
}
.confirm-footer-btn {
  flex: 1;
  display: block;
  position: relative;
  display: inline-block;
  outline: none;
  margin: 0;
  padding: 0;
  height: 44px;
  line-height: 44px;
  color: #007aff;
  font-size: 17px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: none;
  background-color: transparent;
}
.mip-img {
  margin-top: 10px;
}
.toast p {
  padding: 10px 0;
  white-space: normal;
  line-height: 0.24rem;
}
.confirm-footer {
  display: flex;
  position: relative;
  font-size: 0;
  border: 0;
}
.confirm-footer-left {
  border-right-width: 0;
  border-left-width: 0;
  border-bottom-width: 0;
}
.confirm-footer-right {
  border-right-width: 0;
  border-bottom-width: 0;
}
.confirm-footer-bottom {
  border-right-width: 0;
  border-left-width: 0;
  border-bottom-width: 0;
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
    infoText: {
      type: String,
      default: ''
    },
    infoTitle: {
      type: String,
      default: ''
    },
    pattern: {
      type: String,
      default: 'alert'
    },
    isDemo: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      confirm: false,
      dialog: false,
      myDialog: false,
      click: false
    }
  },
  mounted () {
    this.init()
    this.$on('show', str => {
      this.myDialog = true
    })
    this.$on('hidden', str => {
      this.myDialog = false
    })
  },
  methods: {
    init () {
      if (this.isDemo) {
        this.click = true
        this.myDialog = false
      }

      if (this.pattern === 'confirm') {
        this.dialog = false
        this.confirm = true
      } else {
        this.confirm = false
        this.dialog = true
      }
    },
    mybtn () {
      this.myDialog = !this.myDialog
    },
    cancel () {
      this.$emit('ready', false)
      this.myDialog = false
      if (this.isDemo) this.click = true
    },
    isOk () {
      this.$emit('ready', true)
      this.myDialog = false
      if (this.isDemo) this.click = true
    }
  }
}
</script>
