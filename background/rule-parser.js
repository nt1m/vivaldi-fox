function evalRule(tree, context) {
  switch (tree.type) {
    case "ExpressionStatement":
      return evalRule(tree.expression, context);
    case "BinaryExpression":
    case "LogicalExpression": {
      let left = evalRule(tree.left, context);
      let right = evalRule(tree.right, context);
      switch (tree.operator) {
        case "&&":
          return left && right;
        case "||":
          return left || right;
        case "<":
          return left < right;
        case ">":
          return left > right;
        case "<=":
          return left <= right;
        case ">=":
          return left >= right;
      }
    }
    case "UnaryExpression":
      return tree.operator === "!" ? !evalRule(tree.argument, context) : evalRule(tree.argument, context);
    case "Identifier":
      return context[tree.name];
    case "Literal":
      return Number(tree.value);
    default:
      return false;
  }
}

class Rule {
  constructor(string) {
    this.rule = string;
  }

  async getContext(tab) {
    let object = {};
    let keys = Object.keys(PROPERTIES).filter(k => this.rule.includes(k));
    console.log(keys);
    for (let key of keys) {
      object[key] = await PROPERTIES[key].get(tab);
      console.log(object[key]);
    }
    return object;
  }

  async applies(tab) {
    console.log(window, this, esprima);
    return evalRule(esprima.parse(this.rule).body[0], this.getContext(tab));
  }
}