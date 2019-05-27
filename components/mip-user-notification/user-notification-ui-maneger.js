export default class NotificationUiManager {
  constructor () {
    this.queueSize_ = 0
    this.queuePromise_ = Promise.resolve()
    this.queueEmptyHandler_ = () => {} // Make this an observable if requested
    this.queueNotEmptyHandler_ = () => {}
  }

  /**
   * UI 队列为空调用回调函数
   *
   * @param {function()} handler UI 队列为空调用
   */
  onQueueEmpty (handler) {
    this.queueEmptyHandler_ = handler
    if (this.queueSize_ === 0) {
      handler()
    }
  }

  /**
   * UI 队列不为空调用回调函数
   *
   * @param {function()} handler UI 队列不为空调用
   */
  onQueueNotEmpty (handler) {
    this.queueNotEmptyHandler_ = handler
    if (this.queueSize_ > 0) {
      handler()
    }
  }

  /**
   * 注册 UI，当存在多个 notification 时，显示最新的一个，最新的被用户 dismiss 了，显示下一个
   *
   * @param {function():!Promise} show mip-notification 的回调
   * @returns {!Promise} 异步返回
   */
  registerUI (show) {
    if (this.queueSize_ === 0) {
      this.queueEmptyHandler_()
    }
    this.queueSize_++
    const promise = this.queuePromise_.then(() => {
      return show().then(() => {
        this.queueSize_--
        if (this.queueSize_ === 0) {
          this.queueEmptyHandler_()
        }
      })
    })
    this.queuePromise_ = promise
    return promise
  }
}
