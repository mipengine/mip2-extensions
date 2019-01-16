const {CustomElement, util, templates, Services} = MIP

const customStorage = util.customStorage(0)

class Experiment {
  /**
   * read experiment group: use url group、history group, or set new group
   *
   * @param  {string} expName experiment name
   * @param  {Object} expJson json for experiment config
   * @param  {boolean} needConsole whether dump group info to console
   * @param {HTMLElement} tagElement element
   */
  constructor (expName, expJson, needConsole, tagElement) {
    // 保存mip-experiment节点
    this.element = tagElement

    // 获取单个抽样配置
    this.expName = expName
    this.needConsole = needConsole

    let exp = expJson[expName]
    this.expVar = exp.variants || {}
    this.expVar.default = 100
    this.isSticky = exp.hasOwnProperty('sticky') ? !!exp.sticky : true
    this.descri = exp.descri
    this.type = exp.type
    this.baiduStats = exp['baidu-stats']
  }

  /**
   * get experiment group
   *
   * @returns {string} group name
   */
  getExpGroup () {
    // if url hash is set, get group from URL
    let groupFromUrl = this._getExpGroupFromUrl()
    if (this.needConsole) {
      console.warn('实验名: ' + this.expName + ', ' + this.descri)
      if (groupFromUrl) {
        console.warn('URL hash分组生效: ' + groupFromUrl)
      }
    }

    // if history is set, get group from localstorage
    let groupFromStorage = ''
    if (this.isSticky && !groupFromUrl) {
      groupFromStorage = this._getExpGroupFromStorage()
      if (this.needConsole) {
        console.warn('历史分组生效: ' + groupFromStorage)
      }
    }

    let groupNew

    // make a new arrengment
    if (!groupFromStorage && !groupFromUrl) {
      groupNew = this._getExpGroupNew()
      if (this.needConsole) {
        console.warn('新分组: ' + groupNew)
      }
    }

    let finalGroup = groupFromUrl || groupFromStorage || groupNew
    if (this.needConsole) {
      console.warn('最终分组: ' + finalGroup + '\n\n')
    }
    return finalGroup
  }
  /**
   * get forced group from URL
   * hash：#mip-x-btn-color=red&mip-x-font-color=white
   *
   * @returns {string} experiment group name
   */
  _getExpGroupFromUrl () {
    let hash = window.location.hash.slice(1)
    let group = ''
    if (!hash) {
      return ''
    }

    let expGroupArr = hash.split('&')
    for (let i in expGroupArr) {
      if (!expGroupArr[i].match(this.expName + '=')) {
        continue
      }
      let regExp = new RegExp('mip-x-' + this.expName + '=([\\w-_]+)')
      let expGroup = regExp.exec(expGroupArr[i])[1]
      group = expGroup in this.expVar ? expGroup : ''
    }
    return group
  }

  /**
   * get group form localstorage
   *
   * @returns {string} experiment group name
   */
  _getExpGroupFromStorage () {
    let group = customStorage.get('mip-x-' + this.expName)
    return group in this.expVar ? group : ''
  }

  /**
   * reset group
   *
   * @returns {string} experiment group name
   */
  _getExpGroupNew () {
    let rNumber = Math.random() * 100
    let groups = Object.keys(this.expVar)
    // 根据随机数和每组份数计算新分组
    for (let i = 0; i < groups.length - 1; i++) {
      let percentCur = this._addVars(i, this.expVar)
      // XXX: i为字符串，i-0变为数字
      let percentNext = this._addVars(i + 1, this.expVar)
      if (i === 0 && rNumber < this.expVar[groups[0]]) {
        return groups[0]
      }
      if (rNumber >= percentCur && rNumber < percentNext) {
        return groups[i + 1]
      } else if (rNumber > percentNext) {
        continue
      }
    }
    return 'default'
  }

  /**
   * Add config ratio recursively
   *
   * @param {number} i i
   * @param {Object} expVar variables in config
   * @returns {number} addition of config
   */
  _addVars (i, expVar) {
    let groups = Object.keys(expVar)
    if (i === 0) {
      return expVar[groups[0]]
    }
    return expVar[groups[i]] + this._addVars(i - 1, expVar)
  }

  /**
   * assign experiment to <body>
   *
   * @param {string} expGroup experiment group
   */
  setExpGroup (expGroup) {
    customStorage.set('mip-x-' + this.expName, expGroup)
    if (expGroup !== 'default') {
      // 给body增加特殊class标识，用于发送统计日志
      document.querySelector('body').setAttribute('mip-x-' + this.expName, expGroup)
    }
    // html代码块渲染抽样
    if (this.type === 'tag-abtest') {
      let element = this.element.querySelector('[for=' + this.expName + ']')
      let data = {}
      data[expGroup] = true
      templates.render(element, data, true).then(function (res) {
        let tag = document.createElement('div')
        tag.innerHTML = res.html
        element.appendChild(tag)
      })
    }
  }

  /**
   * bind event, when trigger, fire baidu-stats request
   *
   * @param {Array} baidustats baidu stats
   */
  bindBaiduStats (baidustats) {
    // make sure user need baidu-stats
    if (!baidustats) {
      return
    }

    // make sure baidu-stats exist
    if (!window._hmt) {
      console.warn('<mip-experiment>找不到百度统计，请确认mip-stats-baidu.js在mip-experiment.js之前')
      return
    }

    for (let i = 0; i < baidustats.length; i++) {
      let stats = {}
      let statsVar = baidustats[i]
      stats.ele = statsVar[0] || ''
      stats.event = statsVar[1] || ''
      stats.label = statsVar[2] || ''
      stats.eleDoms = []

      if (stats.ele === 'window') {
        stats.eleDoms[0] = window
      } else {
        // 全局选择百度统计组件，与百度统计联动
        stats.eleDoms = document.querySelectorAll(stats.ele)
      }

      for (let j = 0; j < stats.eleDoms.length; j++) {
        let eleDom = stats.eleDoms[j]

        eleDom.addEventListener(stats.event, this._sendStats.bind(undefined, stats, this.expName), false)
      }
    }
  }

  /**
   * send baidu-stats using certain value
   *
   * @param  {Object} obj params
   * @param  {string} expName name
   */
  _sendStats (obj, expName) {
    let expAttr = 'mip-x-' + expName
    let expResult = document.body.getAttribute(expAttr) || 'default'
    window._hmt.push(['_trackEvent', obj.ele + '__' + obj.event, expAttr + '=' + expResult, obj.label])
  }
}

class MIPExperiment extends CustomElement {
  constructor (ele) {
    super(ele)

    let jsonScript = ele.querySelector('script[type="application/json"]')
    if (!jsonScript) {
      console.warn('<mip-experiment> 找不到配置')
      return
    }

    let config
    // mip-experiment variables valication
    try {
      config = util.jsonParse(jsonScript.innerHTML)
    } catch (err) {
      console.warn('<mip-experiment>配置不是合法JSON, ' + err.message)
      return
    }

    this.needConsole = ele.hasAttribute('needconsole')

    Object.keys(config).forEach(name => {
      let exp = new Experiment(name, config, this.needConsole, ele)
      // read experiment group
      let expGroup = exp.getExpGroup()
      // 执行分组：给body增加属性，渲染内部template
      exp.setExpGroup(expGroup)

      if (exp.baiduStats) {
        Services.extensionsFor(window)
          .waitForExtension('mip-stats-baidu')
          .then(() => exp.bindBaiduStats(exp.baiduStats))
      }
    })
  }

  /* overwrite */
  connectedCallback () {
    util.css(this.element, 'display', 'inherit')
  }
}

export default MIPExperiment
