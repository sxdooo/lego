import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { Input, Select, Switch } from '@arco-design/web-react';

interface ButtonPropertyPanelProps {
  component: ComponentNode;
  onPropChange: (propName: string, value: any) => void;
}

const Option = Select.Option;

export const ButtonPropertyPanel: React.FC<ButtonPropertyPanelProps> = ({
  component,
  onPropChange,
}) => {
  const props = component.props ?? {};
  const action = props.action ?? {};
  const request = action.request ?? {};

  const updateAction = (next: any) => onPropChange('action', { ...action, ...next });
  const updateRequest = (next: any) =>
    updateAction({ request: { ...request, ...next } });

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>按钮文案</label>
        <Input value={props.text} onChange={(v) => onPropChange('text', v)} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>动作类型</label>
        <Select
          value={action.type ?? 'submitForm'}
          onChange={(v) => updateAction({ type: v })}
        >
          <Option value="submitForm">提交表单（校验 + 请求）</Option>
          <Option value="request">请求（可选表单数据）</Option>
          <Option value="navigate">跳转</Option>
          <Option value="copy">复制</Option>
          <Option value="logFormValues">打印表单数据</Option>
        </Select>
      </div>

      {action.type === 'navigate' ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>跳转地址（to）</label>
            <Input
              value={action.to}
              onChange={(v) => updateAction({ to: v })}
              placeholder="/page/xxx 或 https://example.com"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>打开方式</label>
            <Select
              value={action.target ?? '_self'}
              onChange={(v) => updateAction({ target: v })}
            >
              <Option value="_self">当前页</Option>
              <Option value="_blank">新窗口</Option>
            </Select>
          </div>
          <div
            style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <label style={{ margin: 0 }}>replace（仅站内跳转）</label>
            <Switch
              checked={!!action.replace}
              onChange={(checked) => updateAction({ replace: checked })}
              size="small"
            />
          </div>
        </>
      ) : null}

      {action.type === 'copy' ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>复制内容来源</label>
            <Select
              value={action.textSource ?? 'static'}
              onChange={(v) => updateAction({ textSource: v })}
            >
              <Option value="static">固定文本</Option>
              <Option value="formValuesJson">表单数据 JSON</Option>
            </Select>
          </div>
          {(action.textSource ?? 'static') === 'static' ? (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>文本</label>
              <Input
                value={action.text}
                onChange={(v) => updateAction({ text: v })}
                placeholder="要复制的内容"
              />
            </div>
          ) : null}
        </>
      ) : null}

      {action.type === 'logFormValues' ? (
        <div style={{ marginBottom: 12, fontSize: 12, color: '#666' }}>
          点击后会把当前表单 values 输出到控制台（需按钮在 Form 内）
        </div>
      ) : null}

      {action.type === 'submitForm' || action.type === 'request' ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>请求方法</label>
            <Select
              value={request.method ?? 'POST'}
              onChange={(v) => updateRequest({ method: v })}
            >
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="GET">GET</Option>
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>请求 URL</label>
            <Input
              value={request.url}
              onChange={(v) => updateRequest({ url: v })}
              placeholder="/api/xxx 或 https://example.com/api/xxx"
            />
          </div>

          {action.type === 'request' ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>请求 Body 来源</label>
                <Select
                  value={request.bodySource ?? request.body ?? 'none'}
                  onChange={(v) => updateRequest({ bodySource: v })}
                >
                  <Option value="none">无</Option>
                  <Option value="formValues">表单数据（formValues）</Option>
                  <Option value="staticJson">固定 JSON</Option>
                </Select>
              </div>
              {request.bodySource === 'staticJson' ? (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Body JSON</label>
                  <Input.TextArea
                    value={request.bodyJson}
                    onChange={(v) => updateRequest({ bodyJson: v })}
                    placeholder='例如：{"a":1}'
                    autoSize
                  />
                </div>
              ) : null}
              {request.bodySource === 'formValues' ? (
                <div
                  style={{
                    marginBottom: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <label style={{ margin: 0 }}>提交前校验（required）</label>
                  <Switch
                    checked={request.validate !== false}
                    onChange={(checked) => updateRequest({ validate: checked })}
                    size="small"
                  />
                </div>
              ) : null}
            </>
          ) : null}

          {action.type === 'submitForm' ? (
            <div style={{ marginBottom: 12, fontSize: 12, color: '#666' }}>
              submitForm 固定使用表单数据作为 body，并强制 required 校验
            </div>
          ) : null}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>成功提示</label>
            <Input
              value={action.successMessage}
              onChange={(v) => updateAction({ successMessage: v })}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>失败提示</label>
            <Input
              value={action.errorMessage}
              onChange={(v) => updateAction({ errorMessage: v })}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

