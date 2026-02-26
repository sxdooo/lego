import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { Button, Input, Message } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import { COMPONENT_TYPES } from '@lego/utils';
import type { ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { resolveRequestUrl, validateForm, type FormFieldMeta } from './runtimeFormLogic';

type OptionItem = {
  label?: string;
  value?: string;
};

type SubmitFormAction = {
  type: 'submitForm';
  formScope?: 'closest';
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    // 兼容旧字段 body: 'formValues'
    bodySource?: 'formValues';
    body?: 'formValues';
  };
  successMessage?: string;
  errorMessage?: string;
};

type RequestAction = {
  type: 'request';
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    bodySource?: 'none' | 'formValues' | 'staticJson';
    bodyJson?: string;
    validate?: boolean; // 当 bodySource=formValues 时可选
  };
  successMessage?: string;
  errorMessage?: string;
};

type NavigateAction = {
  type: 'navigate';
  to?: string;
  target?: '_self' | '_blank';
  replace?: boolean;
};

type CopyAction = {
  type: 'copy';
  textSource?: 'static' | 'formValuesJson';
  text?: string;
  successMessage?: string;
  errorMessage?: string;
};

type LogFormValuesAction = {
  type: 'logFormValues';
};

type ButtonAction =
  | SubmitFormAction
  | RequestAction
  | NavigateAction
  | CopyAction
  | LogFormValuesAction;

type FormRuntimeCtx = {
  formId: string;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  setValue: (name: string, value: unknown) => void;
  submit: (action: SubmitFormAction) => Promise<void>;
  getMergedValues: () => { ok: boolean; mergedValues?: Record<string, unknown> };
  validateAndMarkErrors: () => { ok: boolean; mergedValues?: Record<string, unknown> };
};

const FormRuntimeContext = createContext<FormRuntimeCtx | null>(null);

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

function FormRuntimeProvider({
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
      const url = resolveRequestUrl(
        req.url ?? '',
        import.meta.env.VITE_API_BASE || ''
      );
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

const PreviewSelectable = ({
  componentId,
  selectable,
  children,
}: {
  componentId: string;
  selectable: boolean;
  children: ReactNode;
}) => {
  const selectedId = useEditorStore((s) => s.selectedId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const isSelected = selectedId === componentId;
  const [hovered, setHovered] = useState(false);
  const showOutline = selectable && (isSelected || hovered);

  return (
    <div
      style={{
        position: 'relative',
        outline: showOutline ? '1px dashed #2b7dbc' : undefined,
        outlineOffset: showOutline ? 2 : undefined,
      }}
      onMouseEnter={() => selectable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (!selectable) return;
        e.stopPropagation();
        e.preventDefault();
        selectComponent(componentId);
      }}
    >
      {children}
    </div>
  );
};

function PreviewNode({
  component,
  selectable,
}: {
  component: ComponentNode;
  selectable: boolean;
}) {
  const props = component.props ?? {};
  const style = props.style ?? {};
  const formCtx = useContext(FormRuntimeContext);
  const navigate = useNavigate();
  const renderFieldError = (err?: string) =>
    err ? (
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          lineHeight: '16px',
          color: '#f56c6c',
        }}
      >
        {err}
      </div>
    ) : null;

  switch (component.type) {
    case COMPONENT_TYPES.TEXT:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <div style={style}>{props.content ?? '文本内容'}</div>
        </PreviewSelectable>
      );
    case COMPONENT_TYPES.INPUT: {
      if (formCtx && props.name) {
        const name = String(props.name).trim();
        const value = (formCtx.values[name] ?? props.defaultValue ?? props.value ?? '') as string;
        const err = formCtx.errors[name];
        const mergedStyle = err ? { ...style, border: '1px solid #f56c6c' } : style;
        return (
          <PreviewSelectable componentId={component.id} selectable={selectable}>
            <div style={{ display: 'inline-block' }}>
              <Input
                style={mergedStyle}
                placeholder={props.placeholder ?? '请输入'}
                value={value}
                onChange={(v: string) => formCtx.setValue(name, v)}
              />
              {renderFieldError(err)}
            </div>
          </PreviewSelectable>
        );
      }
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <Input
            style={style}
            placeholder={props.placeholder ?? '请输入'}
            defaultValue={props.defaultValue ?? props.value ?? ''}
          />
        </PreviewSelectable>
      );
    }
    case COMPONENT_TYPES.SELECT: {
      const options = Array.isArray(props.options)
        ? (props.options as OptionItem[])
        : [];
      if (formCtx && props.name) {
        const name = String(props.name).trim();
        const value = String(formCtx.values[name] ?? props.defaultValue ?? props.value ?? '');
        const err = formCtx.errors[name];
        const mergedStyle = err ? { ...style, border: '1px solid #f56c6c' } : style;
        return (
          <PreviewSelectable componentId={component.id} selectable={selectable}>
            <div style={{ display: 'inline-block' }}>
              <select
                style={mergedStyle}
                value={value}
                onChange={(e) =>
                  formCtx.setValue(name, (e.target as HTMLSelectElement).value)
                }
              >
                {options.length > 0 ? (
                  options.map((option) => (
                    <option
                      key={option.value ?? option.label ?? 'option'}
                      value={option.value ?? ''}
                    >
                      {option.label ?? option.value}
                    </option>
                  ))
                ) : (
                  <option value=''>暂无选项</option>
                )}
              </select>
              {renderFieldError(err)}
            </div>
          </PreviewSelectable>
        );
      }
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <select style={style} defaultValue={props.defaultValue ?? props.value ?? ''}>
            {options.length > 0 ? (
              options.map((option) => (
                <option
                  key={option.value ?? option.label ?? 'option'}
                  value={option.value ?? ''}
                >
                  {option.label ?? option.value}
                </option>
              ))
            ) : (
              <option value=''>暂无选项</option>
            )}
          </select>
        </PreviewSelectable>
      );
    }
    case COMPONENT_TYPES.TEXTAREA: {
      if (formCtx && props.name) {
        const name = String(props.name).trim();
        const value = String(formCtx.values[name] ?? props.defaultValue ?? props.value ?? '');
        const err = formCtx.errors[name];
        const mergedStyle = err ? { ...style, border: '1px solid #f56c6c' } : style;
        return (
          <PreviewSelectable componentId={component.id} selectable={selectable}>
            <div style={{ display: 'inline-block' }}>
              <textarea
                style={mergedStyle}
                placeholder={props.placeholder ?? '请输入'}
                rows={props.rows ?? 4}
                value={value}
                onChange={(e) =>
                  formCtx.setValue(name, (e.target as HTMLTextAreaElement).value)
                }
              />
              {renderFieldError(err)}
            </div>
          </PreviewSelectable>
        );
      }
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <textarea
            style={style}
            placeholder={props.placeholder ?? '请输入'}
            rows={props.rows ?? 4}
            defaultValue={props.defaultValue ?? props.value ?? ''}
          />
        </PreviewSelectable>
      );
    }
    case COMPONENT_TYPES.BUTTON: {
      const text = props.text ?? '按钮';
      const action = props.action as ButtonAction | undefined;

      const actionMessages = (a: ButtonAction | undefined) => {
        if (!a) return { successMessage: undefined as string | undefined, errorMessage: undefined as string | undefined };
        if (a.type === 'submitForm' || a.type === 'request') {
          return { successMessage: a.successMessage, errorMessage: a.errorMessage };
        }
        if (a.type === 'copy') {
          return { successMessage: a.successMessage, errorMessage: a.errorMessage };
        }
        return { successMessage: undefined, errorMessage: undefined };
      };

      const runRequest = async (req: RequestAction['request'], body?: unknown) => {
        const method = (req?.method || 'POST').toUpperCase();
        const url = resolveRequestUrl(req?.url ?? '', import.meta.env.VITE_API_BASE || '');
        if (!url) {
          Message.error('请先配置请求 URL');
          return;
        }
        try {
          const resp = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(req?.headers || {}),
            },
            body: method === 'GET' ? undefined : body === undefined ? undefined : JSON.stringify(body),
          });
          if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            throw new Error(text || resp.statusText || '请求失败');
          }
          const { successMessage } = actionMessages(action);
          Message.success(successMessage || '操作成功');
        } catch (e) {
          const { errorMessage } = actionMessages(action);
          Message.error(errorMessage || (e instanceof Error ? e.message : '操作失败'));
        }
      };

      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <Button
            style={style}
            type="primary"
            onClick={async () => {
              if (!action || !action.type) {
                Message.warning('请先在按钮属性里配置动作');
                return;
              }

              switch (action.type) {
                case 'submitForm': {
                  if (!formCtx) {
                    Message.warning('请把按钮放到表单容器（Form）内部再提交');
                    return;
                  }
                  await formCtx.submit(action);
                  return;
                }
                case 'logFormValues': {
                  if (!formCtx) {
                    Message.warning('请把按钮放到表单容器（Form）内部');
                    return;
                  }
                  const snapshot = formCtx.getMergedValues();
                  if (!snapshot.ok || !snapshot.mergedValues) {
                    Message.error('存在未配置字段名（name）的表单组件，无法获取表单数据');
                    return;
                  }
                  console.log('formValues', snapshot.mergedValues);
                  Message.success('已输出到控制台');
                  return;
                }
                case 'copy': {
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
                  return;
                }
                case 'navigate': {
                  const to = (action.to ?? '').trim();
                  if (!to) {
                    Message.warning('请先配置跳转地址');
                    return;
                  }
                  const target = action.target ?? '_self';
                  if (/^https?:\/\//i.test(to)) {
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
                  return;
                }
                case 'request': {
                  const req = action.request ?? {};
                  const bodySource = req.bodySource ?? 'none';

                  if (bodySource === 'none') {
                    await runRequest(req, undefined);
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
                      await runRequest(req, json);
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
                    await runRequest(req, validated.mergedValues);
                    return;
                  }

                  const snapshot = formCtx.getMergedValues();
                  if (!snapshot.ok || !snapshot.mergedValues) {
                    Message.error('存在未配置字段名（name）的表单组件，无法获取表单数据');
                    return;
                  }
                  await runRequest(req, snapshot.mergedValues);
                  return;
                }
                default:
                  Message.warning('暂不支持该动作类型');
              }
            }}
          >
            {text}
          </Button>
        </PreviewSelectable>
      );
    }
    case COMPONENT_TYPES.CONTAINER:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <div style={style}>
            {component.children?.map((child: ComponentNode) => (
              <Fragment key={child.id}>
                <PreviewNode component={child} selectable={selectable} />
              </Fragment>
            ))}
          </div>
        </PreviewSelectable>
      );
    case COMPONENT_TYPES.FORM:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <FormRuntimeProvider formNode={component}>
            <div style={style}>
              {component.children?.map((child: ComponentNode) => (
                <Fragment key={child.id}>
                  <PreviewNode component={child} selectable={selectable} />
                </Fragment>
              ))}
            </div>
          </FormRuntimeProvider>
        </PreviewSelectable>
      );
    default:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <div style={{ ...style, color: '#999' }}>未知组件：{component.type}</div>
        </PreviewSelectable>
      );
  }
}

export function RuntimePreview({
  components,
  selectable,
}: {
  components: ComponentNode[];
  selectable: boolean;
}) {
  const nodes = useMemo(
    () =>
      components.map((component) => (
        <Fragment key={component.id}>
          <PreviewNode component={component} selectable={selectable} />
        </Fragment>
      )),
    [components, selectable]
  );
  return nodes;
}

