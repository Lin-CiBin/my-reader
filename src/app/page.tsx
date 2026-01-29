"use client";
import { BookText, MoreHorizontal, Plus, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// 关键：动态导入阅读器，禁用服务端渲染
const EpubViewer = dynamic(() => import('@/components/EpubViewer'), { ssr: false });

export default function Library() {
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setFileData(ev.target?.result as ArrayBuffer);
      reader.readAsArrayBuffer(file);
    }
  };

  if (fileData) {
    return (
      <div className="relative h-screen w-full bg-white">
        <button 
          onClick={() => setFileData(null)}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/80 backdrop-blur rounded-full border shadow-sm text-sm"
        >
          返回书库
        </button>
        <EpubViewer data={fileData} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col font-sans">
      {/* 顶部状态栏占位 & 标题 */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">书库</h1>
        <div className="flex gap-3">
          <button className="p-2 bg-gray-100 rounded-full"><BookText size={20} /></button>
          <button className="p-2 bg-gray-100 rounded-full"><MoreHorizontal size={20} /></button>
        </div>
      </header>

      {/* 书架区域 */}
      <main className="flex-1 px-6 pt-10 flex flex-col items-center">
        <label className="group relative w-44 h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors">
          <Plus size={40} className="text-gray-300 group-hover:text-black" />
          <span className="mt-4 text-xs text-gray-400">导入 EPUB</span>
          <input type="file" accept=".epub" className="hidden" onChange={handleFile} />
        </label>
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>1 本书</p>
          <p className="mt-1">正在导入：1/1。失败：0</p>
        </div>
      </main>

      {/* 底部导航 */}
      <nav className="h-24 border-t flex justify-around items-center px-10 pb-6">
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <Plus size={24} /> <span className="text-[10px]">主页</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-black">
          <BookText size={24} /> <span className="text-[10px]">书库</span>
        </div>
        <div className="absolute right-8 bottom-28 p-4 bg-gray-100 rounded-full shadow-lg">
          <Search size={24} />
        </div>
      </nav>
    </div>
  );
}