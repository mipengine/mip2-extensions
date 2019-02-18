/**
 * @file mip-stats-mta 腾讯移动分析组件
 * @author fe-team@jianke.com
 */

/* global MIP */

const { util, CustomElement } = MIP
const { Gesture, fn, jsonParse } = util
const logger = util.log('mip-stats-mta')

/**
 * 绑定交互式的百度统计的属性
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
    const config = getConfig(elem)
    if (config) {
      const mta = document.createElement('script')
      mta.src = config.mta_url
      mta.setAttribute('name', config.name)
      mta.setAttribute('sid', config.sid)
      mta.setAttribute('cid', config.cid)
      const s = document.getElementsByTagName('script')[0]
      s.parentNode.insertBefore(mta, s)
      // logger.log(MtaH5)
      bindEle()
    } else {
      logger.warn('mta config is wrong')
    }
  }
}

/**
 *
 * @param   {HTMLElement}  el  mip-stats-mta 的 DOM 元素
 * @returns {Object}           mta的配置信息
 *
 *  */
function getConfig (el) {
  let config = {}
  const setconfig = el.getAttribute('setconfig')
  try {
    config = decodeURIComponent(setconfig)
    config = JSON.parse(config)
  } catch (e) {
    config = null
  }
  return config
}
/**
 *
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
      logger.error('MtaH5 is undefined!')
    }
  } catch (error) {
    logger.error('mta send fail! error:', error)
  }
}

// 事件触发
function eventHandler () {
  const tempData = this.getAttribute(DATA_STATS_MTA_OBJ)
  if (!tempData) {
    return
  }

  let statusJson = {}
  try {
    statusJson = jsonParse(decodeURIComponent(tempData))
  } catch (e) {
    logger.warn('事件追踪data-stats-mta数据不正确')
    return
  }
  if (!statusJson.data) {
    return
  }

  const attrData = statusJson.data
  mtaSend(attrData)
}

/**
 * 处理点击统计的 DOM 列表
 *
 * @param {Array<HTMLElement>} tagBox 需要记录点击统计的 DOM 元素列表
 */
function bindEleHandler (tagBox) {
  for (let index = 0; index < tagBox.length; index++) {
    let statusData = tagBox[index].getAttribute(DATA_STATS_MTA_OBJ)

    /**
     * 检测statusData是否存在
     */
    if (!statusData) {
      continue
    }

    try {
      statusData = JSON.parse(decodeURIComponent(statusData))
    } catch (e) {
      logger.warn('事件追踪data-stats-mta数据不正确')
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

    if (tagBox[index].classList.contains('mip-stats-eventload')) {
      continue
    }

    tagBox[index].classList.add('mip-stats-eventload')

    // 解决on=tap: 和click冲突短线方案
    // TODO 这个为短线方案
    if (eventType === 'click' &&
        tagBox[index].hasAttribute('on') &&
        tagBox[index].getAttribute('on').match('tap:') &&
        fn.hasTouch()) {
      const gesture = new Gesture(tagBox[index])
      gesture.on('tap', eventHandler)
    } else {
      tagBox[index].addEventListener(eventType, eventHandler, false)
    }
  }
}

// 绑定事件追踪
function bindEle () {
  const tagBox = document.querySelectorAll(`*[${DATA_STATS_MTA_OBJ}]`)
  bindEleHandler(tagBox)
  // const now = Date.now()
  // const intervalTimer = setInterval(function () {
  //   // 获取所有需要触发的dom
  //   // 由于存在异步渲染
  //   if (Date.now() - now >= 8000) {
  //     clearInterval(intervalTimer)
  //   }
  // }, 100)
}
