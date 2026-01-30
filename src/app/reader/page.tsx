"use client";
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const EpubViewer = dynamic(() => import('@/components/EpubViewer'), { ssr: false });

function ReaderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [bookData, setBookData] = useState<ArrayBuffer | undefined>(undefined);
  // 新增：保存从数据库拿到的初始阅读位置
  const [initialLocation, setInitialLocation] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id) {
      // 依然监听 id，因为 id 变了就得重新加载书的内容
      db.books.get(Number(id)).then(book => {
        if (book) {
          setBookData(book.data);
          // 新增：从书籍对象中提取上次保存的 CFI 位置
          setInitialLocation(book.lastLocation);
        }
      });
    }
  }, [id]);

  return (
    <div className="h-screen w-full relative">
      <button 
        onClick={() => window.history.back()}
        className="absolute top-3 right-6 z-50 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-xs font-medium text-gray-600 active:scale-95 transition-transform"
      >
        退出阅读
      </button>

      {/* 修改：
          1. 传入 data
          2. 传入 bookId (转为数字)，用于 EpubViewer 内部执行 db.update
          3. 传入 initialLocation，用于初始化阅读位置
          4. key={id} 确保切换不同书籍时，组件能彻底重置
      */}
      <EpubViewer 
        key={id} 
        data={bookData} 
        bookId={Number(id)} 
        initialLocation={initialLocation} 
      />
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#F9F9F9] text-gray-400">正在开启书卷...</div>}>
      <ReaderContent />
    </Suspense>
  );
}