type ExpressionValue = string | number | boolean | null | undefined;
type Scope = Record<string, unknown>;

type TokenType =
  | "identifier"
  | "number"
  | "string"
  | "boolean"
  | "null"
  | "operator"
  | "dot"
  | "paren"
  | "eof";

interface Token {
  type: TokenType;
  value: string;
}

interface LiteralNode {
  type: "literal";
  value: ExpressionValue;
}

interface PathNode {
  type: "path";
  parts: string[];
}

interface UnaryNode {
  type: "unary";
  operator: "!";
  argument: ExpressionNode;
}

interface BinaryNode {
  type: "binary";
  operator:
    | "||"
    | "&&"
    | "=="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "+"
    | "-"
    | "*"
    | "/"
    | "%";
  left: ExpressionNode;
  right: ExpressionNode;
}

type ExpressionNode = LiteralNode | PathNode | UnaryNode | BinaryNode;

const FORBIDDEN_PATH_PARTS = new Set(["__proto__", "prototype", "constructor"]);

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const char = source[i];

    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    const twoChar = source.slice(i, i + 2);
    if (["&&", "||", "==", "!=", ">=", "<="].includes(twoChar)) {
      tokens.push({ type: "operator", value: twoChar });
      i += 2;
      continue;
    }

    if ([">", "<", "+", "-", "*", "/", "%", "!"].includes(char)) {
      tokens.push({ type: "operator", value: char });
      i += 1;
      continue;
    }

    if (char === ".") {
      tokens.push({ type: "dot", value: char });
      i += 1;
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      i += 1;
      continue;
    }

    if (char === "'" || char === '"') {
      const quote = char;
      let value = "";
      let closed = false;
      i += 1;

      while (i < source.length) {
        const current = source[i];
        if (current === "\\") {
          const next = source[i + 1];
          if (next === undefined) {
            throw new Error("Invalid string escape");
          }
          value += next;
          i += 2;
          continue;
        }
        if (current === quote) {
          i += 1;
          tokens.push({ type: "string", value });
          closed = true;
          break;
        }
        value += current;
        i += 1;
      }

      if (!closed) {
        throw new Error("Unterminated string literal");
      }
      continue;
    }

    if (/[0-9]/.test(char)) {
      let value = char;
      i += 1;
      while (i < source.length && /[0-9.]/.test(source[i])) {
        value += source[i];
        i += 1;
      }
      if (!/^\d+(?:\.\d+)?$/.test(value)) {
        throw new Error(`Invalid number literal: ${value}`);
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (/[A-Za-z_$]/.test(char)) {
      let value = char;
      i += 1;
      while (i < source.length && /[A-Za-z0-9_$]/.test(source[i])) {
        value += source[i];
        i += 1;
      }
      if (value === "true" || value === "false") {
        tokens.push({ type: "boolean", value });
      } else if (value === "null") {
        tokens.push({ type: "null", value });
      } else {
        tokens.push({ type: "identifier", value });
      }
      continue;
    }

    throw new Error(`Unexpected token: ${char}`);
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

class ExpressionParser {
  private index = 0;
  private readonly tokens: Token[];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ExpressionNode {
    const node = this.parseOr();
    if (!this.match("eof")) {
      throw new Error(`Unexpected token: ${this.peek().value}`);
    }
    return node;
  }

  private parseOr(): ExpressionNode {
    let node = this.parseAnd();
    while (this.matchOperator("||")) {
      node = {
        type: "binary",
        operator: "||",
        left: node,
        right: this.parseAnd(),
      };
    }
    return node;
  }

  private parseAnd(): ExpressionNode {
    let node = this.parseEquality();
    while (this.matchOperator("&&")) {
      node = {
        type: "binary",
        operator: "&&",
        left: node,
        right: this.parseEquality(),
      };
    }
    return node;
  }

  private parseEquality(): ExpressionNode {
    let node = this.parseComparison();
    while (this.checkOperator("==") || this.checkOperator("!=")) {
      const operator = this.advance().value as "==" | "!=";
      node = {
        type: "binary",
        operator,
        left: node,
        right: this.parseComparison(),
      };
    }
    return node;
  }

  private parseComparison(): ExpressionNode {
    let node = this.parseAdditive();
    while (
      this.checkOperator(">") ||
      this.checkOperator(">=") ||
      this.checkOperator("<") ||
      this.checkOperator("<=")
    ) {
      const operator = this.advance().value as ">" | ">=" | "<" | "<=";
      node = {
        type: "binary",
        operator,
        left: node,
        right: this.parseAdditive(),
      };
    }
    return node;
  }

  private parseAdditive(): ExpressionNode {
    let node = this.parseMultiplicative();
    while (this.checkOperator("+") || this.checkOperator("-")) {
      const operator = this.advance().value as "+" | "-";
      node = {
        type: "binary",
        operator,
        left: node,
        right: this.parseMultiplicative(),
      };
    }
    return node;
  }

  private parseMultiplicative(): ExpressionNode {
    let node = this.parseUnary();
    while (
      this.checkOperator("*") ||
      this.checkOperator("/") ||
      this.checkOperator("%")
    ) {
      const operator = this.advance().value as "*" | "/" | "%";
      node = {
        type: "binary",
        operator,
        left: node,
        right: this.parseUnary(),
      };
    }
    return node;
  }

  private parseUnary(): ExpressionNode {
    if (this.matchOperator("!")) {
      return {
        type: "unary",
        operator: "!",
        argument: this.parseUnary(),
      };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionNode {
    const token = this.peek();

    if (this.match("number")) {
      return { type: "literal", value: Number(token.value) };
    }

    if (this.match("string")) {
      return { type: "literal", value: token.value };
    }

    if (this.match("boolean")) {
      return { type: "literal", value: token.value === "true" };
    }

    if (this.match("null")) {
      return { type: "literal", value: null };
    }

    if (this.match("identifier")) {
      const parts = [token.value];
      while (this.match("dot")) {
        const property = this.consume("identifier", "Expected property name");
        if (FORBIDDEN_PATH_PARTS.has(property.value)) {
          throw new Error(`Forbidden property access: ${property.value}`);
        }
        parts.push(property.value);
      }

      if (FORBIDDEN_PATH_PARTS.has(parts[0])) {
        throw new Error(`Forbidden property access: ${parts[0]}`);
      }

      return { type: "path", parts };
    }

    if (this.matchParen("(")) {
      const expression = this.parseOr();
      this.consumeParen(")", "Expected closing parenthesis");
      return expression;
    }

    throw new Error(`Unexpected token: ${token.value || token.type}`);
  }

  private match(type: TokenType): boolean {
    if (this.peek().type !== type) {
      return false;
    }
    this.advance();
    return true;
  }

  private matchOperator(operator: string): boolean {
    if (!this.checkOperator(operator)) {
      return false;
    }
    this.advance();
    return true;
  }

  private matchParen(paren: string): boolean {
    if (this.peek().type !== "paren" || this.peek().value !== paren) {
      return false;
    }
    this.advance();
    return true;
  }

  private checkOperator(operator: string): boolean {
    return this.peek().type === "operator" && this.peek().value === operator;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.peek().type === type) {
      return this.advance();
    }
    throw new Error(message);
  }

  private consumeParen(paren: string, message: string): Token {
    if (this.peek().type === "paren" && this.peek().value === paren) {
      return this.advance();
    }
    throw new Error(message);
  }

  private advance(): Token {
    const token = this.peek();
    this.index += 1;
    return token;
  }

  private peek(): Token {
    return this.tokens[this.index] ?? { type: "eof", value: "" };
  }
}

function readPath(parts: string[], scope: Scope): ExpressionValue {
  let value: unknown = scope[parts[0]];

  for (const part of parts.slice(1)) {
    if (
      value === null ||
      value === undefined ||
      typeof value !== "object" ||
      FORBIDDEN_PATH_PARTS.has(part)
    ) {
      return undefined;
    }
    value = (value as Record<string, unknown>)[part];
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  ) {
    return value;
  }

  return undefined;
}

function toNumber(value: ExpressionValue): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (value === null || value === undefined) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compareValues(
  left: ExpressionValue,
  right: ExpressionValue,
  operator: ">" | ">=" | "<" | "<=",
): boolean {
  const normalizedLeft = left ?? "";
  const normalizedRight = right ?? "";

  switch (operator) {
    case ">":
      return normalizedLeft > normalizedRight;
    case ">=":
      return normalizedLeft >= normalizedRight;
    case "<":
      return normalizedLeft < normalizedRight;
    case "<=":
      return normalizedLeft <= normalizedRight;
  }
}

function evaluateNode(node: ExpressionNode, scope: Scope): ExpressionValue {
  switch (node.type) {
    case "literal":
      return node.value;
    case "path":
      return readPath(node.parts, scope);
    case "unary":
      return evaluateNode(node.argument, scope) ? false : true;
    case "binary": {
      if (node.operator === "||") {
        return evaluateNode(node.left, scope)
          ? true
          : evaluateNode(node.right, scope)
            ? true
            : false;
      }
      if (node.operator === "&&") {
        return evaluateNode(node.left, scope)
          ? evaluateNode(node.right, scope)
            ? true
            : false
          : false;
      }

      const left = evaluateNode(node.left, scope);
      const right = evaluateNode(node.right, scope);

      switch (node.operator) {
        case "==":
          return left === right;
        case "!=":
          return left !== right;
        case ">":
          return compareValues(left, right, node.operator);
        case ">=":
          return compareValues(left, right, node.operator);
        case "<":
          return compareValues(left, right, node.operator);
        case "<=":
          return compareValues(left, right, node.operator);
        case "+":
          if (typeof left === "string" || typeof right === "string") {
            return String(left ?? "") + String(right ?? "");
          }
          return toNumber(left) + toNumber(right);
        case "-":
          return toNumber(left) - toNumber(right);
        case "*":
          return toNumber(left) * toNumber(right);
        case "/":
          return toNumber(left) / toNumber(right);
        case "%":
          return toNumber(left) % toNumber(right);
      }
    }
  }
}

export function compileSafeExpression(
  source: string,
): (scope: Scope) => ExpressionValue {
  const ast = new ExpressionParser(tokenize(source)).parse();
  return (scope: Scope) => evaluateNode(ast, scope);
}
