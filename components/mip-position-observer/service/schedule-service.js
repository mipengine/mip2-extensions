import {Pass} from './pass'

const {error} = MIP.util
const FRAME_TIME = 16

export const SCHEDULE_SERVICE_ID = 'mip-schedule-service'

export class ScheduleService {
  constructor () {
    this.raf = this.getRaf()
    this.tasks = []
    this.nextTasks = []
    this.scheduled = false
    this.boundrunScheduledTasks = this.runScheduledTasks.bind(this)

    /**
     * 当 doc 不可见时使用 pass 代替 raf，因为不可见时 raf 不执行
     * 只对非动画这样做，动画不可见时不需要触发任务
     * @const {!Pass}
     */
    this.invisiblePass = new Pass(this.boundrunScheduledTasks, FRAME_TIME)

    /**
     * 当 raf 不能工作时调用
     * 和 invisiblePass 相似, 但是 backupPass 会执行 真正的 raf
     * @const {!Pass}
     */
    this.backupPass = new Pass(this.boundrunScheduledTasks, FRAME_TIME * 2.5)
  }

  run (task) {
    this.tasks.push(task)
    this.schedule()
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
  canAnimate () {
    if (document.hidden) {
      return false
    }
    return true
  }

  schedule () {
    if (this.scheduled) {
      return
    }
    this.scheduled = true
    this.forceSchedule()
  }

  forceSchedule () {
    if (this.canAnimate()) {
      this.raf(this.boundrunScheduledTasks)
      this.backupPass.schedule()
    } else {
      this.invisiblePass.schedule()
    }
  }

  /**
   * 在 raf 中执行任务
   *
   * @private
   */
  runScheduledTasks () {
    this.backupPass.cancel()
    this.scheduled = false
    const {
      tasks: currentTasks
    } = this
    this.tasks = this.nextTasks
    for (let i = 0; i < currentTasks.length; i++) {
      currentTasks[i] && callTaskNoInline(currentTasks[i])
    }
    this.nextTasks = currentTasks
    this.nextTasks.length = 0
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
      throw e
    })
    return false
  }
  return true
}
