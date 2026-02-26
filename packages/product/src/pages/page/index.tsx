import { Fragment, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@arco-design/web-react';
import { fetchPage, type PageRecord } from '../../services/pageApi';
import { COMPONENT_TYPES } from '@lego/utils';
import type { ComponentNode } from '@lego/utils';

type OptionItem = {
  label?: string;
  value?: string;
};

const renderPreviewComponent = (component: ComponentNode): ReactNode => {
  const props = component.props ?? {};
  const style = props.style ?? {};

  switch (component.type) {
    case COMPONENT_TYPES.TEXT:
      return (
        <div style={style}>
          {props.content ?? '文本内容'}
        </div>
      );
    case COMPONENT_TYPES.INPUT:
      return (
        <Input
          style={style}
          placeholder={props.placeholder ?? '请输入'}
          defaultValue={props.value ?? ''}
        />
      );
    case COMPONENT_TYPES.SELECT: {
      const options = Array.isArray(props.options)
        ? (props.options as OptionItem[])
        : [];
      return (
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
      );
    }
    case COMPONENT_TYPES.TEXTAREA:
      return (
        <textarea
          style={style}
          placeholder={props.placeholder ?? '请输入'}
          rows={props.rows ?? 4}
          defaultValue={props.value ?? ''}
        />
      );
    case COMPONENT_TYPES.CONTAINER:
    case COMPONENT_TYPES.FORM:
      return (
        <div style={style}>
          {component.children?.map((child: ComponentNode) => (
            <Fragment key={child.id}>
              {renderPreviewComponent(child)}
            </Fragment>
          ))}
        </div>
      );
    default:
      return (
        <div style={{ ...style, color: '#999' }}>
          未知组件：{component.type}
        </div>
      );
  }
};

const renderComponentTree = (components: ComponentNode[]) => (
  components.map((component) => (
    <Fragment key={component.id}>
      {renderPreviewComponent(component)}
    </Fragment>
  ))
);

export default function PageViewer() {
  const { pageId } = useParams();
  const [pageInfo, setPageInfo] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!pageId) return;
    setLoading(true);
    setError(undefined);

    fetchPage(pageId)
      .then((data) => setPageInfo(data))
      .catch((err) => setError(err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [pageId]);

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
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{pageInfo.name}</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
            页面ID：{pageInfo.id} · 创建于 {new Date(pageInfo.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '6px',
          minHeight: '300px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        }}
      >
        {pageInfo.components?.length
          ? renderComponentTree(pageInfo.components)
          : (
            <div style={{ textAlign: 'center', color: '#999' }}>
              该页面暂无组件内容
            </div>
          )}
      </div>
    </div>
  );
}

