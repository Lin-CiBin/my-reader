import { useAppTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
export const useReaderTheme = (renditionRef: React.RefObject<any>) => {
  const { resolvedTheme } = useAppTheme();

  useEffect(() => {
    if (renditionRef.current) {
      const rendition = renditionRef.current;
      const themeStyles = resolvedTheme === 'dark' ? {
        body: { 'color': '#8f8f8f !important' }
      } : {
        body: { 'color': '#333333 !important' }
      };

      rendition.themes.register('current', themeStyles);
      rendition.themes.select('current');
    }
  }, [resolvedTheme, renditionRef]); // 监听最终生效的主题

  return { resolvedTheme };
};