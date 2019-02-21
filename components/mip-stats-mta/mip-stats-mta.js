/**
 * @file mip-stats-mta 腾讯移动分析组件
 * @author fe-team@jianke.com
 */

/* global MIP */

const { util, CustomElement } = MIP
const { Gesture, fn, jsonParse } = util
const logger = util.log('mip-stats-mta')

/**
 * 绑定自定义事件 mta 统计的属性
 *
 * @type {string}
 */
const DATA_STATS_MTA_OBJ = 'data-stats-mta'

export default class MIPStatsMta extends CustomElement {
  /**
   * 渲染组件
   */
  build () {
    const elem = this.element
    const config = getStatsMtaConfig(elem) || {}
    if (config) {
      const { name, sid, cid, version = 'v2.0.4' } = config
      if (checkMtaConfigIsError({ name, sid, cid })) {
        return
      }

      const mta = document.createElement('script')
      mta.src = `//pingjs.qq.com/h5/stats.js?${version}`
      mta.setAttribute('name', name)
      mta.setAttribute('sid', sid)
      mta.setAttribute('cid', cid)
      const s = document.getElementsByTagName('script')[0]
      s.parentNode.insertBefore(mta, s)
      bindEle()
    } else {
      logger.warn(elem, 'mta 配置信息错误')
    }
  }
}

/**
 * 检测统计的配置信息参数
 *
 * @param   {Object} config 统计的配置信息
 * @returns {boolean} isError 返回检查到的参数合法状态
 */
function checkMtaConfigIsError (config) {
  const isError = Object.keys(config).some((item) => {
    if (config[item]) {
      return false
    }
    logger.warn(this, `mta配置信息错误：${item} 不能为空`)
    return true
  })
  return isError
}

/**
 * 从组件中的 type 为 "application/json" 的 script 标签中获取 JSON 数据
 *
 * @param   {HTMLElement}  el  mip-stats-mta 的 DOM 元素
 * @returns {Object}           mta 统计的配置信息
 */
function getStatsMtaConfig (el) {
  try {
    const script = el.querySelector('script[type="application/json"]')
    if (script) {
      return jsonParse(script.textContent) || {}
    }
  } catch (e) {
    logger.warn(el, '配置数据不是合法的 JSON', e)
  }
}

/**
 * @param {Array<Object>} data mta 自定义采集数据的配置
 *
 * 数组第一个参数表示，事件列表中添加的事件ID，ID需要先在MTA前台配置好才能生效。
 * 数组第二个参数表示，事件参数，参数需要先在MTA前台配置好才能生效。
 */
function mtaSend (data) {
  if (!data) {
    return
  }

  try {
    const eventId = data[0]
    const eventParams = data[1] || null
    const MtaH5 = window.MtaH5
    if (MtaH5) {
      MtaH5.clickStat(eventId, eventParams)
    } else {
      logger.error(this, 'MtaH5 未定义!')
    }
  } catch (error) {
    logger.error(this, 'mta 数据发送失败')
  }
}

/**
 * 事件触发
 */
function eventHandler () {
  const tempData = this.getAttribute(DATA_STATS_MTA_OBJ)
  if (!tempData) {
    return
  }

  try {
    const statusJson = jsonParse(decodeURIComponent(tempData))
    const attrData = statusJson.data
    if (!attrData) {
      return
    }
    mtaSend(attrData)
  } catch (e) {
    logger.warn(this, '事件追踪 data-stats-mta 数据不正确')
  }
}

/**
 * 处理点击统计的 DOM 列表
 *
 * @param {Array<HTMLElement>} tagBox 需要记录点击统计的 DOM 元素列表
 */
function bindEleHandler (tagBox) {
  for (let index = 0; index < tagBox.length; index++) {
    const tagBoxItem = tagBox[index]
    let statusData = tagBoxItem.getAttribute(DATA_STATS_MTA_OBJ)
    /**
     * 检测statusData是否存在
     */
    if (!statusData) {
      continue
    }

    try {
      statusData = jsonParse(decodeURIComponent(statusData))
    } catch (e) {
      logger.warn(tagBoxItem, '事件追踪 data-stats-mta 数据不正确')
      continue
    }

    const eventType = statusData.type

    /**
     * 检测传递数据是否存在
     */
    if (!statusData.data) {
      continue
    }

    if (eventType !== 'click' && eventType !== 'mouseup') {
      // 事件限制到click,mouseup
      continue
    }

    if (tagBoxItem.classList.contains('mip-stats-eventload')) {
      continue
    }

    tagBoxItem.classList.add('mip-stats-eventload')

    // 解决on=tap: 和click冲突短线方案
    // TODO 这个为短线方案
    if (eventType === 'click' &&
        tagBoxItem.hasAttribute('on') &&
        tagBoxItem.getAttribute('on').match('tap:') &&
        fn.hasTouch()) {
      const gesture = new Gesture(tagBoxItem)
      gesture.on('tap', eventHandler)
    } else {
      tagBoxItem.addEventListener(eventType, eventHandler, false)
    }
  }
}

/**
 * 绑定事件追踪
 */
function bindEle () {
  const now = Date.now()
  const intervalTimer = setInterval(function () {
    // 获取所有需要触发的dom
    const tagBox = document.querySelectorAll(`*[${DATA_STATS_MTA_OBJ}]`)
    bindEleHandler(tagBox)
    // 由于存在异步渲染
    if (Date.now() - now >= 8000) {
      clearInterval(intervalTimer)
    }
  }, 100)
}
