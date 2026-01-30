"use client";
import { useAppTheme } from '@/context/ThemeContext';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Sun, Moon, Monitor, X } from 'lucide-react';

const EpubViewer = dynamic(() => import('@/components/EpubViewer'), { ssr: false });

function ReaderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [bookData, setBookData] = useState<ArrayBuffer | undefined>(undefined);
  // 新增：保存从数据库拿到的初始阅读位置
  const [initialLocation, setInitialLocation] = useState<string | undefined>(undefined);

  // 1. 从 Context 中取出“共享字段”和“修改方法”
  const { mode, setMode } = useAppTheme();

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
    <div className="h-screen w-full relative transition-colors duration-500 overflow-hidden">

      {/* --- 悬浮触发的主题控制器 --- */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center group">

        {/* 1. 提示柄 (Handle)：微小的侧边指示器 */}
        <div className="w-1.5 h-12 bg-white/40 dark:bg-white/10 backdrop-blur-md 
                  rounded-l-full cursor-pointer shadow-sm absolute right-0
                  group-hover:opacity-0 transition-all duration-300"
        />

        {/* 2. 隐藏的菜单主体 */}
        <div className="
          flex flex-col gap-3 p-2.5 
          /* iOS 核心：高饱和度、强模糊、半透明白 */
          bg-white/40 dark:bg-white/10 
          backdrop-blur-2xl backdrop-saturate-150
          
          /* 物理边缘感：外高光边框 */
          border border-white/40 dark:border-white/10 border-r-0
          rounded-l-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]
          
          /* 动画控制 */
          translate-x-full group-hover:translate-x-0 
          transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) /* 稍微带一点弹性回弹 */
        ">

          {/* 精致的小标题 */}
          <div className="text-[10px] text-center text-gray-800/60 dark:text-white/40 font-bold mb-1 
                    opacity-0 group-hover:opacity-100 transition-opacity delay-300 tracking-widest">
            THEME
          </div>

          {[
            { id: 'light', icon: <Sun className="h-4 w-4" /> },
            { id: 'dark', icon: <Moon className="h-4 w-4" /> },
            { id: 'system', icon: <Monitor className="h-4 w-4" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as any)}
              className={`
          w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300
          ${mode === item.id
                  ? 'bg-white/90 dark:bg-white/20 text-black dark:text-white shadow-sm scale-105'
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

      {/* --- 退出按钮 (可保持原样或也做隐藏处理) --- */}
      <button
        onClick={() => window.history.back()}
        className="
        /* 基础定位 */
        absolute top-6 right-6 z-50 w-11 h-11 
        flex items-center justify-center rounded-full
        
        /* iOS 核心：高饱和度毛玻璃 */
        /* 使用 white/40 提供基础底色，saturate 增加背景色彩的鲜艳度 */
        bg-white/40 dark:bg-black/20 
        backdrop-blur-2xl backdrop-saturate-150
        
        /* 物理边缘感：外发光边框 */
        border border-white/40 dark:border-white/10
        
        /* 阴影：柔和的扩散阴影，模拟物体悬浮 */
        shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
        
        /* 动画与过渡 */
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        
        /* Hover 状态：iOS 风格的微扩增 */
        hover:scale-105 hover:bg-white/50 dark:hover:bg-white/10
        
        /* After 伪元素：模拟玻璃表面的高光 */
        after:content-[''] after:absolute after:inset-0 after:rounded-full
        after:bg-gradient-to-br after:from-white/30 after:to-transparent after:opacity-0
        hover:after:opacity-100 after:transition-opacity after:duration-500
        
        /* Active 状态：压感反馈 */
        active:scale-90 active:duration-150
      "
      >
        <X className="w-5 h-5 text-gray-800 dark:text-white/90 relative z-10" strokeWidth={2.5} />
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