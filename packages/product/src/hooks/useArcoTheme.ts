import { useEffect, useState } from 'react';

export default function useArcoTheme() {
  const [isDark, setIsDark] = useState(
    () => document.body.hasAttribute('arco-theme')
  );

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.body.hasAttribute('arco-theme'))
    );
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDark;
}