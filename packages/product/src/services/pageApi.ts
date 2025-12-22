import type { ComponentNode } from '@lego/utils';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const ensureSuccess = async (response: Response) => {
  if (response.ok) {
    return response;
  }
  const text = await response.text();
  throw new Error(text || response.statusText || '请求失败');
};

export interface SavePagePayload {
  name?: string;
  components: ComponentNode[];
}

export interface PageRecord {
  id: string;
  name: string;
  components: ComponentNode[];
  createdAt: string;
}

export const savePage = async (payload: SavePagePayload): Promise<PageRecord> => {
  const response = await fetch(`${API_BASE}/api/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  await ensureSuccess(response);
  return response.json();
};

export const fetchPage = async (pageId: string): Promise<PageRecord> => {
  const response = await fetch(`${API_BASE}/api/pages/${pageId}`);
  await ensureSuccess(response);
  return response.json();
};

