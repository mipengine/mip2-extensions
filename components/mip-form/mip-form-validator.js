/**
 * @file Form Validator
 *
 * @author liwenqian@baidu.com
 */
const REGS = {
  EMAIL: '^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$',
  PHONE: '^1\\d{10}$',
  IDCAR: '^\\d{15}|\\d{18}$'
}

const CustomValidationReporting = {
  ShowFirstOnSubmit: 'show-first-on-submit',
  ShowAllOnSubmit: 'show-all-on-submit',
  AsYouGo: 'as-you-go'
}

/**
 * 根据不同策略创建对应的 validator
 *
 * @param {HTMLElement} form 表单
 */
export function getValidatorFromForm (form) {
  const validatorReportType = form.getAttribute('custom-validation-reporting')
  switch (validatorReportType) {
    case CustomValidationReporting.AsYouGo:
      return new AsYouGoValidator(form)
    case CustomValidationReporting.ShowAllOnSubmit:
      return new ShowAllOnSubmitValidator(form)
    case CustomValidationReporting.ShowFirstOnSubmit:
      return new ShowFirstOnSubmitValidator(form)
  }
  return new ShowAllOnSubmitValidator(form)
}

export class FormValidator {
  constructor (form) {
    this.valid = true
    this.form = form
    this.inputs = this.form.querySelectorAll('input,select,textarea')
  }

  onBlur () {}

  onInput () {}

  /**
   * 检验输入是否合法
   */
  checkInputValid () {
    return this.valid
  }

  /**
   * 展示校验提示
   *
   * @param {HTMLElement} input 输入元素
   * @param {Object} validityState 校验状态
   */

  showValidatorReport (input, validityState) {
    const validateTarget = input.getAttribute('validatetarget')
    const validateTargetDom = this.form.querySelectorAll(`div[target="${validateTarget}"]`)
    validateTargetDom.forEach((element) => {
      if (element.hasAttribute('visible-when-invalid')) {
        const visibleDomAttr = element.getAttribute('visible-when-invalid')
        if (visibleDomAttr === validityState) {
          element.classList.add('visible')
        }
      } else {
        element.classList.add('visible')
      }
    })
  }

  /**
   * 隐藏校验提示
   *
   * @param {HTMLElement} input 输入元素
   */
  hideValidatorReport (input) {
    const validateTarget = input.getAttribute('validatetarget')
    const reportElement = this.form.querySelectorAll(`.visible[target="${validateTarget}"]`)
    reportElement.forEach((element) => {
      element.classList.remove('visible')
    })
  }

  /**
   * 隐藏所有的校验提示
   */
  hideAllValidatorReport () {
    const inputs = this.inputs
    for (let i = 0; i < inputs.length; i++) {
      this.hideValidatorReport(inputs[i])
    }
  }

  /**
   * 校验输入符合规则
   *
   * @param {HTMLElement} inputElement input Dom
   * @returns {boolean} validate success
   */
  validateInput (inputElement) {
    const value = inputElement.value
    let validateType = inputElement.getAttribute('validatetype')
    const required = inputElement.hasAttribute('required') || validateType === 'must'
    let validityState = 'valid'

    // 空值校验
    if (required && value === '') {
      validityState = 'valueMissing'
      return validityState
    }

    if (!validateType) {
      return validityState
    }

    // 正则校验
    let validateReg
    validateType = validateType.toUpperCase()
    if (validateType in REGS) {
      validateReg = REGS[validateType]
    } else {
      validateReg = inputElement.getAttribute('validatereg')
    }

    if (validateReg) {
      const re = new RegExp(`${validateReg}`, 'm')
      if (!re.test(value)) {
        validityState = 'patternMismatch'
      }
    }
    return validityState
  }
}

class AsYouGoValidator extends FormValidator {
  onBlur (event) {
    /** @override */
    this.onInteraction(event)
  }

  onInput (event) {
    /** @override */
    this.onInteraction(event)
  }

  onInteraction (event) {
    /** @override */
    const input = event.target
    const validityState = this.validateInput(input)
    this.hideValidatorReport(input, validityState)
    if (validityState !== 'valid') {
      this.valid = false
      this.showValidatorReport(input, validityState)
    } else {
      this.valid = true
    }
  }
}

class ShowAllOnSubmitValidator extends FormValidator {
  /** @override */
  checkInputValid () {
    this.valid = true
    this.hideAllValidatorReport()
    for (let input of this.inputs) {
      const validityState = this.validateInput(input)
      if (validityState !== 'valid') {
        this.valid = false
        this.showValidatorReport(input, validityState)
      }
    }
    return this.valid
  }
}

class ShowFirstOnSubmitValidator extends FormValidator {
  /** @override */
  checkInputValid () {
    this.valid = true
    this.hideAllValidatorReport()
    for (let input of this.inputs) {
      const validityState = this.validateInput(input)
      if (validityState !== 'valid') {
        this.valid = false
        this.showValidatorReport(input, validityState)
        return this.valid
      }
    }
    return this.valid
  }
}
