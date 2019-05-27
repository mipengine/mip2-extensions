/**
 * 当页面存在多个 notification 时，需要注册为队列，逐一显示，UserNotificationManager 实现队列和 UI 的注册
 * 同时，暴露组件的 dismiss promise
 */
import {NOTIFICATION_UI_MANAGER} from './mip-user-notification'
const {util, Services} = MIP
const Deferred = util.Deferred
const {error, warn} = util.log('mip-user-notification')

export default class UserNotificationManager {
  constructor (mipdoc) {
    this.mipdoc = mipdoc // window
    this.registry_ = Object.create(null)
    this.deferRegistry_ = Object.create(null)
    this.managerReadyPromise_ = Promise.resolve()
    this.notificationUiManagerPromise_ = Services.getServicePromise(NOTIFICATION_UI_MANAGER)
  }

  get (id) {
    this.managerReadyPromise_.then(() => {
      if (this.ampdoc.getElementById(id) == null) {
        warn(`Did not find mip-user-notification element ${id}.`)
      }
    })
    return this.getOrCreateDeferById_(id).promise
  }

  registerUserNotification (id, userNotification) {
    this.registry_[id] = userNotification
    const deferred = this.getOrCreateDeferById_(id)
    // 把注册的 notification 组件组织成 promise 队列，用于控制每次只显示一个 notification
    // 只有当前面的被用户 dismiss 之后才显示下一个
    return this.managerReadyPromise_
      .then(() => userNotification.shouldShow())
      .then(shouldShow => {
        if (shouldShow) {
          return this.notificationUiManagerPromise_.then(manager => {
            return manager.registerUI(
              userNotification.show.bind(userNotification))
          })
        }
      })
      .then(deferred.resolve.bind(this, userNotification))
      .catch(() => error('Notification service failed mip-user-notification'))
  }

  getOrCreateDeferById_ (id) {
    if (this.deferRegistry_[id]) {
      return this.deferRegistry_[id]
    }

    const deferred = new Deferred()
    const {promise, resolve} = deferred
    this.deferRegistry_[id] = {promise, resolve}

    return this.deferRegistry_[id]
  }
}
