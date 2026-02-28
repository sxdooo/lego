/* eslint-disable react-refresh/only-export-components */
import { Fragment, useContext } from 'react';
import type { ReactNode } from 'react';
import { Button, Input } from '@arco-design/web-react';
import { COMPONENT_TYPES } from '@lego/utils';
import type { ComponentNode } from '@lego/utils';
import { FormRuntimeContext, FormRuntimeProvider } from './runtimeFormRuntime';
import type { ButtonAction, RuntimeEvents } from './runtimeActionTypes';
import { runActionList, runButtonAction } from './runtimeActionRunner';

export type OptionItem = {
  label?: string;
  value?: string;
};

export type RenderChild = (child: ComponentNode) => ReactNode;

export type RuntimeRendererProps = {
  component: ComponentNode;
  selectable: boolean;
  renderChild: RenderChild;
  wrapSelectable: (componentId: string, node: ReactNode) => ReactNode;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
};

const FieldError = ({ err }: { err?: string }) =>
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

export const TextRuntimeRenderer = ({ component, wrapSelectable }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  return wrapSelectable(component.id, <div style={style}>{props.content ?? '文本内容'}</div>);
};

export const InputRuntimeRenderer = ({ component, wrapSelectable, navigate }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  const formCtx = useContext(FormRuntimeContext);
  const events = (props.events ?? {}) as RuntimeEvents;

  if (formCtx && props.name) {
    const name = String(props.name).trim();
    const value = (formCtx.values[name] ?? props.defaultValue ?? props.value ?? '') as string;
    const err = formCtx.errors[name];
    const mergedStyle = err ? { ...style, border: '1px solid #f56c6c' } : style;

    return wrapSelectable(
      component.id,
      <div style={{ display: 'inline-block' }}>
        <Input
          style={mergedStyle}
          placeholder={props.placeholder ?? '请输入'}
          value={value}
          onChange={async (v: string) => {
            formCtx.setValue(name, v);
            if (events.onChange?.length) {
              await runActionList({ actions: events.onChange, formCtx, navigate, event: { value: v } });
            }
          }}
        />
        <FieldError err={err} />
      </div>
    );
  }

  return wrapSelectable(
    component.id,
    <Input
      style={style}
      placeholder={props.placeholder ?? '请输入'}
      defaultValue={props.defaultValue ?? props.value ?? ''}
    />
  );
};

export const SelectRuntimeRenderer = ({ component, wrapSelectable, navigate }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  const formCtx = useContext(FormRuntimeContext);
  const options = Array.isArray(props.options) ? (props.options as OptionItem[]) : [];
  const events = (props.events ?? {}) as RuntimeEvents;

  if (formCtx && props.name) {
    const name = String(props.name).trim();
    const value = String(formCtx.values[name] ?? props.defaultValue ?? props.value ?? '');
    const err = formCtx.errors[name];
    const mergedStyle = err ? { ...style, border: '1px solid #f56c6c' } : style;

    return wrapSelectable(
      component.id,
      <div style={{ display: 'inline-block' }}>
        <select
          style={mergedStyle}
          value={value}
          onChange={async (e) => {
            const v = (e.target as HTMLSelectElement).value;
            formCtx.setValue(name, v);
            if (events.onChange?.length) {
              await runActionList({ actions: events.onChange, formCtx, navigate, event: { value: v } });
            }
          }}
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
        <FieldError err={err} />
      </div>
    );
  }

  return wrapSelectable(
    component.id,
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
  );
};

export const TextareaRuntimeRenderer = ({ component, wrapSelectable, navigate }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  const formCtx = useContext(FormRuntimeContext);
  const events = (props.events ?? {}) as RuntimeEvents;

  if (formCtx && props.name) {
    const name = String(props.name).trim();
    const value = String(formCtx.values[name] ?? props.defaultValue ?? props.value ?? '');
    const err = formCtx.errors[name];
    const mergedStyle = err ? { ...style, border: '1px solid #f56c6c' } : style;

    return wrapSelectable(
      component.id,
      <div style={{ display: 'inline-block' }}>
        <textarea
          style={mergedStyle}
          placeholder={props.placeholder ?? '请输入'}
          rows={props.rows ?? 4}
          value={value}
          onChange={async (e) => {
            const v = (e.target as HTMLTextAreaElement).value;
            formCtx.setValue(name, v);
            if (events.onChange?.length) {
              await runActionList({ actions: events.onChange, formCtx, navigate, event: { value: v } });
            }
          }}
        />
        <FieldError err={err} />
      </div>
    );
  }

  return wrapSelectable(
    component.id,
    <textarea
      style={style}
      placeholder={props.placeholder ?? '请输入'}
      rows={props.rows ?? 4}
      defaultValue={props.defaultValue ?? props.value ?? ''}
    />
  );
};

export const ButtonRuntimeRenderer = ({ component, wrapSelectable, navigate }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  const text = props.text ?? '按钮';
  const formCtx = useContext(FormRuntimeContext);
  const action = props.action as ButtonAction | undefined;
  const events = (props.events ?? {}) as RuntimeEvents;

  return wrapSelectable(
    component.id,
    <Button
      style={style}
      type="primary"
      onClick={async () => {
        if (events.onClick?.length) {
          await runActionList({ actions: events.onClick, formCtx, navigate, event: { type: 'click' } });
          return;
        }
        await runButtonAction({ action, formCtx, navigate });
      }}
    >
      {text}
    </Button>
  );
};

export const ContainerRuntimeRenderer = ({ component, renderChild, wrapSelectable }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  return wrapSelectable(
    component.id,
    <div style={style}>
      {component.children?.map((child) => (
        <Fragment key={child.id}>{renderChild(child)}</Fragment>
      ))}
    </div>
  );
};

export const FormRuntimeRenderer = ({ component, renderChild, wrapSelectable }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  return wrapSelectable(
    component.id,
    <FormRuntimeProvider formNode={component}>
      <div style={style}>
        {component.children?.map((child) => (
          <Fragment key={child.id}>{renderChild(child)}</Fragment>
        ))}
      </div>
    </FormRuntimeProvider>
  );
};

export const UnknownRuntimeRenderer = ({ component, wrapSelectable }: RuntimeRendererProps) => {
  const props = component.props ?? {};
  const style = props.style ?? {};
  return wrapSelectable(
    component.id,
    <div style={{ ...style, color: '#999' }}>未知组件：{component.type}</div>
  );
};

export const runtimeRendererRegistry: Record<string, (props: RuntimeRendererProps) => ReactNode> = {
  [COMPONENT_TYPES.TEXT]: TextRuntimeRenderer,
  [COMPONENT_TYPES.INPUT]: InputRuntimeRenderer,
  [COMPONENT_TYPES.SELECT]: SelectRuntimeRenderer,
  [COMPONENT_TYPES.TEXTAREA]: TextareaRuntimeRenderer,
  [COMPONENT_TYPES.BUTTON]: ButtonRuntimeRenderer,
  [COMPONENT_TYPES.CONTAINER]: ContainerRuntimeRenderer,
  [COMPONENT_TYPES.FORM]: FormRuntimeRenderer,
};

