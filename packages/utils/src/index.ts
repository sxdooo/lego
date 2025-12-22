export * from './types';
export * from './constants';

// 生成唯一ID
export const generateId = (): string => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 深度克隆
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// 判断是否为容器组件
export const isContainerComponent = (componentType: string): boolean => {
  return ['Form', 'Container'].includes(componentType);
};