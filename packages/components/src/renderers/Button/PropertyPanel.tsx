import React from 'react';
import type { ComponentNode } from '@lego/utils';
import { Button, Divider, Input, Select, Switch } from '@arco-design/web-react';

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
  const legacyAction = props.action ?? {};
  const events = props.events ?? {};
  const onClickActions: any[] = Array.isArray(events.onClick)
    ? events.onClick
    : legacyAction?.type
      ? [legacyAction]
      : [];

  const setOnClickActions = (next: any[]) => {
    const nextEvents = { ...events, onClick: next };
    onPropChange('events', nextEvents);
    // 兼容旧 schema：同步第一个 action
    onPropChange('action', next?.[0] ?? {});
  };

  const updateActionAt = (index: number, patch: any) => {
    const next = onClickActions.map((a, i) => (i === index ? { ...a, ...patch } : a));
    setOnClickActions(next);
  };

  const updateRequestAt = (index: number, patch: any) => {
    const cur = onClickActions[index] ?? {};
    const req = cur.request ?? {};
    updateActionAt(index, { request: { ...req, ...patch } });
  };

  const addAction = () => {
    setOnClickActions([
      ...onClickActions,
      {
        type: 'navigate',
        to: '/',
        target: '_self',
        replace: false,
      },
    ]);
  };

  const removeAction = (index: number) => {
    const next = onClickActions.filter((_, i) => i !== index);
    setOnClickActions(next);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>按钮文案</label>
        <Input value={props.text} onChange={(v) => onPropChange('text', v)} />
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>事件：onClick（动作列表）</div>
        <Button size="mini" onClick={addAction}>
          添加动作
        </Button>
      </div>

      {onClickActions.length === 0 ? (
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>暂无动作</div>
      ) : null}

      {onClickActions.map((action: any, index: number) => {
        const request = action.request ?? {};
        return (
          <div
            key={index}
            style={{
              border: '1px solid #eee',
              borderRadius: 6,
              padding: 10,
              marginBottom: 10,
              background: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>动作 #{index + 1}</div>
              <Button size="mini" status="danger" onClick={() => removeAction(index)}>
                删除
              </Button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>动作类型</label>
              <Select
                value={action.type ?? 'submitForm'}
                onChange={(v) => updateActionAt(index, { type: v })}
              >
                <Option value="submitForm">提交表单（校验 + 请求）</Option>
                <Option value="request">请求（可选表单数据）</Option>
                <Option value="navigate">跳转</Option>
                <Option value="copy">复制</Option>
                <Option value="logFormValues">打印表单数据</Option>
                <Option value="copyData">复制数据（支持表达式）</Option>
                <Option value="postData">请求（postData 兼容 schema）</Option>
                <Option value="updateProps">更新组件属性（updateProps）</Option>
              </Select>
            </div>

            {action.type === 'navigate' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>跳转地址（to）</label>
                  <Input
                    value={action.to}
                    onChange={(v) => updateActionAt(index, { to: v })}
                    placeholder="/page/xxx 或 https://example.com"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>打开方式</label>
                  <Select
                    value={action.target ?? '_self'}
                    onChange={(v) => updateActionAt(index, { target: v })}
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
                    onChange={(checked) => updateActionAt(index, { replace: checked })}
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
                    onChange={(v) => updateActionAt(index, { textSource: v })}
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
                      onChange={(v) => updateActionAt(index, { text: v })}
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

            {action.type === 'copyData' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>表达式 / 模板</label>
                  <Input
                    value={action.value?.text ?? ''}
                    onChange={(v) => updateActionAt(index, { value: { ...(action.value ?? {}), text: v } })}
                    placeholder='例如：{{tbp0f71.data.externalDataInfo.aiReplyContent}}'
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>提示文案（toastText）</label>
                  <Input
                    value={action.value?.toastText ?? action.successMessage ?? ''}
                    onChange={(v) =>
                      updateActionAt(index, {
                        value: { ...(action.value ?? {}), toastText: v },
                        successMessage: v,
                      })
                    }
                    placeholder="已复制到剪切板"
                  />
                </div>
              </>
            ) : null}

            {action.type === 'postData' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>请求方法</label>
                  <Select
                    value={action.value?.method ?? 'post'}
                    onChange={(v) => updateActionAt(index, { value: { ...(action.value ?? {}), method: v } })}
                  >
                    <Option value="post">post</Option>
                    <Option value="put">put</Option>
                    <Option value="get">get</Option>
                    <Option value="delete">delete</Option>
                  </Select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>path / url</label>
                  <Input
                    value={action.value?.path ?? action.value?.url ?? ''}
                    onChange={(v) => updateActionAt(index, { value: { ...(action.value ?? {}), path: v } })}
                    placeholder="/api/xxx 或 https://example.com/api/xxx"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Body 来源</label>
                  <Select
                    value={action.value?.bodySource ?? 'formValues'}
                    onChange={(v) => updateActionAt(index, { value: { ...(action.value ?? {}), bodySource: v } })}
                  >
                    <Option value="none">无</Option>
                    <Option value="formValues">表单数据（formValues）</Option>
                    <Option value="staticJson">固定 JSON</Option>
                  </Select>
                </div>
                {action.value?.bodySource === 'staticJson' ? (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4 }}>Body JSON</label>
                    <Input.TextArea
                      value={action.value?.bodyJson ?? ''}
                      onChange={(v) => updateActionAt(index, { value: { ...(action.value ?? {}), bodyJson: v } })}
                      placeholder='例如：{"a":1}'
                      autoSize
                    />
                  </div>
                ) : null}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>提示文案（toastText）</label>
                  <Input
                    value={action.value?.toastText ?? action.successMessage ?? ''}
                    onChange={(v) =>
                      updateActionAt(index, {
                        value: { ...(action.value ?? {}), toastText: v },
                        successMessage: v,
                      })
                    }
                    placeholder="操作成功"
                  />
                </div>
              </>
            ) : null}

            {action.type === 'updateProps' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>目标组件 ID</label>
                  <Input
                    value={action.value?.id ?? ''}
                    onChange={(v) => updateActionAt(index, { value: { ...(action.value ?? {}), id: v } })}
                    placeholder="例如：Card_h696840"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>propsJson</label>
                  <Input.TextArea
                    value={action.value?.propsJson ?? ''}
                    onChange={(v) => updateActionAt(index, { value: { ...(action.value ?? {}), propsJson: v } })}
                    placeholder='例如：{"cardId":"xxx","sourceData":[]}'
                    autoSize
                  />
                </div>
              </>
            ) : null}

            {action.type === 'submitForm' || action.type === 'request' ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>请求方法</label>
                  <Select
                    value={request.method ?? 'POST'}
                    onChange={(v) => updateRequestAt(index, { method: v })}
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
                    onChange={(v) => updateRequestAt(index, { url: v })}
                    placeholder="/api/xxx 或 https://example.com/api/xxx"
                  />
                </div>

                {action.type === 'request' ? (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 4 }}>请求 Body 来源</label>
                      <Select
                        value={request.bodySource ?? request.body ?? 'none'}
                        onChange={(v) => updateRequestAt(index, { bodySource: v })}
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
                          onChange={(v) => updateRequestAt(index, { bodyJson: v })}
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
                          onChange={(checked) => updateRequestAt(index, { validate: checked })}
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
                    onChange={(v) => updateActionAt(index, { successMessage: v })}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>失败提示</label>
                  <Input
                    value={action.errorMessage}
                    onChange={(v) => updateActionAt(index, { errorMessage: v })}
                  />
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

