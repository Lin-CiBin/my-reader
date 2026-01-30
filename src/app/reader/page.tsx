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

  useEffect(() => {
    if (id) {
      db.books.get(Number(id)).then(book => {
        if (book) setBookData(book.data);
      });
    }
  }, [id]);

  return (
    <div className="h-screen w-full relative">
      <button 
        onClick={() => window.history.back()}
        className="absolute top-10 left-6 z-50 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-xs"
      >
        退出阅读
      </button>
      <EpubViewer data={bookData} />
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">加载中...</div>}>
      <ReaderContent />
    </Suspense>
  );
}