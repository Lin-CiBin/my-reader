"use client";
import { useAppTheme } from '@/context/ThemeContext';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Sun, Moon, Monitor, X, MoreHorizontal } from 'lucide-react'; // 引入 MoreHorizontal

const EpubViewer = dynamic(() => import('@/components/EpubViewer'), { ssr: false });

function ReaderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [bookData, setBookData] = useState<ArrayBuffer | undefined>(undefined);
  const [initialLocation, setInitialLocation] = useState<string | undefined>(undefined);
  
  // 控制菜单展开状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { mode, setMode } = useAppTheme();

  useEffect(() => {
    if (id) {
      db.books.get(Number(id)).then(book => {
        if (book) {
          setBookData(book.data);
          setInitialLocation(book.lastLocation);
        }
      });
    }
  }, [id]);

  return (
    <div className="h-screen w-full relative transition-colors duration-500 overflow-hidden">

      {/* --- 右下角悬浮控制器 --- */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col-reverse items-center gap-4">
        
        {/* 1. 主触发按钮：三个点的圆形玻璃 */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`
            w-14 h-14 flex items-center justify-center rounded-full
            bg-white/40 dark:bg-white/10 backdrop-blur-2xl backdrop-saturate-150
            border border-white/40 dark:border-white/10
            shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]
            transition-all duration-300 active:scale-90
            ${isMenuOpen ? 'rotate-90' : 'rotate-0'}
          `}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-800 dark:text-white" />
          ) : (
            <MoreHorizontal className="w-6 h-6 text-gray-800 dark:text-white" />
          )}
        </button>

        {/* 2. 垂直弹出的菜单主体 */}
        <div className={`
          flex flex-col gap-3 p-2 rounded-full
          bg-white/40 dark:bg-white/10 backdrop-blur-2xl
          border border-white/40 dark:border-white/10
          shadow-2xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          origin-bottom /* 从底部向上生长 */
          ${isMenuOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}
        `}>
          {[
            { id: 'light', icon: <Sun className="h-5 w-5" /> },
            { id: 'dark', icon: <Moon className="h-5 w-5" /> },
            { id: 'system', icon: <Monitor className="h-5 w-5" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setMode(item.id as any);
                setIsMenuOpen(false); // 选中后自动收起
              }}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                ${mode === item.id
                  ? 'bg-white/90 dark:bg-white/20 text-blue-500 dark:text-blue-400 shadow-sm scale-110'
                  : 'text-gray-800/70 dark:text-white/60 hover:bg-white/40 dark:hover:bg-white/10'
                }
                active:scale-90
              `}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* --- 退出按钮 (左上角或保持右上角) --- */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-3 right-3 z-50 w-11 h-11 flex items-center justify-center rounded-full
                   bg-white/40 dark:bg-black/20 backdrop-blur-2xl backdrop-saturate-150
                   border border-white/40 dark:border-white/10
                   shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
                   transition-all duration-500 hover:scale-105 active:scale-90"
      >
        <X className="w-5 h-5 text-gray-800 dark:text-white/90" strokeWidth={2.5} />
      </button>

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