"use client";
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import ePub from 'epubjs';
import { BookText, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LibraryPage() {
  // 控制“主页（导入）”和“书库（展示）”的视图切换
  const [activeTab, setActiveTab] = useState<'home' | 'library'>('home');
  
  // 实时监听数据库中的所有书籍
  const allBooks = useLiveQuery(() => db.books.toArray()) || [];

  // 核心功能：导入并过滤重复书籍
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. 生成待查书名
    const bookTitle = file.name.replace('.epub', '');

    // 2. 过滤逻辑：在数据库中按标题查找
    // db.books 已经在 lib/db.ts 中为 title 建立了索引
    const isDuplicate = await db.books.where('title').equals(bookTitle).first();
    
    if (isDuplicate) {
      alert(`书籍《${bookTitle}》已在书库中，无需重复导入。`);
      // 重置 input 以便下次选择同一文件也能触发 change
      e.target.value = '';
      return; 
    }

    // 3. 解析书籍数据
    const buffer = await file.arrayBuffer();
    const bookInstance = ePub(buffer);
    
    // 4. 提取封面图片路径
    let coverData = '';
    try {
      const coverUrl = await bookInstance.coverUrl();
      if (coverUrl) coverData = coverUrl;
    } catch (err) {
      console.error("封面解析失败", err);
    }

    // 5. 存入本地数据库
    await db.books.add({
      title: bookTitle,
      data: buffer,
      cover: coverData,
      format: 'epub',
      category: 'local'
    });
    
    // 6. 成功后自动切换到书库视图展示
    setActiveTab('library');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9] text-gray-900">
      {/* 顶部标题栏 */}
      <header className="p-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeTab === 'home' ? '导入' : '书库'}
        </h1>
        <div className="flex gap-3">
          <button className="p-2 bg-white shadow-sm rounded-full border border-gray-100">
            <BookText size={20} />
          </button>
          <button className="p-2 bg-white shadow-sm rounded-full border border-gray-100">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-32">
        {activeTab === 'home' ? (
          /* 视图 A: 导入页面 (对应你的 image_3375bb.png) */
          <div className="flex flex-col items-center pt-10 animate-in fade-in duration-500">
            <label className="w-48 h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-white transition-all group shadow-sm">
              <Plus size={40} className="text-gray-300 group-hover:text-black transition-colors" />
              <span className="mt-4 text-[10px] text-gray-400 font-serif tracking-widest uppercase">导入 EPUB</span>
              <input type="file" accept=".epub" className="hidden" onChange={handleImport} />
            </label>
            <div className="mt-10 text-center text-[10px] text-gray-400 tracking-widest space-y-2 uppercase">
              <p>{allBooks.length} 本书</p>
              <p>持久化存储：已就绪</p>
            </div>
          </div>
        ) : (
          /* 视图 B: 书库页面 (对应你的 d0fcedf895cd39c4ecf53ec3d8c89bcb.jpg) */
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 animate-in slide-in-from-bottom-4 duration-500">
            {allBooks.map((book) => (
              <div key={book.id} className="relative group">
                <Link href={`/reader?id=${book.id}`}>
                  <div className="aspect-[3/4] bg-white rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center overflow-hidden active:scale-95 transition-transform">
                    {book.cover ? (
                      <img src={book.cover} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="font-serif text-xs text-center p-4 leading-relaxed">
                        {book.title}
                      </span>
                    )}
                  </div>
                </Link>
                {/* 删除功能 */}
                <button 
                  onClick={() => db.books.delete(book.id!)}
                  className="absolute -top-2 -right-2 bg-black text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 size={12} />
                </button>
                <p className="mt-3 text-[10px] text-gray-400 truncate tracking-tight uppercase italic font-serif text-center">
                  {book.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 w-full h-24 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center pb-6 z-50">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-black' : 'text-gray-300'}`}
        >
          <Plus size={26} />
          <span className="text-[10px] font-medium tracking-tighter">主页</span>
        </button>
        <button 
          onClick={() => setActiveTab('library')} 
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'library' ? 'text-black' : 'text-gray-300'}`}
        >
          <BookText size={26} />
          <span className="text-[10px] font-medium tracking-tighter">书库</span>
        </button>

        {/* 悬浮搜索按钮 */}
        <div className="absolute right-8 bottom-28 p-4 bg-white shadow-[0_15px_35px_rgba(0,0,0,0.12)] rounded-full border border-gray-50 active:scale-90 transition-transform cursor-pointer">
          <Search size={22} className="text-gray-800" />
        </div>
      </nav>
    </div>
  );
}