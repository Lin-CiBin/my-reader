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
        swipeable={true}
        getRendition={(rendition) => {
          renditionRef.current = rendition;
        
          let startX = 0;
          let isMouseDown = false; // 标记鼠标是否按下
        
          // --- 处理逻辑：判断方向并翻页 ---
          const handleEnd = (endX: number) => {
            const distance = endX - startX;
            if (distance < -50) rendition.next();
            else if (distance > 50) rendition.prev();
          };
        
          // 1. 兼容移动端触摸
          rendition.on('touchstart', (e: TouchEvent) => {
            startX = e.changedTouches[0].screenX;
          });
          rendition.on('touchend', (e: TouchEvent) => {
            handleEnd(e.changedTouches[0].screenX);
          });
        
          // // 2. 兼容电脑端鼠标拖动
          // rendition.on('mousedown', (e: MouseEvent) => {
          //   startX = e.screenX;
          //   isMouseDown = true;
          // });
        
          // rendition.on('mouseup', (e: MouseEvent) => {
          //   if (isMouseDown) {
          //     handleEnd(e.screenX);
          //     isMouseDown = false;
          //   }
          // });
        
          // // 兜底：如果鼠标移出书籍区域，重置状态
          // rendition.on('mouseleave', () => {
          //   isMouseDown = false;
          // });
        }}
        epubOptions={{ 
          flow: 'paginated', 
          manager: 'default' 
        }}
      />
    </div>
  );
}