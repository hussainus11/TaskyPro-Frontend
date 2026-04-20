"use client";

export type DealQueryToken =
  | { type: "ident"; value: string }
  | { type: "number"; value: number; raw: string }
  | { type: "string"; value: string; raw: string }
  | { type: "op"; value: "=" | "!=" | ">" | ">=" | "<" | "<=" }
  | { type: "keyword"; value: "AND" | "OR" | "IN" | "CONTAINS" | "IS" | "NULL" | "NOT" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

export type DealQueryAst =
  | { kind: "and"; left: DealQueryAst; right: DealQueryAst }
  | { kind: "or"; left: DealQueryAst; right: DealQueryAst }
  | {
      kind: "clause";
      field: string;
      op:
        | "="
        | "!="
        | ">"
        | ">="
        | "<"
        | "<="
        | "in"
        | "contains"
        | "is_null"
        | "is_not_null";
      value?: string | number | Array<string | number>;
    };

export type DealQueryParseResult =
  | { ok: true; ast: DealQueryAst; tokens: DealQueryToken[] }
  | { ok: false; error: string; tokens?: DealQueryToken[] };

function isIdentStart(ch: string) {
  return /[a-zA-Z_]/.test(ch);
}
function isIdentPart(ch: string) {
  return /[a-zA-Z0-9_.-]/.test(ch);
}

export function tokenizeDealQuery(input: string): DealQueryToken[] {
  const s = input || "";
  const tokens: DealQueryToken[] = [];
  let i = 0;

  const pushKeyword = (word: string) => {
    const upper = word.toUpperCase();
    const allowed = ["AND", "OR", "IN", "CONTAINS", "IS", "NULL", "NOT"] as const;
    if ((allowed as readonly string[]).includes(upper)) {
      tokens.push({ type: "keyword", value: upper as any });
      return true;
    }
    return false;
  };

  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "comma" });
      i++;
      continue;
    }

    // operators (2-char first)
    const two = s.slice(i, i + 2);
    if (two === ">=" || two === "<=" || two === "!=") {
      tokens.push({ type: "op", value: two as any });
      i += 2;
      continue;
    }
    if (ch === "=" || ch === ">" || ch === "<") {
      tokens.push({ type: "op", value: ch as any });
      i++;
      continue;
    }

    // strings
    if (ch === "'" || ch === "\"") {
      const quote = ch;
      let j = i + 1;
      let out = "";
      while (j < s.length) {
        const c = s[j];
        if (c === "\\" && j + 1 < s.length) {
          out += s[j + 1];
          j += 2;
          continue;
        }
        if (c === quote) break;
        out += c;
        j++;
      }
      const raw = s.slice(i, Math.min(j + 1, s.length));
      tokens.push({ type: "string", value: out, raw });
      i = j < s.length ? j + 1 : j;
      continue;
    }

    // numbers
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      const n = Number(raw);
      tokens.push({ type: "number", value: n, raw });
      i = j;
      continue;
    }

    // identifiers / keywords
    if (isIdentStart(ch)) {
      let j = i;
      while (j < s.length && isIdentPart(s[j])) j++;
      const word = s.slice(i, j);
      if (!pushKeyword(word)) {
        tokens.push({ type: "ident", value: word });
      }
      i = j;
      continue;
    }

    // unknown char: skip to avoid infinite loop
    i++;
  }

  return tokens;
}

class Parser {
  private idx = 0;
  constructor(private tokens: DealQueryToken[]) {}

  private peek() {
    return this.tokens[this.idx];
  }
  private next() {
    return this.tokens[this.idx++];
  }
  private expect(type: DealQueryToken["type"], label: string) {
    const t = this.peek();
    if (!t || t.type !== type) throw new Error(`Expected ${label}`);
    return this.next();
  }

  parse(): DealQueryAst {
    const ast = this.parseOr();
    if (this.idx < this.tokens.length) {
      throw new Error("Unexpected token at end");
    }
    return ast;
  }

  private parseOr(): DealQueryAst {
    let left = this.parseAnd();
    while (true) {
      const t = this.peek();
      if (t && t.type === "keyword" && t.value === "OR") {
        this.next();
        const right = this.parseAnd();
        left = { kind: "or", left, right };
        continue;
      }
      break;
    }
    return left;
  }

  private parseAnd(): DealQueryAst {
    let left = this.parseFactor();
    while (true) {
      const t = this.peek();
      if (t && t.type === "keyword" && t.value === "AND") {
        this.next();
        const right = this.parseFactor();
        left = { kind: "and", left, right };
        continue;
      }
      break;
    }
    return left;
  }

  private parseFactor(): DealQueryAst {
    const t = this.peek();
    if (t?.type === "lparen") {
      this.next();
      const inner = this.parseOr();
      this.expect("rparen", "')'");
      return inner;
    }
    return this.parseClause();
  }

  private parseClause(): DealQueryAst {
    const fieldTok = this.expect("ident", "field name") as { type: "ident"; value: string };
    const field = fieldTok.value;

    // IS (NOT) NULL
    const maybeIs = this.peek();
    if (maybeIs?.type === "keyword" && maybeIs.value === "IS") {
      this.next();
      const maybeNot = this.peek();
      if (maybeNot?.type === "keyword" && maybeNot.value === "NOT") {
        this.next();
        this.expect("keyword", "'NULL'");
        return { kind: "clause", field, op: "is_not_null" };
      }
      this.expect("keyword", "'NULL'");
      return { kind: "clause", field, op: "is_null" };
    }

    // IN / CONTAINS keywords or comparison ops
    const opTok = this.peek();
    if (!opTok) throw new Error("Expected operator");

    if (opTok.type === "keyword" && opTok.value === "IN") {
      this.next();
      const list = this.parseValueList();
      return { kind: "clause", field, op: "in", value: list };
    }
    if (opTok.type === "keyword" && opTok.value === "CONTAINS") {
      this.next();
      const v = this.parseValueSingle();
      if (typeof v !== "string") throw new Error("contains expects a string");
      return { kind: "clause", field, op: "contains", value: v };
    }
    if (opTok.type === "op") {
      const op = (this.next() as any).value as any;
      const v = this.parseValueSingle();
      return { kind: "clause", field, op, value: v };
    }

    throw new Error("Expected operator");
  }

  private parseValueSingle(): string | number {
    const t = this.peek();
    if (!t) throw new Error("Expected value");
    if (t.type === "string") return (this.next() as any).value;
    if (t.type === "number") return (this.next() as any).value;
    if (t.type === "ident") return (this.next() as any).value;
    throw new Error("Expected value");
  }

  private parseValueList(): Array<string | number> {
    const t = this.peek();
    if (t?.type === "lparen") this.next();

    const values: Array<string | number> = [];
    while (true) {
      const next = this.peek();
      if (!next) break;
      if (next.type === "rparen") {
        this.next();
        break;
      }
      if (next.type === "comma") {
        this.next();
        continue;
      }
      values.push(this.parseValueSingle());
    }
    return values;
  }
}

export function parseDealQuery(query: string): DealQueryParseResult {
  const tokens = tokenizeDealQuery(query);
  try {
    const parser = new Parser(tokens);
    const ast = parser.parse();
    return { ok: true, ast, tokens };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Invalid query", tokens };
  }
}

export function dealFieldValue(deal: any, field: string) {
  // Synthetic field to support dashboards without reshaping deal payloads
  if (field === "assigneeName") {
    const users = Array.isArray(deal?.users) ? deal.users : [];
    return users.map((u: any) => u?.name).filter(Boolean).join(", ");
  }
  const parts = field.split(".");
  let cur: any = deal;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function evalDealQuery(ast: DealQueryAst, deal: any): boolean {
  switch (ast.kind) {
    case "and":
      return evalDealQuery(ast.left, deal) && evalDealQuery(ast.right, deal);
    case "or":
      return evalDealQuery(ast.left, deal) || evalDealQuery(ast.right, deal);
    case "clause": {
      const actual = dealFieldValue(deal, ast.field);
      const op = ast.op;

      if (op === "is_null") return actual === null || actual === undefined || actual === "";
      if (op === "is_not_null") return !(actual === null || actual === undefined || actual === "");

      if (op === "contains") {
        return String(actual ?? "").toLowerCase().includes(String(ast.value ?? "").toLowerCase());
      }
      if (op === "in") {
        const list = Array.isArray(ast.value) ? ast.value : [];
        return list.some((v) => String(v) === String(actual));
      }

      if (op === "=" || op === "!=") {
        const eq = String(actual) === String(ast.value);
        return op === "=" ? eq : !eq;
      }

      const aNum = Number(actual);
      const eNum = Number(ast.value);
      if (Number.isNaN(aNum) || Number.isNaN(eNum)) return false;
      if (op === ">") return aNum > eNum;
      if (op === ">=") return aNum >= eNum;
      if (op === "<") return aNum < eNum;
      if (op === "<=") return aNum <= eNum;
      return false;
    }
    default:
      return true;
  }
}

