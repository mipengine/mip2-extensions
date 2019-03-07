/**
 * @file mip-experiment.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

const {CustomElement, util, templates, Services} = MIP
const {info, warn} = util.log('mip-experiment')

const customStorage = util.customStorage(0)

/**
 * 发送统计
 *
 * @param  {Object} obj 日志参数
 * @param  {string} groupName 实验组名
 */
function sendStats (obj, groupName) {
  let expAttr = 'mip-x-' + groupName
  let expResult = document.body.getAttribute(expAttr) || 'default'
  window._hmt.push(['_trackEvent', obj.ele + '__' + obj.event, expAttr + '=' + expResult, obj.label])
}

class Experiment {
  /**
   * 实验组：使用 url 的 hash 分组、或根据历史 localstorage 分组、或设置新组
   *
   * @param  {string} name 实验名
   * @param  {Object} config 配置数据
   * @param  {boolean} needConsole 是否需要打印日志信息
   * @param {HTMLElement} element 组件节点
   */
  constructor (name, config, needConsole, element) {
    // 保存 mip-experiment 节点
    this.element = element

    // 获取单个抽样配置
    this.name = name
    this.needConsole = needConsole

    let options = config[name]
    this.variants = options.variants || {}
    this.variants.default = 100
    this.isSticky = options.hasOwnProperty('sticky') ? !!options.sticky : true
    this.descri = options.descri
    this.type = options.type
    this.baiduStats = options['baidu-stats']
  }

  /**
   * 获取实验分组
   *
   * @returns {string} group name
   */
  getGroup () {
    // 优先读取 hash 分组
    let groupFromHash = this.getGroupFromHash()
    if (this.needConsole) {
      info('实验名: ' + this.name + ', ' + this.descri)
      if (groupFromHash) {
        info('URL hash分组生效: ' + groupFromHash)
      }
    }

    // 如果固定实验组，那么检查 localstorage 是否已有分组信息
    let groupFromStorage
    if (this.isSticky && !groupFromHash) {
      groupFromStorage = this.getGroupFromStorage()
      if (this.needConsole) {
        info('历史分组生效: ' + groupFromStorage)
      }
    }

    // 前面条件都不满足则重新分配实验组
    let groupNew
    if (!groupFromStorage && !groupFromHash) {
      groupNew = this.getNewGroup()
      if (this.needConsole) {
        info('新分组: ' + groupNew)
      }
    }

    let finalGroup = groupFromHash || groupFromStorage || groupNew

    this.needConsole && info('最终分组: ' + finalGroup + '\n\n')

    return finalGroup
  }

  /**
   * 强制从 hash 中获取实验组名
   * hash：#mip-x-btn-color=red&mip-x-font-color=white
   *
   * @returns {string} 实验组名
   */
  getGroupFromHash () {
    let hash = window.location.hash.slice(1)
    let group = ''
    if (!hash) {
      return ''
    }

    let expGroupArr = hash.split('&')
    for (let i in expGroupArr) {
      if (!expGroupArr[i].match(this.name + '=')) {
        continue
      }
      let regExp = new RegExp('mip-x-' + this.name + '=([\\w-_]+)')
      let expGroup = regExp.exec(expGroupArr[i])[1]
      group = expGroup in this.variants ? expGroup : ''
    }
    return group
  }

  /**
   * 从 localStorage 中获取实验组名
   *
   * @returns {string} 实验组名
   */
  getGroupFromStorage () {
    let group = customStorage.get('mip-x-' + this.name)
    return group in this.variants ? group : ''
  }

  /**
   * 获取新实验组名
   *
   * @returns {string} 实验组名
   */
  getNewGroup () {
    // 生成随机数， 包含 0，但不包含 1
    let seed = Math.random() * 100
    let groupNames = Object.keys(this.variants)
    let weights = groupNames.map(name => this.variants[name])
    let start = 0

    // 计算随机数在哪个区间从而获得组名
    for (let i = 0, len = groupNames.length; i < len; i++) {
      let end = start + weights[i]
      if (seed >= start && seed < end) {
        return groupNames[i]
      }
      start = end
    }
  }

  /**
   * 将命中的组名添加到 body 属性上
   *
   * @param {string} groupName 实验组名
   */
  setExpGroup (groupName) {
    let attr = 'mip-x-' + this.name

    customStorage.set(attr, groupName)
    // 给body增加特殊class标识，用于发送统计日志
    document.querySelector('body').setAttribute(attr, groupName)

    // html代码块渲染抽样
    if (this.type === 'tag-abtest') {
      let element = this.element.querySelector('[for=' + this.name + ']')
      let data = {}
      data[groupName] = true
      templates.render(element, data, true).then(res => {
        let tag = document.createElement('div')
        tag.innerHTML = res.html
        element.appendChild(tag)
      })
    }
  }

  /**
   * 绑定百度统计
   *
   * @param {Array} baidustats baidu stats
   */
  bindBaiduStats (baidustats) {
    if (!window._hmt) {
      warn('<mip-experiment>找不到百度统计，请确认mip-stats-baidu.js在mip-experiment.js之前')
      return
    }

    for (let i = 0; i < baidustats.length; i++) {
      let statsVar = baidustats[i]
      let stats = {
        ele: statsVar[0] || '',
        event: statsVar[1] || '',
        label: statsVar[2] || '',
        eleDoms: []
      }

      if (stats.ele === 'window') {
        stats.eleDoms[0] = window
      } else {
        // 全局选择百度统计组件，与百度统计联动
        stats.eleDoms = document.querySelectorAll(stats.ele)
      }

      for (let j = 0; j < stats.eleDoms.length; j++) {
        let eleDom = stats.eleDoms[j]
        eleDom.addEventListener(stats.event, () => sendStats(stats, this.name), false)
      }
    }
  }
}

export default class MIPExperiment extends CustomElement {
  constructor (ele) {
    super(ele)

    let jsonScript = ele.querySelector('script[type="application/json"]')
    if (!jsonScript) {
      warn('<mip-experiment> 找不到配置')
      return
    }

    let config
    try {
      config = util.jsonParse(jsonScript.innerHTML)
    } catch (err) {
      warn('<mip-experiment>配置不是合法JSON, ' + err.message)
      return
    }

    this.needConsole = ele.hasAttribute('needconsole')

    Object.keys(config).forEach(name => {
      let exp = new Experiment(name, config, this.needConsole, ele)
      // 读取实验组
      let expGroup = exp.getGroup()
      // 执行分组：给body增加属性，渲染内部template
      exp.setExpGroup(expGroup)

      if (exp.baiduStats) {
        Services.extensions()
          .waitForExtension('mip-stats-baidu')
          .then(() => exp.bindBaiduStats(exp.baiduStats))
      }
    })
  }

  connectedCallback () {
    util.css(this.element, 'display', 'inherit')
  }
}
