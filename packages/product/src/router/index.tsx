import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';
// import Flow from '../pages/flow';

const Home = lazy(() => import('../pages/home/index'));

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Home />,
      children: [// 嵌套路由
        // { path: '/flow', element: <Flow /> },
        { path: 'b', element: <div>bbbb</div> },
      ],
    },
  ]);
}