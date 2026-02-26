import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';
import Editor from '../pages/editor';
import PageViewer from '../pages/page';

const Home = lazy(() => import('../pages/home/index'));

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Home />,
      children: [// 嵌套路由
        { index: true, element: <div>欢迎来到首页</div> },
        { path: 'lego/editor', element: <Editor /> },
        { path: 'b', element: <div>bbbb</div> },
      ],
    },
    {
      path: 'page/:pageId',
      element: <PageViewer />,
    }
  ]);
}