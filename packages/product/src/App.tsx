import { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from '@arco-design/web-react';
import Router from './router';
import './App.css'

function App() {

  return (
    <ConfigProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Router />
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
