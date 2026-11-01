/**
 * Safe, constrained expression evaluator for survey conditions.
 *
 * Grammar (no eval, no function calls, no property access beyond the answer map):
 *   expr    := or
 *   or      := and ( '||' and )*
 *   and     := cmp ( '&&' cmp )*
 *   cmp     := add ( ('=='|'!='|'>='|'<='|'>'|'<') add )?
 *   add     := mul ( ('+'|'-') mul )*
 *   mul     := unary ( ('*'|'/') unary )*
 *   unary   := ('!'|'-') unary | primary
 *   primary := number | string | boolean | null | identifier | '{' identifier '}' | '(' expr ')'
 *
 * Identifiers resolve against the provided context (answers + helpers).
 * Functions allowed: contains(a,b), exists(id), empty(v), length(v).
 */

type Token =
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "null" }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "lparen" }
  | { t: "rparen" }
  | { t: "lbrace" }
  | { t: "rbrace" }
  | { t: "comma" };

function tokenize(input: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  const s = input;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "(") { out.push({ t: "lparen" }); i++; continue; }
    if (c === ")") { out.push({ t: "rparen" }); i++; continue; }
    if (c === "{") { out.push({ t: "lbrace" }); i++; continue; }
    if (c === "}") { out.push({ t: "rbrace" }); i++; continue; }
    if (c === ",") { out.push({ t: "comma" }); i++; continue; }
    if (c === "'" || c === '"') {
      const quote = c;
      let j = i + 1;
      let val = "";
      while (j < s.length && s[j] !== quote) { val += s[j]; j++; }
      if (j >= s.length) throw new Error("Unterminated string");
      out.push({ t: "str", v: val });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] ?? ""))) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const n = Number(s.slice(i, j));
      if (Number.isNaN(n)) throw new Error("Bad number");
      out.push({ t: "num", v: n });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      const word = s.slice(i, j);
      if (word === "true") out.push({ t: "bool", v: true });
      else if (word === "false") out.push({ t: "bool", v: false });
      else if (word === "null") out.push({ t: "null" });
      else out.push({ t: "id", v: word });
      i = j;
      continue;
    }
    // operators (multi-char first)
    const two = s.slice(i, i + 2);
    if (["==", "!=", ">=", "<=", "&&", "||"].includes(two)) { out.push({ t: "op", v: two }); i += 2; continue; }
    if (["+", "-", "*", "/", ">", "<", "!"].includes(c)) { out.push({ t: "op", v: c }); i++; continue; }
    throw new Error(`Unexpected character '${c}'`);
  }
  return out;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}
  parse(): (ctx: Record<string, unknown>) => unknown {
    const node = this.expr();
    if (this.pos !== this.tokens.length) throw new Error("Unexpected token");
    return (ctx) => node(ctx);
  }
  private peek(): Token | undefined { return this.tokens[this.pos]; }
  private next(): Token | undefined { return this.tokens[this.pos++]; }
  private expr(): (ctx: Record<string, unknown>) => unknown { return this.or(); }
  private or(): (ctx: Record<string, unknown>) => unknown {
    let left = this.and();
    while (this.peek()?.t === "op" && (this.peek() as {v:string})?.v === "||") {
      this.next();
      const right = this.and();
      const l = left;
      left = (ctx) => truthy(l(ctx)) || truthy(right(ctx));
    }
    return left;
  }
  private and(): (ctx: Record<string, unknown>) => unknown {
    let left = this.cmp();
    while (this.peek()?.t === "op" && (this.peek() as {v:string})?.v === "&&") {
      this.next();
      const right = this.cmp();
      const l = left;
      left = (ctx) => truthy(l(ctx)) && truthy(right(ctx));
    }
    return left;
  }
  private cmp(): (ctx: Record<string, unknown>) => unknown {
    const left = this.add();
    const tk = this.peek();
    if (tk?.t === "op" && ["==", "!=", ">=", "<=", ">", "<"].includes(tk.v)) {
      const op = tk.v;
      this.next();
      const right = this.add();
      const l = left;
      return (ctx) => {
        const a = l(ctx); const b = right(ctx);
        switch (op) {
          case "==": return a === b || (a == null && b == null);
          case "!=": return a !== b;
          case ">": return (a as number) > (b as number);
          case "<": return (a as number) < (b as number);
          case ">=": return (a as number) >= (b as number);
          case "<=": return (a as number) <= (b as number);
        }
        return false;
      };
    }
    return left;
  }
  private add(): (ctx: Record<string, unknown>) => unknown {
    let left = this.mul();
    while (this.peek()?.t === "op" && ((this.peek() as {v:string}).v === "+" || (this.peek() as {v:string}).v === "-")) {
      const op = (this.next() as {v:string}).v;
      const right = this.mul();
      const l = left;
      left = (ctx) => op === "+" ? (l(ctx) as number) + (right(ctx) as number) : (l(ctx) as number) - (right(ctx) as number);
    }
    return left;
  }
  private mul(): (ctx: Record<string, unknown>) => unknown {
    let left = this.unary();
    while (this.peek()?.t === "op" && ((this.peek() as {v:string}).v === "*" || (this.peek() as {v:string}).v === "/")) {
      const op = (this.next() as {v:string}).v;
      const right = this.unary();
      const l = left;
      left = (ctx) => op === "*" ? (l(ctx) as number) * (right(ctx) as number) : (l(ctx) as number) / (right(ctx) as number);
    }
    return left;
  }
  private unary(): (ctx: Record<string, unknown>) => unknown {
    const tk = this.peek();
    if (tk?.t === "op" && ((tk as {v:string}).v === "!" || (tk as {v:string}).v === "-")) {
      const op = (this.next() as {v:string}).v;
      const operand = this.unary();
      return (ctx) => op === "!" ? !truthy(operand(ctx)) : -(operand(ctx) as number);
    }
    return this.primary();
  }
  private primary(): (ctx: Record<string, unknown>) => unknown {
    const tk = this.peek();
    if (!tk) throw new Error("Unexpected end");
    if (tk.t === "num") { this.next(); const v = (tk as {v:number}).v; return () => v; }
    if (tk.t === "str") { this.next(); const v = (tk as {v:string}).v; return () => v; }
    if (tk.t === "bool") { this.next(); const v = (tk as {v:boolean}).v; return () => v; }
    if (tk.t === "null") { this.next(); return () => null; }
    if (tk.t === "lparen") {
      this.next();
      const inner = this.expr();
      if (this.peek()?.t !== "rparen") throw new Error("Expected )");
      this.next();
      return inner;
    }
    if (tk.t === "lbrace") {
      this.next();
      if (this.peek()?.t !== "id") throw new Error("Expected identifier in braces");
      const id = (this.next() as {v:string}).v;
      if (this.peek()?.t !== "rbrace") throw new Error("Expected }");
      this.next();
      return (ctx) => { const a = (ctx.answers ?? {}) as Record<string, unknown>; return a[id] ?? (ctx as Record<string, unknown>)[id]; };
    }
    if (tk.t === "id") {
      const name = tk.v;
      // function call?
      if (this.tokens[this.pos + 1]?.t === "lparen") {
        this.next();
        const args: ((ctx: Record<string, unknown>) => unknown)[] = [];
        if (this.peek()?.t !== "rparen") {
          args.push(this.expr());
          while (this.peek()?.t === "comma") { this.next(); args.push(this.expr()); }
        }
        if (this.peek()?.t !== "rparen") throw new Error("Expected )");
        this.next();
        return (ctx) => callHelper(name, args.map((a) => a(ctx)));
      }
      this.next();
      // bare identifier: try answers first, then context
      return (ctx: Record<string, unknown>) => {
        const answers = (ctx.answers ?? {}) as Record<string, unknown>;
        return Object.prototype.hasOwnProperty.call(answers, name) ? answers[name] : undefined;
      };
    }
    throw new Error("Unexpected token");
  }
}

function callHelper(name: string, args: unknown[]): unknown {
  switch (name) {
    case "contains": { console.error("CONTAINS ARGS:", JSON.stringify(args)); return Array.isArray(args[0]) ? (args[0] as unknown[]).includes(args[1]) : String(args[0] ?? "").includes(String(args[1] ?? "")); }
    case "exists": return args[0] !== undefined && args[0] !== null && args[0] !== "";
    case "empty": return args[0] === undefined || args[0] === null || args[0] === "" || (Array.isArray(args[0]) && (args[0] as unknown[]).length === 0);
    case "length": return Array.isArray(args[0]) ? (args[0] as unknown[]).length : String(args[0] ?? "").length;
    default: throw new Error(`Unknown function '${name}'`);
  }
}

function truthy(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.length > 0;
  if (typeof v === "number") return v !== 0 && !Number.isNaN(v);
  return Boolean(v);
}

const cache = new Map<string, (ctx: Record<string, unknown>) => unknown>();

export function compileExpression(source: string): (ctx: Record<string, unknown>) => unknown {
  const trimmed = source.trim();
  if (!trimmed) return () => true;
  const cached = cache.get(trimmed);
  if (cached) return cached;
  const tokens = tokenize(trimmed);
  const fn = new Parser(tokens).parse();
  cache.set(trimmed, fn);
  return fn;
}

export function evaluateExpression(source: string, context: Record<string, unknown>): unknown {
  try {
    return compileExpression(source)(context);
  } catch {
    return false;
  }
}

export function evaluateCondition(source: string | undefined, context: Record<string, unknown>): boolean {
  if (!source) return true;
  const r = truthy(evaluateExpression(source, context));
  return r;
}
