/**
 * @file mip-action-macro.js
 * @author clark-t (clarktanglei@163.com)
 */

const {
  util: { parse, log },
  CustomElement,
  viewer: { eventAction }
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

  execute (e, params) {
    let event = EXECUTE_EVENT

    if (this.fn) {
      let result = this.fn({
        event: params,
        // eventName: EXECUTE_EVENT,
        target: this.element
      })
      if (!result) {
        event = MISMATCH_EVENT
      }
    }

    eventAction.execute(event, this.element, params)
  }

  prerenderAllowed () {
    return false
  }
}
