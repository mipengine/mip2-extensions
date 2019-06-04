const {Services} = MIP

/**
 * Pass class helps to manage single-pass process. A pass is scheduled using
 * delay method. Only one pass can be pending at a time. If no pass is pending
 * the process is considered to be "idle".
 */
export class Pass {
  constructor (handler, optDefaultDelay) {
    this.timer = Services.timer()
    this.handler = handler
    this.defaultDelay = optDefaultDelay || 0
    this.scheduled = -1
    this.nextTime = 0
    this.running = false
    this.boundPass = this.pass.bind(this)
  }

  /**
   * Whether or not a pass is currently pending
   *
   * @returns {boolean} 是否处理中
   */
  isPending () {
    return this.scheduled !== -1
  }

  /**
   * Tries to schedule a new pass optionally with specified delay. If the new
   * requested pass is requested before the pending pass, the pending pass is
   * canceled. If the new pass is requested after the pending pass, the newly
   * requested pass is ignored.
   *
   * Returns {@code true} if the pass has been scheduled and {@code false} if
   * ignored.
   *
   * @param {number=} optDelay Delay to schedule the pass. If not specified
   *   the default delay is used, falling back to 0.
   * @returns {boolean}
   */
  schedule (optDelay) {
    let delay = optDelay || this.defaultDelay
    if (this.running && delay < 10) {
      // If we get called recursively, wait at least 10ms for the next
      // execution.
      delay = 10
    }

    const nextTime = Date.now() + delay
    // Schedule anew if nothing is scheduled currently or if the new time is
    // sooner then previously requested.
    if (!this.isPending() || nextTime - this.nextTime < -10) {
      this.cancel()
      this.nextTime = nextTime
      this.scheduled = this.timer.delay(this.boundPass, delay)

      return true
    }

    return false
  }

  pass () {
    this.scheduled = -1
    this.nextTime = 0
    this.running = true
    this.handler()
    this.running = false
  }

  /**
   * Cancels the pending pass if any.
   */
  cancel () {
    if (this.isPending()) {
      this.timer.cancel(this.scheduled)
      this.scheduled = -1
    }
  }
}
