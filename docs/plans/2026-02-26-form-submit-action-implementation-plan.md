# 表单数据绑定 + Submit Action Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在运行态预览（`RuntimePreview`）中支持多个 Form 的数据绑定与提交：字段组件（Input/Select/Textarea）绑定到其所在 Form 的 `values[name]`；Button 组件触发 `submitForm` action，提交整表单 values；支持 required 校验与同一 Form 内 name 唯一校验；URL 支持相对路径自动拼 `VITE_API_BASE` 或完整 URL 直用。

**Architecture:** 运行态能力先只落在 `packages/product/src/pages/page/RuntimePreview.tsx`。引入 `FormRuntimeContext`（React Context）作为 Form 子树作用域；字段组件注册 field meta 并读写 values；Button 在同一作用域内执行校验与 fetch。校验与 URL 解析抽成纯函数并用 vitest 做单测。

**Tech Stack:** React + TypeScript；Arco Input/Switch/Button；fetch；vitest（新增）。

---

### Task 1: 加入 vitest 并写纯函数单测（TDD）

**Files:**
- Modify: `packages/product/package.json`
- Create: `packages/product/src/pages/page/runtimeFormLogic.ts`
- Create: `packages/product/src/pages/page/runtimeFormLogic.test.ts`

**Step 1: 写 failing tests（RED）**
- `resolveRequestUrl`：相对/绝对 URL 行为
- `validateForm`：required + name 唯一 + 返回第一条错误

**Step 2: 跑测试确认失败**
- Run: `pnpm --filter product test`

**Step 3: 写最小实现（GREEN）**
- 仅实现测试要求

**Step 4: 跑测试确认通过**

---

### Task 2: 新增 Button 组件到物料与渲染器（编辑态）

**Files:**
- Modify: `packages/utils/src/constants.ts`
- Modify: `packages/components/src/materials/index.ts`
- Create: `packages/components/src/renderers/Button/material.ts`
- Create: `packages/components/src/renderers/Button/Renderer.tsx`
- Create: `packages/components/src/renderers/Button/PropertyPanel.tsx`
- Modify: `packages/components/src/ComponentRenderer.tsx`
- Modify: `packages/components/src/componentRegistry.ts`

**Step 1: 增加 COMPONENT_TYPES.BUTTON**

**Step 2: 增加 buttonMaterial 并加入 materials 列表**

**Step 3: Renderer（编辑态）**
- 使用 Arco `Button`
- 保持与现有组件一致：点击可选中（通过外层 `ComponentRenderer` 已处理）

**Step 4: PropertyPanel**
- 支持编辑 `text/method/url/successMessage/errorMessage`

---

### Task 3: 字段组件的绑定配置（编辑态属性面板）

**Files:**
- Modify: `packages/components/src/renderers/Input/PropertyPanel.tsx`
- Modify: `packages/components/src/renderers/Select/PropertyPanel.tsx`
- Modify: `packages/components/src/renderers/Textarea/PropertyPanel.tsx`

**Step 1: 增加字段配置输入**
- `name`（必填提示）
- `required` 开关
- `requiredMessage` 输入
- （可选）`defaultValue`

---

### Task 4: RuntimePreview 引入 FormContext + 提交动作（运行态）

**Files:**
- Modify: `packages/product/src/pages/page/RuntimePreview.tsx`

**Step 1: FormRuntimeContext**
- 以 Form 组件 id 作为 formId
- 维护 `values / fields / errors`

**Step 2: 字段组件运行态**
- 受控绑定到 values[name]
- required 错误时红框（最小：style merge）

**Step 3: Button 运行态提交**
- `validateForm(fields, values)` 不通过：toast 第一条错误
- 通过：拼 URL（相对拼 `VITE_API_BASE`）、fetch 提交

---

### Task 5: 验证

**Commands:**
- `pnpm --filter product test`
- `pnpm --filter product lint`
- `pnpm --filter product build`

**Manual:**
- 一个页面放两个 Form，各自有字段与提交按钮，互不串值
- required 未填阻止提交并提示
- 同一 Form 内 name 重复阻止提交并提示
- 相对/绝对 URL 都能请求（相对拼 `VITE_API_BASE`）

