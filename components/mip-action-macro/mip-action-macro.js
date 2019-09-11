/**
 * @file mip-action-macro.js
 * @author clark-t (clarktanglei@163.com)
 */

const {
  util: { parse, log },
  CustomElement,
  viewer
} = MIP

const EXECUTE_EVENT = 'execute'
const MISMATCH_EVENT = 'mismatch'

const logger = log('mip-action-macro')

export default class MIPActionMacro extends CustomElement {
  static props = {
    condition: {
      type: String,
      default: ''
    }
  }

  build () {
    const condition = this.props.condition

    if (condition) {
      try {
        this.fn = parse(condition, 'Conditional')
      } catch (e) {
        logger.error(e)
      }
    }

    this.addEventAction(EXECUTE_EVENT, this.execution.bind(this))
  }

  execution (e, params) {
    params = params.trim()

    let eventObj
    if (params !== '') {
      try {
        eventObj = JSON.parse(params)
      } catch (e) {}
    }

    if (!eventObj) {
      eventObj = {}
    }

    let eventName = EXECUTE_EVENT

    if (this.fn) {
      let result = this.fn({
        event: eventObj,
        // eventName: EXECUTE_EVENT,
        target: this.element
      })
      if (!result) {
        eventName = MISMATCH_EVENT
      }
    }
    viewer.eventAction.execute(eventName, this.element, eventObj)
  }

  prerenderAllowed () {
    return false
  }
}
