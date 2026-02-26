export type FormFieldMeta = {
  name: string;
  required?: boolean;
  requiredMessage?: string;
};

export type ValidateResult = {
  ok: boolean;
  firstError?: string;
  errors: Record<string, string>;
};

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

export function resolveRequestUrl(url: string, apiBase: string) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (isAbsoluteUrl(trimmed)) return trimmed;
  const base = (apiBase || '').trim().replace(/\/+$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}

export function validateForm(fields: FormFieldMeta[], values: Record<string, unknown>): ValidateResult {
  const errors: Record<string, string> = {};
  const seen = new Set<string>();

  for (const field of fields) {
    const name = (field?.name || '').trim();
    if (!name) {
      continue;
    }
    if (seen.has(name)) {
      errors[name] = `字段名重复：${name}`;
      continue;
    }
    seen.add(name);

    if (field.required) {
      const v = values?.[name];
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === 'string' && v.trim() === '') ||
        (Array.isArray(v) && v.length === 0);
      if (empty) {
        errors[name] = field.requiredMessage?.trim() || `${name} 为必填项`;
      }
    }
  }

  const firstKey = Object.keys(errors)[0];
  return {
    ok: !firstKey,
    firstError: firstKey ? errors[firstKey] : undefined,
    errors,
  };
}

