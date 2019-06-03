import {Pass} from './pass'

const {error} = MIP.util
const FRAME_TIME = 16

export const SCHEDULE_SERVICE_ID = 'mip-schedule-service'

export class ScheduleService {
  constructor () {
    this.raf_ = this.getRaf()
    this.tasks_ = []
    this.nextTasks_ = []
    this.scheduled_ = false
    this.boundRunScheduledTasks_ = this.runScheduledTasks_.bind(this)

    /**
     * 当 doc 不可见时使用 pass 代替 raf，因为不可见时 raf 不执行
     * 只对非动画这样做，动画不可见时不需要触发任务
     * @const {!Pass}
     */
    this.invisiblePass_ = new Pass(this.boundRunScheduledTasks_, FRAME_TIME)

    /**
     * 当 raf 不能工作时调用
     * 和 invisiblePass_ 相似, 但是 backupPass_ 会执行 真正的 raf
     * @const {!Pass}
     */
    this.backupPass_ = new Pass(this.boundRunScheduledTasks_, FRAME_TIME * 2.5)
  }

  run (task) {
    this.tasks_.push(task)
    this.schedule_()
  }

  measure (measurer) {
    this.run(measurer)
  }

  /**
   * 当前 mip core 未提供 Single-doc 和 Multi-doc 的判断，以及 Multi-doc 中某 iframe 是否可见的判断
   * 目前对于包含多个 iframe 的页面，如果某个 iframe 不可见但仍然触发了滚动事件
   * 依然执行回调（主要用在动画中）
   *
   * @returns {boolean} 是否可以执行回调
   * @private
   */
  canAnimate_ () {
    if (document.hidden) {
      return false
    }
    return true
  }

  schedule_ () {
    if (this.scheduled_) {
      return
    }
    this.scheduled_ = true
    this.forceSchedule_()
  }

  forceSchedule_ () {
    if (this.canAnimate_()) {
      this.raf_(this.boundRunScheduledTasks_)
      this.backupPass_.schedule()
    } else {
      this.invisiblePass_.schedule()
    }
  }

  /**
   * 在 raf 中执行任务
   *
   * @private
   */
  runScheduledTasks_ () {
    this.backupPass_.cancel()
    this.scheduled_ = false
    const {
      tasks_: currentTasks
    } = this
    this.tasks_ = this.nextTasks_
    for (let i = 0; i < currentTasks.length; i++) {
      currentTasks[i] && callTaskNoInline(currentTasks[i])
    }
    this.nextTasks_ = currentTasks
    this.nextTasks_.length = 0
  }

  /**
   * @returns {function(function())} raf 或处理了 16ms 延时的 setTimeout
   */
  getRaf () {
    const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame
    if (raf) {
      return raf.bind(window)
    }
    let lastTime = 0
    return fn => {
      const now = Date.now()
      // 默认帧渲染间隔是 16ms
      // 如果上一帧是 10ms 之前执行的，这一次执行只等 6ms，搭这次的帧渲染
      const timeToCall = Math.max(0, FRAME_TIME - (now - lastTime))
      lastTime = now + timeToCall
      setTimeout(fn, timeToCall)
    }
  }
}

/**
 * 防止 try/catch 阻塞任务执行
 *
 * @param {function():undefined|undefined} callback 回调
 */
function callTaskNoInline (callback) {
  if (!callback) {
    error('内部错误：callTaskNoInline 中的 callback 为空')
  }
  try {
    const ret = callback()
    if (ret !== undefined) {
      error(`callback 返回值错误，scheduleService 不能处理: ${callback.toString()}`)
    }
  } catch (e) {
    // 防止任务失败影响其他任务的执行
    setTimeout(() => {
      throw error
    })
    return false
  }
  return true
}
