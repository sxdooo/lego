import React, { useEffect, useMemo, useState } from 'react';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { Button, Input, Collapse, ColorPicker, Message } from '@arco-design/web-react';
import { componentTypeToPropertyPanel } from '@lego/components/src/componentRegistry';
import './index.less';

const CollapseItem = Collapse.Item;

const propertyStyleMap = {
  width: {
    label: '宽度',
    type: 'string',
  },
  height: {
    label: '高度',
    type: 'string',
  },
  backgroundColor: {
    label: '背景颜色',
    type: 'string',
  },
  color: {
    label: '文字颜色',
    type: 'string',
  },
  fontSize: {
    label: '字体大小',
    type: 'string',
  },
  fontWeight: {
    label: '字体粗细',
    type: 'string',
  },
  marginTop: {
    label: '上外边距',
    type: 'string',
  },
  marginBottom: {
    label: '下外边距',
    type: 'string',
  },
  marginLeft: {
    label: '左外边距',
    type: 'string',
  },
  marginRight: {
    label: '右外边距',
    type: 'string',
  },
  paddingTop: {
    label: '上内边距',
    type: 'string',
  },
  paddingBottom: {
    label: '下内边距',
    type: 'string',
  },
  paddingLeft: {
    label: '左内边距',
    type: 'string',
  },
  paddingRight: {
    label: '右内边距',
    type: 'string',
  }
}

export const PropertyPanel: React.FC = () => {
  const { selectedId, components, updateComponent } = useEditorStore();

  const findSelectedComponent = (nodes: any[], id?: string): any | undefined => {
    if (!id) return undefined;
    for (const node of nodes) {
      if (node?.id === id) return node;
      const children = node?.children;
      if (Array.isArray(children) && children.length) {
        const found = findSelectedComponent(children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedComponent = findSelectedComponent(components as any[], selectedId);
  const eventsObj = selectedComponent?.props?.events ?? {};
  const initialEventsText = useMemo(() => JSON.stringify(eventsObj ?? {}, null, 2), [eventsObj]);
  const [eventsText, setEventsText] = useState(initialEventsText);

  useEffect(() => {
    setEventsText(initialEventsText);
  }, [initialEventsText, selectedComponent?.id]);

  const handlePropChange = (propName: string, value: any) => {
    if (selectedComponent) {
      updateComponent(selectedComponent.id, { [propName]: value });
    }
  };

  const handleStyleChange = (styleKey: string, value: string | any[]) => {
    if (!selectedComponent) return;
    const currentStyle = selectedComponent.props?.style || {};
    updateComponent(selectedComponent.id, {
      style: { ...currentStyle, [styleKey]: value },
    });
  };

  if (!selectedComponent) {
    return (
      <div
        style={{
          width: '200px',
          backgroundColor: '#fff',
          borderLeft: '1px solid #ddd',
          padding: '20px',
        }}
      >
        <p style={{ color: '#999', textAlign: 'center' }}>请选择一个组件</p>
      </div>
    );
  }

  const applyEvents = () => {
    try {
      const trimmed = String(eventsText ?? '').trim();
      const parsed = trimmed ? JSON.parse(trimmed) : {};
      handlePropChange('events', parsed);
      Message.success('已应用 events');
    } catch {
      Message.error('events JSON 格式错误，无法应用');
    }
  };

  return (
    <div
      style={{
        width: '300px',
        backgroundColor: '#fff',
        borderLeft: '1px solid #ddd',
        padding: '20px',
        paddingTop: '0',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ marginBottom: '20px' }}>{selectedComponent.type}</h3>
      <div>
        <div style={{ marginTop: '20px' }}>
          {(() => {
            const SpecificPanel = componentTypeToPropertyPanel[selectedComponent.type];
            return SpecificPanel ? (
              <div style={{ marginTop: '12px' }}>
                <Collapse
                  bordered={false}
                  defaultActiveKey={['1']}
                  style={{ border: 'none' }}
                  className="my-property-collapse"
                  expandIconPosition='right'
                >
                  <CollapseItem header='组件属性' name='1' contentStyle={{ padding: '0', background: '#fff' }}>
                    <SpecificPanel component={selectedComponent} onPropChange={handlePropChange} />
                  </CollapseItem>
                </Collapse>
              </div>
            ) : null;
          })()}
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            style={{ border: 'none' }}
            className="my-property-collapse"
            expandIconPosition='right'
          >
            <CollapseItem header='通用样式' name='1' contentStyle={{ padding: '0', background: '#fff' }}>
              {Object.keys(propertyStyleMap).map((styleKey) => (
                <div key={styleKey} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    {propertyStyleMap?.[styleKey as keyof typeof propertyStyleMap]?.label}:
                  </label>
                  {
                    styleKey?.toLowerCase()?.includes('color') ?
                    <div className='flexWrapper'>
                      <ColorPicker
                        value={selectedComponent.props?.style?.[styleKey] || ''}
                        onChange={(value) => handleStyleChange(styleKey, value)}
                        style={{marginRight: 10}}
                        size='mini'
                      />
                      <Input
                        value={selectedComponent.props?.style?.[styleKey] || ''}
                        onChange={(value) => handleStyleChange(styleKey, value)}
                        size='mini'
                      />
                    </div>
                    :
                    <Input
                      value={selectedComponent.props?.style?.[styleKey] || ''}
                      onChange={(value) => handleStyleChange(styleKey, value)}
                      size='mini'
                    />
                  }
                </div>
              ))}
            </CollapseItem>
          </Collapse>

          <Collapse
            bordered={false}
            defaultActiveKey={[]}
            style={{ border: 'none' }}
            className="my-property-collapse"
            expandIconPosition='right'
          >
            <CollapseItem header='事件绑定（props.events）' name='1' contentStyle={{ padding: '0', background: '#fff' }}>
              <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                当前支持：onClick / onChange（数组形式，按顺序执行）
              </div>
              <Input.TextArea
                value={eventsText}
                onChange={(v) => setEventsText(v)}
                placeholder='例如：{ "onClick": [ { "type": "navigate", "to": "/page/xxx" } ] }'
                autoSize={{ minRows: 6, maxRows: 16 }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="mini" type="primary" onClick={applyEvents}>
                  应用
                </Button>
              </div>
            </CollapseItem>
          </Collapse>

        </div>
      </div>
    </div>
  );
};