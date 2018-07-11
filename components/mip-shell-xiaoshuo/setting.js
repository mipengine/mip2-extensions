// 默认配置
let DEFAULTS = {
  theme: 'default',
  fontSize: 3
}
let STORAGE_KEY = 'mip-shell-xiaoshuo-mode'
let CustomStorage = MIP.util.customStorage
let storage = new CustomStorage(0)
let extend = MIP.util.fn.extend

// 获取默认配置及用户历史配置
function __getConfig () {
  let config = DEFAULTS
  try {
    config = extend(config, JSON.parse(storage.get(STORAGE_KEY)))
  } catch (e) {}
  return config
};
// 将配置应用在页面上
function __setConfig (config) {
  config = extend(__getConfig(), config)
  storage.set(STORAGE_KEY, JSON.stringify(config))
  if (config.theme) {
    document.documentElement.setAttribute('mip-shell-xiaoshuo-theme', config.theme)
  }
  if (config.fontSize) {
    document.documentElement.setAttribute('mip-shell-xiaoshuo-font-size', config.fontSize)
  }
};

// 更多设置：字体大小，背景颜色
export const settingHtml = `
    <div class="mip-shell-xiaoshuo-control-fontsize">
        <ul>
            <li class="reduce" on="tap:xiaoshuo-shell.changeFont(smaller)">A-</li>
            <li class="progress">
                <input type="range" step="0.5" min="1" max="6" value="${__getConfig().fontSize}">
            </li>
            <li class="increase" on="tap:xiaoshuo-shell.changeFont(bigger)">A+</li>
        </ul>
    </div>
    <div class="mip-shell-xiaoshuo-control-theme">
        <ul>
            <li><span class="theme-default" on="tap:xiaoshuo-shell.changeMode(default)"></span></li>
            <li><span class="theme-green" on="tap:xiaoshuo-shell.changeMode(green)"></span></li>
            <li><span class="theme-paper" on="tap:xiaoshuo-shell.changeMode(paper)"></span></li>
        </ul>
    </div>`

// 改变背景色
export class PageStyle {
  // TODO 可以支持config 的配置，配置颜色
  constructor () {
    // 如果用户手动设置背景色，则以用户为准。否则按照缓存设置。
    // data参数例为{'theme': night}
    this.update = (e, data) => {
      if (data) {
        __setConfig(data)
      } else {
        __setConfig(__getConfig())
      }
    }
  }
}

// 改变字体大小
export class FontSize {
  constructor (element) {
    this.element = element
    this.fontInput = element.querySelector('input[type="range"]')
  }
  // 获取当前滑块位置/字体大小
  _getInputValue () {
    return parseFloat(this.fontInput.value)
  }
  // 调整滑块位置和字体大小
  _setInputValue (value) {
    this.min = parseInt(this.fontInput.getAttribute('min'))
    this.max = parseInt(this.fontInput.getAttribute('max'))
    if (value > this.max || value < this.min) {
      return
    }
    this.fontInput.value = value
    // 计算字体大小后，广播告诉所有页面
    window.MIP.viewer.page.broadcastCustomEvent({
      name: 'changePageStyle', data: {fontSize: value}
    })
    // __setConfig({
    //   fontSize: value
    // })
  }
  // 绑定点击事件
  changeFont (data) {
    if (data === 'bigger') {
      // 点击增大按钮
      this._setInputValue(this._getInputValue() + 0.5)
    } else if (data === 'smaller') {
      // 点击减小按钮
      this._setInputValue(this._getInputValue() - 0.5)
    }
  }
  // 绑定字体大小改变事件
  bindDragEvent () {
    let me = this
    // 拖动事件
    this.element.addEventListener('touchmove', function () {
      me._setInputValue(me._getInputValue())
    })
    // 点击事件
    this.element.addEventListener('click', function () {
      me._setInputValue(me._getInputValue())
    })
  }
  // 显示小说字体设置bar
  showFontBar (e) {
    document.querySelector('.mip-xiaoshuo-settings').classList.add('show')
  }
  hideFontBar (e) {
    document.querySelector('.mip-xiaoshuo-settings').classList.remove('show')
  }
}
