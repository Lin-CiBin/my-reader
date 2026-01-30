"use client";
import { useRef, useState } from 'react';
import { ReactReader } from 'react-reader';

interface Props {
  data?: ArrayBuffer;
}

export default function EpubViewer({ data }: Props) {
  const [location, setLocation] = useState<string | number>(0);
  // 使用 useRef 保存 rendition 实例，以便在手势触发时调用翻页方法
  const renditionRef = useRef<any>(null);

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9] text-gray-400">
        正在载入书籍内容...
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <ReactReader
        url={data}
        location={location}
        locationChanged={(cfi: string) => setLocation(cfi)}
        getRendition={(rendition) => {
          renditionRef.current = rendition;

          // --- 滑动翻页逻辑开始 ---
          let touchStartX = 0;
          let touchEndX = 0;

          // 监听 iframe 内部的触摸开始
          rendition.on('touchstart', (event: TouchEvent) => {
            touchStartX = event.changedTouches[0].screenX;
          });

          // 监听 iframe 内部的触摸结束
          rendition.on('touchend', (event: TouchEvent) => {
            touchEndX = event.changedTouches[0].screenX;
            const distance = touchEndX - touchStartX;

            // 设定阈值（例如 50px），防止过于敏感的误触
            if (distance < -50) {
              // 向左滑 -> 下一页
              rendition.next();
            } else if (distance > 50) {
              // 向右滑 -> 上一页
              rendition.prev();
            }
          });
          // --- 滑动翻页逻辑结束 ---
        }}
        epubOptions={{ 
          flow: 'paginated', 
          manager: 'default' 
        }}
      />
    </div>
  );
}