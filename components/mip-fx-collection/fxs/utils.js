
/**
 * convert the easing type to corresponding `cubic-bezier()` notation.
 *
 * @param {string} ease easing type
 * @returns {string} the corresponding `cubic-bezier()` notation
 */
export function convertEasingToValue (ease) {
  switch (ease) {
    case 'linear':
      return 'cubic-bezier(0, 0, 1, 1)'
    case 'ease-in-out':
      return 'cubic-bezier(0.8, 0, 0.2, 1)'
    case 'ease-in':
      return 'cubic-bezier(0.8, 0, 0.6, 1)'
    case 'ease-out':
      return 'cubic-bezier(0.4, 0, 0.4, 1)'
  }

  return ease
}

/**
 * convert percentage to number
 *
 * @param {string} percentage percentage, 50%
 * @returns {number} number
 */
export function convertPercentageToNumber (percentage) {
  let res = parseFloat(percentage)
  if (!isNaN(res)) {
    return res / 100
  }

  return null
}

/**
 * set transform style
 *
 * @param {HTMLElement} element the element need to be set transform
 * @param {string} transition transition value
 */
export function setTransformStyle (element, transition) {
  if (!transition) {
    return
  }
  let name = transition.substring(0, transition.indexOf('('))
  let oldTransform = element.style.transform
  let entries = oldTransform ? oldTransform.split(/\s+/) : []
  let has = false
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].indexOf(name) === 0) {
      entries[i] = transition
      has = true
      break
    }
  }

  if (!has) {
    entries.push(transition)
  }

  element.style.transform = entries.join(' ')
}
