export default class NotificationUiManager {
  constructor () {
    this.queueSize = 0
    this.queuePromise = Promise.resolve()
    this.queueEmptyHandler = () => {} // Make this an observable if requested
    this.queueNotEmptyHandler = () => {}
  }

  /**
   * UI 队列为空调用回调函数
   *
   * @param {function()} handler UI 队列为空调用
   */
  onQueueEmpty (handler) {
    this.queueEmptyHandler = handler
    if (this.queueSize === 0) {
      handler()
    }
  }

  /**
   * UI 队列不为空调用回调函数
   *
   * @param {function()} handler UI 队列不为空调用
   */
  onQueueNotEmpty (handler) {
    this.queueNotEmptyHandler = handler
    if (this.queueSize > 0) {
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
    if (this.queueSize === 0) {
      this.queueEmptyHandler()
    }
    this.queueSize += 1
    const promise = this.queuePromise.then(show)
      .then(() => {
        this.queueSize -= 1
        if (this.queueSize === 0) {
          this.queueEmptyHandler()
        }
      })
    this.queuePromise = promise
    return promise
  }
}
