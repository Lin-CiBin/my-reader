"use client";
import { db } from '@/lib/db'; // 1. 引入数据库实例
import { useEffect, useRef, useState } from 'react';
import { ReactReader } from 'react-reader';

interface Props {
  data?: ArrayBuffer;
  bookId: number;           // 2. 新增：必须传入 ID 才知道存给谁
  initialLocation?: string; // 3. 新增：传入上次读取的位置
}

export default function EpubViewer({ data, bookId, initialLocation }: Props) {
  // 初始化位置为传入的 initialLocation 或 0
  const [location, setLocation] = useState<string | number>(initialLocation || 0);
  const renditionRef = useRef<any>(null);

  // 4. 关键：监听 initialLocation 的变化（处理异步加载）
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  // 5. 修改：位置改变时，不仅更新 state，还要存入 Dexie
  const handleLocationChanged = async (cfi: string) => {
    setLocation(cfi);
    if (bookId) {
      try {
        await db.books.update(bookId, { lastLocation: cfi });
      } catch (err) {
        console.error("保存阅读进度失败:", err);
      }
    }
  };

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
        locationChanged={handleLocationChanged} // 使用新的回调
        swipeable={true}
        getRendition={(rendition) => {
          renditionRef.current = rendition;
        
          let startX = 0;
          const handleEnd = (endX: number) => {
            const distance = endX - startX;
            if (distance < -50) rendition.next();
            else if (distance > 50) rendition.prev();
          };
        
          rendition.on('touchstart', (e: TouchEvent) => {
            startX = e.changedTouches[0].screenX;
          });
          rendition.on('touchend', (e: TouchEvent) => {
            handleEnd(e.changedTouches[0].screenX);
          });
        }}
        epubOptions={{ 
          flow: 'paginated', 
          manager: 'default' 
        }}
      />
    </div>
  );
}