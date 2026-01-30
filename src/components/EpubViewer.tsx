"use client";
import { useAppTheme } from '@/context/ThemeContext';
import { useReaderEvents } from "@/hooks/useReaderEvents";
import { useReaderTheme } from '@/hooks/useReaderTheme';
import { db } from '@/lib/db'; // 1. 引入数据库实例
import { useEffect, useRef, useState } from 'react';
import { ReactReader, ReactReaderStyle } from 'react-reader';
interface Props {
  data?: ArrayBuffer;
  bookId: number;           // 2. 新增：必须传入 ID 才知道存给谁
  initialLocation?: string; // 3. 新增：传入上次读取的位置
}

const getReaderStyles = (isDark: boolean) => ({
  ...ReactReaderStyle,
  container: {
    ...ReactReaderStyle.container,
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    transition: 'background-color 0.5s',
  },
  readerArea: {
    ...ReactReaderStyle.readerArea,
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    transition: 'background-color 0.5s',
  },
});
export default function EpubViewer({ data, bookId, initialLocation }: Props) {
  // 初始化位置为传入的 initialLocation 或 0
  const [location, setLocation] = useState<string | number>(initialLocation || 0);
  const renditionRef = useRef<any>(null);
  const { resolvedTheme } = useAppTheme(); // 获取当前视觉主题
  // 使用 Hook 监听 resolvedTheme 并操作电子书内部样式
  useReaderTheme(renditionRef);
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
  useReaderEvents(renditionRef, resolvedTheme);
  return (
    <div className={"h-screen w-full overflow-hidden"}>
     <ReactReader
        url={data}
        location={location}
        locationChanged={handleLocationChanged}
        swipeable={true}
        readerStyles={ getReaderStyles(resolvedTheme === 'dark') }
        getRendition={(rendition) => {
          renditionRef.current = rendition;
          // 💡 关键：当 rendition 第一次加载时，强制注入当前主题
          const isDark = resolvedTheme === 'dark';
          rendition.themes.register('custom', {
            body: {
              'color': `${isDark ? '#8f8f8f' : '#333333'} !important`,
            }
          });
          rendition.themes.select('custom');
        }}
        epubOptions={{ flow: 'paginated', manager: 'default' }}
      />
    </div>
  );
}