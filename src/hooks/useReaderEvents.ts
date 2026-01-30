// hooks/useReaderEvents.ts
import { useEffect } from "react";
export const useReaderEvents = (renditionRef: any, resolvedTheme: string) => {
  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition) return;
    
    // --- 手势监听逻辑 ---
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => { startX = e.changedTouches[0].screenX; };
    const handleTouchEnd = (e: TouchEvent) => {
      const distance = e.changedTouches[0].screenX - startX;
      if (distance < -50) rendition.next();
      else if (distance > 50) rendition.prev();
    };

    // 绑定事件
    rendition.on('touchstart', handleTouchStart);
    rendition.on('touchend', handleTouchEnd);

    return () => {
      rendition.off('touchstart', handleTouchStart);
      rendition.off('touchend', handleTouchEnd);
    };
  }, [resolvedTheme, renditionRef.current]); // 依赖主题变化
};