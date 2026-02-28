import { Fragment, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ComponentNode } from '@lego/utils';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { runtimeRendererRegistry, UnknownRuntimeRenderer } from './runtimeRenderers';

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
  const navigate = useNavigate();

  const wrapSelectable = (componentId: string, node: ReactNode) => (
    <PreviewSelectable componentId={componentId} selectable={selectable}>
      {node}
    </PreviewSelectable>
  );

  const renderChild = (child: ComponentNode) => (
    <PreviewNode component={child} selectable={selectable} />
  );

  const Renderer = runtimeRendererRegistry[component.type] ?? UnknownRuntimeRenderer;
  return (
    <Renderer
      component={component}
      selectable={selectable}
      renderChild={renderChild}
      wrapSelectable={wrapSelectable}
      navigate={navigate}
    />
  );
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

