import { useCallback } from 'react';
import { VisualEditor } from '@lego/editor';
import { Button, Message } from '@arco-design/web-react';
import { useEditorStore } from '@lego/core/src/store/editorStore';
import { savePage } from '../../services/pageApi';

export default function Editor() {
  const { components } = useEditorStore();

  const handleSave = useCallback(async () => {
    if (!components.length) {
      Message.warning('请先将组件拖入画布');
      return;
    }

    try {
      const savedPage = await savePage({
        name: `页面 ${new Date().toLocaleString()}`,
        components,
      });
      const pageUrl = `${window.location.origin}/page/${savedPage.id}`;
      navigator.clipboard?.writeText(pageUrl).catch(() => undefined);
      Message.success(`保存成功，页面ID：${savedPage.id}`);
    } catch (error) {
      Message.error(error instanceof Error ? error.message : '保存失败');
    }
  }, [components]);

  return (
    <div style={{ height: 'calc(100vh - 92px)', background: '--color-bg-2', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '5px 10px', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <Button onClick={handleSave} type='primary' size='mini'>保存</Button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <VisualEditor />
      </div>
    </div>
  );
}