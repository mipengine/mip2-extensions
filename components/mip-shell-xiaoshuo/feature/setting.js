// 默认配置
let DEFAULTS = {
  theme: 'default',
  fontSize: 3.5
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
export function settingHtml () {
  return `
    <div class="mip-shell-xiaoshuo-control-fontsize">
        <ul>
            <li><span class="reduce click-cursor" on="click:xiaoshuo-shell.changeFont(smaller)">A-</span></li>
            <li class="progress">
                <input type="range" step="0.5" min="1" max="6" value="${__getConfig().fontSize}">
            </li>
            <li><span class="increase click-cursor" on="click:xiaoshuo-shell.changeFont(bigger)">A+</span></li>
        </ul>
    </div>
    <div class="mip-shell-xiaoshuo-control-theme">
        <ul>
            <li><span class="theme-default click-cursor" on="click:xiaoshuo-shell.changeMode(default)"></span></li>
            <li><span class="theme-paper click-cursor" on="click:xiaoshuo-shell.changeMode(paper)"></span></li>
            <li><span class="theme-green click-cursor" on="click:xiaoshuo-shell.changeMode(green)"></span></li>
        </ul>
    </div>`
}

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
  constructor () {
    // 由于element会更新，不能直接保存  document.querySelector
    // 为方便使用，只保存selector内容
    this.elementSelector = '.mip-shell-footer-wrapper .mip-shell-xiaoshuo-control-fontsize'
  }
  // 获取当前滑块位置/字体大小
  _getInputValue () {
    let fontInput = document.querySelector(this.elementSelector + ' input[type="range"]')
    return parseFloat(fontInput.value)
  }
  // 调整滑块位置和字体大小
  _setInputValue (value) {
    let fontInput = document.querySelector(this.elementSelector + ' input[type="range"]')
    this.min = parseInt(fontInput.getAttribute('min'))
    this.max = parseInt(fontInput.getAttribute('max'))
    if (value > this.max || value < this.min) {
      return
    }
    fontInput.value = value
    // 计算字体大小后，广播告诉所有页面
    window.MIP.viewer.page.broadcastCustomEvent({
      name: 'changePageStyle', data: {fontSize: value}
    })
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
    let event = window.MIP.util.event
    // 拖动事件
    event.delegate(document.documentElement, this.elementSelector + ' input[type="range"]', 'touchmove', () => {
      this._setInputValue(this._getInputValue())
    })
    // 点击事件
    event.delegate(document.documentElement, this.elementSelector + ' input[type="range"]', 'click', () => {
      this._setInputValue(this._getInputValue())
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
