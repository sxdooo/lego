import { Message } from '@arco-design/web-react';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import type { ComponentNode } from '@lego/utils';
import { resolveRequestUrl } from './runtimeFormLogic';
import type {
  ButtonAction,
  CopyAction,
  NavigateAction,
  RequestAction,
  CopyDataAction,
  PostDataAction,
  UpdatePropsAction,
} from './runtimeActionTypes';
import type { FormRuntimeCtx } from './runtimeFormRuntime';
import { evaluateTemplate, resolveDeep } from './runtimeExpression';

type NavigateFn = (to: string, opts?: { replace?: boolean }) => void;

const isAbsoluteUrl = (to: string) => /^https?:\/\//i.test(to);

const getSuccessError = (action?: ButtonAction) => {
  if (!action) return { successMessage: undefined as string | undefined, errorMessage: undefined as string | undefined };
  if (action.type === 'submitForm' || action.type === 'request') {
    return { successMessage: action.successMessage, errorMessage: action.errorMessage };
  }
  if (action.type === 'copy') {
    return { successMessage: action.successMessage, errorMessage: action.errorMessage };
  }
  return { successMessage: undefined, errorMessage: undefined };
};

async function runRequest(action: RequestAction, body?: unknown) {
  const req = action.request ?? {};
  const method = (req.method || 'POST').toUpperCase();
  const url = resolveRequestUrl(req.url ?? '', import.meta.env.VITE_API_BASE || '');
  if (!url) {
    Message.error('请先配置请求 URL');
    return;
  }

  try {
    const resp = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers || {}),
      },
      body: method === 'GET' ? undefined : body === undefined ? undefined : JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(text || resp.statusText || '请求失败');
    }
    Message.success(action.successMessage || '操作成功');
  } catch (e) {
    Message.error(action.errorMessage || (e instanceof Error ? e.message : '操作失败'));
  }
}

async function runCopy(action: CopyAction, formCtx: FormRuntimeCtx | null) {
  const source = action.textSource ?? 'static';
  let textToCopy = '';

  if (source === 'static') {
    textToCopy = String(action.text ?? '');
  } else {
    if (!formCtx) {
      Message.warning('请把按钮放到表单容器（Form）内部');
      return;
    }
    const snapshot = formCtx.getMergedValues();
    if (!snapshot.ok || !snapshot.mergedValues) {
      Message.error('存在未配置字段名（name）的表单组件，无法获取表单数据');
      return;
    }
    textToCopy = JSON.stringify(snapshot.mergedValues, null, 2);
  }

  if (!textToCopy) {
    Message.warning('复制内容为空');
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    Message.success(action.successMessage || '复制成功');
  } catch (e) {
    Message.error(action.errorMessage || (e instanceof Error ? e.message : '复制失败'));
  }
}

async function runCopyData(action: CopyDataAction, scope: Record<string, unknown>) {
  const text = action.value?.text;
  const toastText = action.value?.toastText ?? action.successMessage;
  const evaluated = evaluateTemplate(text ?? '', scope);
  const textToCopy = evaluated == null ? '' : typeof evaluated === 'string' ? evaluated : JSON.stringify(evaluated, null, 2);

  if (!textToCopy) {
    Message.warning('复制内容为空');
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    Message.success(toastText || '复制成功');
  } catch (e) {
    Message.error(action.errorMessage || (e instanceof Error ? e.message : '复制失败'));
  }
}

async function runPostData(action: PostDataAction, scope: Record<string, unknown>, formCtx: FormRuntimeCtx | null) {
  const v = action.value ?? {};
  const method = String(v.method ?? 'post').toUpperCase();
  const rawUrl = String(v.url ?? v.path ?? '').trim();
  const url = resolveRequestUrl(rawUrl, import.meta.env.VITE_API_BASE || '');
  if (!url) {
    Message.error('请先配置 postData 的 url/path');
    return;
  }

  let body: unknown = undefined;
  const bodySource = v.bodySource ?? (v.bodyJson ? 'staticJson' : v.body ? 'none' : 'formValues');

  if (method !== 'GET') {
    if (v.body !== undefined) {
      body = resolveDeep(v.body, scope);
    } else if (bodySource === 'staticJson') {
      const raw = String(v.bodyJson ?? '').trim();
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          Message.error('postData.bodyJson 不是合法 JSON');
          return;
        }
      }
    } else if (bodySource === 'formValues') {
      if (!formCtx) {
        Message.warning('postData: 需要表单数据时，请把组件放到 Form 内');
        return;
      }
      const snapshot = formCtx.getMergedValues();
      if (!snapshot.ok || !snapshot.mergedValues) {
        Message.error('存在未配置字段名（name）的表单组件，无法获取表单数据');
        return;
      }
      body = snapshot.mergedValues;
    }
  }

  // params：仅在 GET 时拼到 query（最小实现）
  let finalUrl = url;
  if (method === 'GET' && v.params !== undefined) {
    const paramsVal = resolveDeep(v.params, scope);
    if (paramsVal && typeof paramsVal === 'object' && !Array.isArray(paramsVal)) {
      const usp = new URLSearchParams();
      for (const [k, vv] of Object.entries(paramsVal as Record<string, unknown>)) {
        if (vv === undefined || vv === null) continue;
        usp.set(k, String(vv));
      }
      const qs = usp.toString();
      if (qs) finalUrl = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
    }
  }

  try {
    const resp = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(v.headers || {}),
      },
      body: method === 'GET' ? undefined : body === undefined ? undefined : JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(text || resp.statusText || '请求失败');
    }
    const toastText = v.toastText ?? action.successMessage;
    if (toastText) Message.success(toastText);
  } catch (e) {
    Message.error(action.errorMessage || (e instanceof Error ? e.message : '操作失败'));
  }
}

function runUpdateProps(action: UpdatePropsAction, scope: Record<string, unknown>) {
  const v = action.value ?? {};
  const id = String(v.id ?? '').trim();
  if (!id) {
    Message.warning('updateProps: 请配置目标组件 id');
    return;
  }
  let nextProps: Record<string, unknown> = {};

  if (v.propsJson) {
    try {
      const parsed = JSON.parse(String(v.propsJson));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        nextProps = parsed as Record<string, unknown>;
      }
    } catch {
      Message.error('updateProps.propsJson 不是合法 JSON');
      return;
    }
  } else if (v.props && typeof v.props === 'object' && !Array.isArray(v.props)) {
    nextProps = v.props as Record<string, unknown>;
  } else if (v.payload && typeof v.payload === 'object' && !Array.isArray(v.payload)) {
    // 兼容 schema：payload 直接作为需要合并的 props
    nextProps = v.payload as Record<string, unknown>;
  }

  const resolvedProps = resolveDeep(nextProps, scope) as Record<string, unknown>;
  useEditorStore.getState().updateComponent(id, resolvedProps);
  if (action.successMessage) {
    Message.success(action.successMessage);
  }
}

function runNavigate(action: NavigateAction, navigate: NavigateFn) {
  const to = (action.to ?? '').trim();
  if (!to) {
    Message.warning('请先配置跳转地址');
    return;
  }
  const target = action.target ?? '_self';

  if (isAbsoluteUrl(to)) {
    if (target === '_blank') {
      window.open(to, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = to;
    }
    return;
  }

  if (target === '_blank') {
    window.open(to, '_blank', 'noopener,noreferrer');
    return;
  }

  navigate(to, { replace: !!action.replace });
}

export async function runAction(args: {
  action: ButtonAction | undefined;
  formCtx: FormRuntimeCtx | null;
  navigate: NavigateFn;
  scope?: Record<string, unknown>;
  event?: unknown;
}) {
  const { action, formCtx, navigate, scope, event } = args;
  if (!action || !action.type) {
    Message.warning('请先在按钮属性里配置动作');
    return;
  }

  const components = useEditorStore.getState().components;
  const componentProps: Record<string, unknown> = {};
  const walk = (nodes: ComponentNode[]) => {
    for (const n of nodes) {
      if (n?.id) componentProps[String(n.id)] = n?.props ?? {};
      if (Array.isArray(n?.children) && n.children.length) walk(n.children as ComponentNode[]);
    }
  };
  walk(components as ComponentNode[]);

  const scopeWithBuiltins: Record<string, unknown> = {
    ...(scope || {}),
    event,
    formValues: (() => {
      if (!formCtx) return undefined;
      const snapshot = formCtx.getMergedValues();
      return snapshot.ok ? snapshot.mergedValues : undefined;
    })(),
    componentProps,
  };

  switch (action.type) {
    case 'submitForm':
      if (!formCtx) {
        Message.warning('请把按钮放到表单容器（Form）内部再提交');
        return;
      }
      await formCtx.submit(action);
      return;

    case 'logFormValues':
      if (!formCtx) {
        Message.warning('请把按钮放到表单容器（Form）内部');
        return;
      }
      {
        const snapshot = formCtx.getMergedValues();
        if (!snapshot.ok || !snapshot.mergedValues) {
          Message.error('存在未配置字段名（name）的表单组件，无法获取表单数据');
          return;
        }
        console.log('formValues', snapshot.mergedValues);
        Message.success('已输出到控制台');
      }
      return;

    case 'copy':
      await runCopy(action, formCtx);
      return;

    case 'navigate':
      runNavigate(action, navigate);
      return;

    case 'request': {
      const req = action.request ?? {};
      const bodySource = req.bodySource ?? 'none';

      if (bodySource === 'none') {
        await runRequest(action, undefined);
        return;
      }

      if (bodySource === 'staticJson') {
        const raw = String(req.bodyJson ?? '').trim();
        if (!raw) {
          Message.warning('请先配置 Body JSON');
          return;
        }
        try {
          const json = JSON.parse(raw);
          await runRequest(action, json);
        } catch {
          Message.error('Body JSON 不是合法 JSON');
        }
        return;
      }

      // formValues
      if (!formCtx) {
        Message.warning('请把按钮放到表单容器（Form）内部');
        return;
      }

      if (req.validate !== false) {
        const validated = formCtx.validateAndMarkErrors();
        if (!validated.ok || !validated.mergedValues) return;
        await runRequest(action, validated.mergedValues);
        return;
      }

      const snapshot = formCtx.getMergedValues();
      if (!snapshot.ok || !snapshot.mergedValues) {
        Message.error('存在未配置字段名（name）的表单组件，无法获取表单数据');
        return;
      }
      await runRequest(action, snapshot.mergedValues);
      return;
    }

    case 'copyData':
      await runCopyData(action, scopeWithBuiltins);
      return;

    case 'postData':
      await runPostData(action, scopeWithBuiltins, formCtx);
      return;

    case 'updateProps':
      runUpdateProps(action, scopeWithBuiltins);
      return;

    default: {
      const { successMessage } = getSuccessError(action);
      if (successMessage) {
        Message.info(successMessage);
        return;
      }
      Message.warning('暂不支持该动作类型');
    }
  }
}

export async function runActionList(args: {
  actions: ButtonAction[] | undefined;
  formCtx: FormRuntimeCtx | null;
  navigate: NavigateFn;
  scope?: Record<string, unknown>;
  event?: unknown;
}) {
  const { actions, formCtx, navigate, scope, event } = args;
  if (!actions || actions.length === 0) {
    Message.warning('请先绑定动作');
    return;
  }
  for (const action of actions) {
    // 串行执行，便于预测；未来如需并行可扩展
    await runAction({ action, formCtx, navigate, scope, event });
  }
}

// Backward-compatible wrapper
export async function runButtonAction(args: {
  action: ButtonAction | undefined;
  formCtx: FormRuntimeCtx | null;
  navigate: NavigateFn;
}) {
  return runAction(args);
}

