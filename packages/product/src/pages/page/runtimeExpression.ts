import type { ExpressionValue } from './runtimeActionTypes';

function isExpressionValue(v: unknown): v is ExpressionValue {
  if (!v || typeof v !== 'object') return false;
  const rec = v as Record<string, unknown>;
  return rec.type === 'expression' && typeof rec.value === 'string';
}

function getByPath(scope: Record<string, unknown>, rawPath: string): unknown {
  const path = rawPath.trim();
  if (!path) return undefined;

  // 支持 a.b.c 与 a[0].b
  const tokens: Array<string | number> = [];
  const re = /([^[.\]]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path))) {
    if (m[1]) tokens.push(m[1]);
    else if (m[2]) tokens.push(Number(m[2]));
  }

  const getProp = (obj: unknown, key: string | number): unknown => {
    if (obj == null) return undefined;
    if (Array.isArray(obj) && typeof key === 'number') return obj[key];
    if (typeof obj === 'object') return (obj as Record<string, unknown>)[String(key)];
    return undefined;
  };

  let cur: unknown = scope;
  for (const t of tokens) {
    cur = getProp(cur, t);
  }
  return cur;
}

export function evaluateTemplate(templateOrExpr: unknown, scope: Record<string, unknown>): unknown {
  if (isExpressionValue(templateOrExpr)) {
    return evaluateTemplate(templateOrExpr.value, scope);
  }
  if (templateOrExpr == null) return templateOrExpr;

  const raw = String(templateOrExpr);
  const matches = raw.match(/{{\s*([^{}]+)\s*}}/g);
  if (!matches) return templateOrExpr;

  // 如果整体就是一个表达式，返回原值（可能是对象/数组/数字）
  const single = raw.match(/^{{\s*([^{}]+)\s*}}$/);
  if (single) {
    return getByPath(scope, single[1] ?? '');
  }

  // 否则作为字符串模板替换
  return raw.replace(/{{\s*([^{}]+)\s*}}/g, (_all, exprBody) => {
    const v = getByPath(scope, String(exprBody ?? ''));
    return v == null ? '' : String(v);
  });
}

export function resolveDeep(value: unknown, scope: Record<string, unknown>): unknown {
  if (isExpressionValue(value)) {
    return evaluateTemplate(value, scope);
  }
  if (typeof value === 'string') {
    return evaluateTemplate(value, scope);
  }
  if (Array.isArray(value)) {
    return value.map((v) => resolveDeep(v, scope));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveDeep(v, scope);
    }
    return out;
  }
  return value;
}

