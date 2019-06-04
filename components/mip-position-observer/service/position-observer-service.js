import {
  PositionObserverFidelity, // eslint-disable-line no-unused-vars
  PositionObserverWorker, // eslint-disable-line no-unused-vars
  PositionInViewportEntryDef
} from './position-observer-worker'
import {SCHEDULE_SERVICE_ID} from './schedule-service'

export const POSITION_OBSERVER_SERVICE_ID = 'mip-position-observer-service'
const {registerService, util, Services, viewport} = MIP
const {error} = util.log('mip-position-observer')
const SCROLL_TIMEOUT = 500

/**
 * 监听元素，在 schedule-service 调度下触发updateAllEntries 从而触发 worker 的 update
 * 由 worker 计算元素位置的变化，触发传入的回调
 */
export class PositionObserver {
  constructor () {
    this.workers = []
    this.scheduleService = Services.getService(SCHEDULE_SERVICE_ID)
    this.inScroll = false
    this.measure = false
    this.callbackStarted = false
    this.boundStopScroll = debounce(() => {
      this.inScroll = false
    }, SCROLL_TIMEOUT)
  }

  /**
   * 添加监听
   *
   * @param {!Element} element 目标元素
   * @param {!PositionObserverFidelity} fidelity 精确度
   * @param {function(PositionInViewportEntryDef)} handler 回调
   */
  observe (element, fidelity, handler) {
    const worker = new PositionObserverWorker(element, fidelity, handler)
    this.workers.push(worker)

    if (!this.callbackStarted) {
      this.startCallback()
    }

    worker.update()
  }

  /**
   * 取消监听
   *
   * @param {!Element} element 目标元素
   */
  unobserve (element) {
    for (let i = 0; i < this.workers.length; i++) {
      if (this.workers[i].element === element) {
        this.removeWorker(i)
        return
      }
    }
    error('元素已取消监听，不能再次取消')
  }

  /**
   * 开始监听第一个元素时调用
   *
   * @private
   */
  startCallback () {
    this.callbackStarted = true

    viewport.on('scroll', () => {
      this.onScrollHandler()
    })
    viewport.on('resize', () => {
      this.onResizeHandler()
    })
  }

  /**
   * 应被 mip-schedule-service 服务调用
   *
   * @param {boolean=} optForce 选项
   */
  updateAllEntries (optForce) {
    for (let i = 0; i < this.workers.length; i++) {
      const worker = this.workers[i]
      worker.update(optForce)
    }
  }

  onScrollHandler () {
    this.boundStopScroll()
    this.inScroll = true
    if (!this.measure) {
      this.schedulePass()
    }
  }

  onResizeHandler () {
    this.updateAllEntries(true)
  }

  /**
   * 发生滚动事件时触发更新
   */
  schedulePass () {
    this.updateAllEntries()
    this.measure = true
    if (!this.inScroll) {
      // 当视口没有滚动事件时，停止 measure
      this.measure = false
      return
    }

    this.scheduleService.measure(() => {
      this.schedulePass()
    })
  }
}

function debounce (callback, minInterval) {
  let locker = 0
  let timestamp = 0
  let nextCallArgs = null

  function fire (args) {
    nextCallArgs = null
    callback.apply(null, args)
  }

  /**
   * Wait function for debounce
   */
  function waiter () {
    locker = 0
    const remaining = minInterval - (Date.now() - timestamp)
    if (remaining > 0) {
      locker = setTimeout(waiter, remaining)
    } else {
      fire(nextCallArgs)
    }
  }

  return function (...args) {
    timestamp = Date.now()
    nextCallArgs = args
    if (!locker) {
      locker = setTimeout(waiter, minInterval)
    }
  }
}

export function installPositionObserverService () {
  registerService(POSITION_OBSERVER_SERVICE_ID, PositionObserver)
}
