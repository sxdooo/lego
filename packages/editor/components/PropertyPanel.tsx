import React from 'react';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { Input, Collapse, ColorPicker } from '@arco-design/web-react';
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

  const selectedComponent = components.find(comp => comp.id === selectedId);

  const handlePropChange = (propName: string, value: any) => {
    if (selectedComponent) {
      updateComponent(selectedComponent.id, { [propName]: value });
    }
  };

  const handleStyleChange = (styleKey: string, value: string) => {
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

        </div>
      </div>
    </div>
  );
};