import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, Message, Radio, Switch } from '@arco-design/web-react';
import { VisualEditor } from '@lego/editor';
import { PropertyPanel } from '@lego/editor';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import type { ComponentNode } from '@lego/utils';
import { fetchPage, type PageRecord, updatePage } from '../../services/pageApi';
import { RuntimePreview } from './RuntimePreview';

export default function PageViewer() {
  const { pageId } = useParams();
  const [pageInfo, setPageInfo] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [tabKey, setTabKey] = useState<'edit' | 'preview'>('edit');
  const [pageName, setPageName] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const { components, setComponents } = useEditorStore();

  useEffect(() => {
    if (!pageId) return;
    setLoading(true);
    setError(undefined);

    fetchPage(pageId)
      .then((data) => {
        setPageInfo(data);
        setPageName(data.name ?? '');
        setComponents(data.components ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [pageId, setComponents]);

  const handleSave = useCallback(async () => {
    if (!pageId) return;
    if (!Array.isArray(components)) return;

    setSaving(true);
    try {
      const updated = await updatePage(pageId, {
        name: pageName?.trim() || undefined,
        components: components as ComponentNode[],
      });
      setPageInfo(updated);
      Message.success('保存成功');
    } catch (e) {
      Message.error(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }, [components, pageId, pageName]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        正在加载页面...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#f56c6c' }}>
        {error}
      </div>
    );
  }

  if (!pageInfo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        未找到对应页面
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 12px', background: '#fff', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <Radio.Group
              type="button"
              size="small"
              value={tabKey}
              onChange={(val) => setTabKey(val as 'edit' | 'preview')}
            >
              <Radio value="edit">编辑</Radio>
              <Radio value="preview">预览</Radio>
            </Radio.Group>
            <Input
              style={{ width: 280 }}
              value={pageName}
              onChange={setPageName}
              placeholder="请输入页面名称"
              allowClear
            />
            <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>
              页面ID：{pageInfo.id}
            </span>
            {tabKey === 'preview' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                <Switch checked={selectMode} onChange={setSelectMode} size="small" />
                <span style={{ fontSize: 12, color: '#666' }}>选择模式</span>
              </div>
            ) : null}
          </div>
          <Button onClick={handleSave} type="primary" size="mini" loading={saving}>
            保存
          </Button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: '#fff' }}>
        {tabKey === 'edit' ? (
          <VisualEditor />
        ) : (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 20 }}>
              {components?.length ? (
                <RuntimePreview components={components as ComponentNode[]} selectable={selectMode} />
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '60px 0' }}>
                  该页面暂无组件内容
                </div>
              )}
            </div>
            <PropertyPanel />
          </div>
        )}
      </div>
    </div>
  );
}

