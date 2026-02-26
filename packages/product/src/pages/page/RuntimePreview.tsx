import { Fragment, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Input } from '@arco-design/web-react';
import { COMPONENT_TYPES } from '@lego/utils';
import type { ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';

type OptionItem = {
  label?: string;
  value?: string;
};

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

const renderPreviewComponent = (
  component: ComponentNode,
  selectable: boolean
): ReactNode => {
  const props = component.props ?? {};
  const style = props.style ?? {};

  switch (component.type) {
    case COMPONENT_TYPES.TEXT:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <div style={style}>{props.content ?? '文本内容'}</div>
        </PreviewSelectable>
      );
    case COMPONENT_TYPES.INPUT:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <Input
            style={style}
            placeholder={props.placeholder ?? '请输入'}
            defaultValue={props.value ?? ''}
          />
        </PreviewSelectable>
      );
    case COMPONENT_TYPES.SELECT: {
      const options = Array.isArray(props.options)
        ? (props.options as OptionItem[])
        : [];
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <select style={style} defaultValue={props.value ?? ''}>
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
    case COMPONENT_TYPES.TEXTAREA:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <textarea
            style={style}
            placeholder={props.placeholder ?? '请输入'}
            rows={props.rows ?? 4}
            defaultValue={props.value ?? ''}
          />
        </PreviewSelectable>
      );
    case COMPONENT_TYPES.CONTAINER:
    case COMPONENT_TYPES.FORM:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <div style={style}>
            {component.children?.map((child: ComponentNode) => (
              <Fragment key={child.id}>
                {renderPreviewComponent(child, selectable)}
              </Fragment>
            ))}
          </div>
        </PreviewSelectable>
      );
    default:
      return (
        <PreviewSelectable componentId={component.id} selectable={selectable}>
          <div style={{ ...style, color: '#999' }}>未知组件：{component.type}</div>
        </PreviewSelectable>
      );
  }
};

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
          {renderPreviewComponent(component, selectable)}
        </Fragment>
      )),
    [components, selectable]
  );
  return nodes;
}

