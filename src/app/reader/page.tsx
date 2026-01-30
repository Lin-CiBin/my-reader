"use client";
import { useAppTheme } from '@/context/ThemeContext';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Sun, Moon, Monitor, X, MoreHorizontal } from 'lucide-react';

const EpubViewer = dynamic(() => import('@/components/EpubViewer'), { ssr: false });

function ReaderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [bookData, setBookData] = useState<ArrayBuffer | undefined>(undefined);
  const [initialLocation, setInitialLocation] = useState<string | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const { mode, setMode } = useAppTheme();

  // 用于记录触摸起始坐标，判断是点击还是滑动
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

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

  // 核心切换逻辑
  const toggleControls = useCallback(() => {
    setShowControls(prev => {
      if (prev) setIsMenuOpen(false);
      return !prev;
    });
  }, []);

  // --- 触摸事件处理 ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const distX = Math.abs(touch.clientX - touchStartRef.current.x);
    const distY = Math.abs(touch.clientY - touchStartRef.current.y);
    const timeElapsed = Date.now() - touchStartRef.current.time;

    // 如果手指移动距离极小（<10px）且停留时间短（<300ms），判定为点击
    if (distX < 10 && distY < 10 && timeElapsed < 300) {
      // 排除掉点击按钮本身的情况
      if ((e.target as HTMLElement).closest('button')) return;
      toggleControls();
    }
  };

  const glassEffect = `
    bg-white/40 dark:bg-black/20 
    backdrop-blur-2xl backdrop-saturate-150
    border border-white/40 dark:border-white/10
    shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
  `;

  const btnBase = `
    w-11 h-11 flex items-center justify-center rounded-full
    transition-all duration-500 active:scale-90
  `;

  const safeMargin = "right-4";

  const visibilityClass = showControls
    ? "opacity-100 translate-y-0 pointer-events-auto"
    : "opacity-0 translate-y-4 pointer-events-none";

  return (
    <div
      className="h-screen w-full relative transition-colors duration-500 overflow-hidden"
      // 同时绑定鼠标和触摸事件
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        toggleControls();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      {/* --- 右上角：关闭按钮 --- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.history.back();
        }}
        className={`absolute top-4 ${safeMargin} z-50 ${btnBase} ${glassEffect} 
          transition-all duration-500 ${visibilityClass}`}
      >
        <X className="w-5 h-5 text-gray-800 dark:text-white/90" strokeWidth={2.5} />
      </button>

      {/* --- 右下角：悬浮控制器 (FAB) --- */}
      <div className={`fixed bottom-4 ${safeMargin} z-50 flex flex-col-reverse items-center gap-4 
        transition-all duration-500 ${visibilityClass}`}>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`${btnBase} ${glassEffect} ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 text-gray-800 dark:text-white/90" strokeWidth={2.5} />
          ) : (
            <MoreHorizontal className="w-5 h-5 text-gray-800 dark:text-white/90" strokeWidth={2.5} />
          )}
        </button>

        <div className={`
          flex flex-col gap-3 p-1.5 rounded-full
          transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          origin-bottom ${glassEffect}
          ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}
        `}>
          {[
            { id: 'light', icon: Sun },
            { id: 'dark', icon: Moon },
            { id: 'system', icon: Monitor }
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setMode(item.id as any);
                  setIsMenuOpen(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${mode === item.id
                    ? 'bg-white/60 dark:bg-white/20 text-blue-600'
                    : 'text-gray-800/70 dark:text-white/60'
                  } active:scale-90`}
              >
                <IconComponent className="h-5 w-5" strokeWidth={2.5} />
              </button>
            );
          })}
        </div>
      </div>

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