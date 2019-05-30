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
    this.registry = Object.create(null)
    this.deferregistry = Object.create(null)
    this.notificationUiManagerPromise = Services.getServicePromise(NOTIFICATION_UI_MANAGER)
  }

  get (id) {
    if (this.mipdoc.getElementById(id) == null) {
      warn(`Did not find mip-user-notification element ${id}.`)
    }
    return this.getOrCreateDeferById(id).promise
  }

  registerUserNotification (id, userNotification) {
    this.registry[id] = userNotification
    const deferred = this.getOrCreateDeferById(id)
    // 把注册的 notification 组件组织成 promise 队列，用于控制每次只显示一个 notification
    // 只有当前面的被用户 dismiss 之后才显示下一个
    return userNotification.shouldShow()
      .then(shouldShow => {
        if (shouldShow) {
          return this.notificationUiManagerPromise.then(manager => {
            return manager.registerUI(
              userNotification.show.bind(userNotification))
          })
        }
      })
      .then(deferred.resolve.bind(this, userNotification))
      .catch(err => error(err.message))
  }

  getOrCreateDeferById (id) {
    if (this.deferregistry[id]) {
      return this.deferregistry[id]
    }

    const deferred = new Deferred()
    const {promise, resolve} = deferred
    this.deferregistry[id] = {promise, resolve}

    return this.deferregistry[id]
  }
}
