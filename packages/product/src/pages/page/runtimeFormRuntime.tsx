/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Message } from '@arco-design/web-react';
import { COMPONENT_TYPES } from '@lego/utils';
import type { ComponentNode } from '@lego/utils';
import { resolveRequestUrl, validateForm, type FormFieldMeta } from './runtimeFormLogic';
import type { SubmitFormAction } from './runtimeActionTypes';

export type FormRuntimeCtx = {
  formId: string;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  setValue: (name: string, value: unknown) => void;
  submit: (action: SubmitFormAction) => Promise<void>;
  getMergedValues: () => { ok: boolean; mergedValues?: Record<string, unknown> };
  validateAndMarkErrors: () => { ok: boolean; mergedValues?: Record<string, unknown> };
};

export const FormRuntimeContext = createContext<FormRuntimeCtx | null>(null);

function collectFormFieldsAndDefaults(formNode: ComponentNode) {
  const fields: FormFieldMeta[] = [];
  const defaults: Record<string, unknown> = {};
  const missingNameComponentIds: string[] = [];

  const walk = (node: ComponentNode) => {
    if (
      node.type === COMPONENT_TYPES.INPUT ||
      node.type === COMPONENT_TYPES.SELECT ||
      node.type === COMPONENT_TYPES.TEXTAREA
    ) {
      const name = (node.props?.name ?? '').toString().trim();
      if (!name) {
        missingNameComponentIds.push(node.id);
      } else {
        fields.push({
          name,
          required: !!node.props?.required,
          requiredMessage: node.props?.requiredMessage,
        });
        const dv = node.props?.defaultValue ?? node.props?.value;
        if (dv !== undefined && defaults[name] === undefined) {
          defaults[name] = dv;
        }
      }
    }

    if (Array.isArray(node.children)) {
      node.children.forEach((c) => walk(c));
    }
  };

  walk(formNode);
  return { fields, defaults, missingNameComponentIds };
}

export function FormRuntimeProvider({
  formNode,
  children,
}: {
  formNode: ComponentNode;
  children: ReactNode;
}) {
  const formId = formNode.id;
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submittingRef = useRef(false);

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const getMergedValues = useCallback(() => {
    const { defaults, missingNameComponentIds } = collectFormFieldsAndDefaults(formNode);
    if (missingNameComponentIds.length) {
      return { ok: false as const };
    }
    return { ok: true as const, mergedValues: { ...defaults, ...values } };
  }, [formNode, values]);

  const validateAndMarkErrors = useCallback(() => {
    const { fields, defaults, missingNameComponentIds } = collectFormFieldsAndDefaults(formNode);
    if (missingNameComponentIds.length) {
      Message.error('存在未配置字段名（name）的表单组件，无法提交');
      return { ok: false as const };
    }
    const mergedValues = { ...defaults, ...values };
    const result = validateForm(fields, mergedValues);
    if (!result.ok) {
      setErrors(result.errors);
      Message.error(result.firstError || '表单校验失败');
      return { ok: false as const };
    }
    return { ok: true as const, mergedValues };
  }, [formNode, values]);

  const submit = useCallback(
    async (action: SubmitFormAction) => {
      if (submittingRef.current) return;

      const validated = validateAndMarkErrors();
      if (!validated.ok || !validated.mergedValues) return;
      const mergedValues = validated.mergedValues;

      const req = action?.request ?? {};
      const url = resolveRequestUrl(req.url ?? '', import.meta.env.VITE_API_BASE || '');
      if (!url) {
        Message.error('请先配置提交 URL');
        return;
      }

      submittingRef.current = true;
      try {
        const resp = await fetch(url, {
          method: (req.method || 'POST').toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            ...(req.headers || {}),
          },
          body: JSON.stringify(mergedValues),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(text || resp.statusText || '请求失败');
        }
        Message.success(action.successMessage || '提交成功');
      } catch (e) {
        Message.error(action.errorMessage || (e instanceof Error ? e.message : '提交失败'));
      } finally {
        submittingRef.current = false;
      }
    },
    [validateAndMarkErrors]
  );

  return (
    <FormRuntimeContext.Provider
      value={{ formId, values, errors, setValue, submit, getMergedValues, validateAndMarkErrors }}
    >
      {children}
    </FormRuntimeContext.Provider>
  );
}

