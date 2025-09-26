import { useState, useEffect } from 'react';
import {
  Button,
  Layout,
  Avatar,
  Tooltip,
} from '@arco-design/web-react';
import cn from 'classnames';
import styles from './index.module.scss';

const Header = Layout.Header;

export default function HeaderBox() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 应用主题
    if (isDark) {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }
  }, [isDark]);

  return (
    <Header className={cn(styles.header)}>
      <div className={styles.header_left}>
        <svg width="33" height="33" fill="none"><g clipPath="url(#logo_svg__clip0)" fillRule="evenodd" clipRule="evenodd"><path d="M5.378 16.98l7.372-7.55a5.096 5.096 0 017.292 0l.08.082a5.226 5.226 0 010 7.303l-7.372 7.55a5.096 5.096 0 01-7.292 0l-.08-.083a5.226 5.226 0 010-7.302z" fill="#12D2AC"></path><path d="M20.048 9.43l7.292 7.467a5.344 5.344 0 010 7.467 5.096 5.096 0 01-7.292 0l-7.292-7.467a5.344 5.344 0 010-7.467 5.096 5.096 0 017.292 0z" fill="#307AF2"></path><path d="M20.132 9.522l3.553 3.638-7.292 7.467-7.292-7.467 3.553-3.638a5.226 5.226 0 017.478 0z" fill="#0057FE"></path></g><defs><clipPath id="logo_svg__clip0"><path fill="#fff" transform="translate(3.5 7)" d="M0 0h26v19H0z"></path></clipPath></defs></svg>
      </div>
      <div className={styles.header_right}>
        <Button
          onClick={() => {
            setIsDark(!isDark);
          }}
          className={cn(styles.theme_icon)}
        >
          {
            !isDark ?
              <Tooltip content='切换为暗黑模式'>
                <svg fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 48 48" width="1em" height="1em" className={cn(styles.theme_icon_svg, "arco-icon arco-icon-moon-fill")}><path fill="currentColor" stroke="none" d="M42.108 29.769c.124-.387-.258-.736-.645-.613A17.99 17.99 0 0 1 36 30c-9.941 0-18-8.059-18-18 0-1.904.296-3.74.844-5.463.123-.387-.226-.768-.613-.645C10.558 8.334 5 15.518 5 24c0 10.493 8.507 19 19 19 8.482 0 15.666-5.558 18.108-13.231Z"></path></svg>
              </Tooltip>
              :
              <Tooltip content='切换为亮色模式'>
                <svg fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 48 48" width="1em" height="1em" className={cn(styles.theme_icon_svg, "arco-icon arco-icon-sun-fill")}><circle cx="24" cy="24" r="9" fill="currentColor" stroke="none"></circle><path fill="currentColor" stroke="none" d="M21 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM21 37.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5ZM42.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM10.5 21a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-5a.5.5 0 0 1 .5-.5h5ZM39.203 34.96a.5.5 0 0 1 0 .707l-3.536 3.536a.5.5 0 0 1-.707 0l-3.535-3.536a.5.5 0 0 1 0-.707l3.535-3.535a.5.5 0 0 1 .707 0l3.536 3.535ZM16.575 12.333a.5.5 0 0 1 0 .707l-3.535 3.535a.5.5 0 0 1-.707 0L8.797 13.04a.5.5 0 0 1 0-.707l3.536-3.536a.5.5 0 0 1 .707 0l3.535 3.536ZM13.04 39.203a.5.5 0 0 1-.707 0l-3.536-3.536a.5.5 0 0 1 0-.707l3.536-3.535a.5.5 0 0 1 .707 0l3.536 3.535a.5.5 0 0 1 0 .707l-3.536 3.536ZM35.668 16.575a.5.5 0 0 1-.708 0l-3.535-3.535a.5.5 0 0 1 0-.707l3.535-3.536a.5.5 0 0 1 .708 0l3.535 3.536a.5.5 0 0 1 0 .707l-3.535 3.535Z"></path></svg>
              </Tooltip>
          }
        </Button>
        <Avatar size={32} className={styles.avatar_icon}>
          <img
            alt='avatar'
            src='//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp'
          />
        </Avatar>
      </div>
    </Header>
  )
}
