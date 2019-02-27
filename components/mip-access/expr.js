import parser from './expr-impl'

/**
 * Evaluates access expression.
 *
 * @param {string} expr expression
 * @param {!JSONType} data json data
 * @returns {boolean}
 */
function evaluateAccessExpr (expr, data) {
  try {
    parser.yy = data
    return !!parser.parse(expr)
  } finally {
    parser.yy = null
  }
}

export default evaluateAccessExpr
