import { Outlet, useNavigate } from 'react-router-dom';
import { Menu } from '@arco-design/web-react';
import { IconApps } from '@arco-design/web-react/icon';
import {
  Layout,
  Card,
} from '@arco-design/web-react';
import HeaderBox from './HeaderBox';
import styles from './index.module.scss';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout className='layout-basic-demo'>
      <HeaderBox />
      <div className='flexWrapper'>
        <div className='menu-demo' style={{ height: 'calc(100vh - 60px)' }}>
          <Menu
            style={{ width: 200, height: 'calc(100vh - 60px)' }}
            hasCollapseButton
            defaultOpenKeys={['0']}
            defaultSelectedKeys={['flow']}
            onClickMenuItem={(key) => {
              navigate(key);
            }}
          >
            <SubMenu
              key='0'
              title={
                <>
                  <IconApps /> Navigation
                </>
              }
            >
              <MenuItem key='flow'>Flow1</MenuItem>
            </SubMenu>
          </Menu>
        </div>
        <Card
          className={styles.card_wrapper}
          bordered={false}
        >
          <Outlet />
        </Card>
      </div>
    </Layout>
  )
}
