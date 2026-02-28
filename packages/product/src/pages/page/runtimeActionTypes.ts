export type SubmitFormAction = {
  type: 'submitForm';
  formScope?: 'closest';
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    // 兼容旧字段 body: 'formValues'
    bodySource?: 'formValues';
    body?: 'formValues';
  };
  successMessage?: string;
  errorMessage?: string;
};

export type RequestAction = {
  type: 'request';
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    bodySource?: 'none' | 'formValues' | 'staticJson';
    bodyJson?: string;
    validate?: boolean; // 当 bodySource=formValues 时可选
  };
  successMessage?: string;
  errorMessage?: string;
};

export type NavigateAction = {
  type: 'navigate';
  to?: string;
  target?: '_self' | '_blank';
  replace?: boolean;
};

export type CopyAction = {
  type: 'copy';
  textSource?: 'static' | 'formValuesJson';
  text?: string;
  successMessage?: string;
  errorMessage?: string;
};

export type LogFormValuesAction = {
  type: 'logFormValues';
};

export type ExpressionValue = {
  type: 'expression';
  value: string;
  directive?: unknown;
  ignoreValidationExpression?: boolean;
};

export type CopyDataAction = {
  type: 'copyData';
  value?: {
    text?: string | ExpressionValue;
    toastText?: string;
  };
  successMessage?: string;
  errorMessage?: string;
};

export type PostDataAction = {
  type: 'postData';
  value?: {
    // 兼容你的 schema：优先 url，其次 path
    url?: string;
    path?: string;
    method?: string;
    headers?: Record<string, string>;
    bodySource?: 'none' | 'formValues' | 'staticJson';
    bodyJson?: string;
    body?: unknown | ExpressionValue;
    params?: unknown | ExpressionValue;
    toastText?: string;
  };
  successMessage?: string;
  errorMessage?: string;
};

export type UpdatePropsAction = {
  type: 'updateProps';
  value?: {
    id?: string;
    props?: Record<string, unknown>;
    payload?: Record<string, unknown>; // alias: 直接 payload 合并到 props
    propsJson?: string; // 允许用字符串 JSON 快速配置
  };
  successMessage?: string;
  errorMessage?: string;
};

export type ButtonAction =
  | SubmitFormAction
  | RequestAction
  | NavigateAction
  | CopyAction
  | LogFormValuesAction
  | CopyDataAction
  | PostDataAction
  | UpdatePropsAction;

export type RuntimeEventName = 'onClick' | 'onChange';

export type RuntimeEvents = Partial<Record<RuntimeEventName, ButtonAction[]>>;

