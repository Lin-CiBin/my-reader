"use client";
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import ePub from 'epubjs';
import { BookText, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'library'>('home');
  const allBooks = useLiveQuery(() => db.books.toArray()) || [];

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const bookInstance = ePub(buffer);
    
    // 提取封面图
    let coverData = '';
    try {
      const coverUrl = await bookInstance.coverUrl();
      if (coverUrl) coverData = coverUrl;
    } catch (e) { console.error("封面解析失败"); }

    await db.books.add({
      title: file.name.replace('.epub', ''),
      data: buffer,
      cover: coverData,
      format: 'epub',
      category: 'local'
    });
    setActiveTab('library');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9]">
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">书库</h1>
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded-full shadow-sm border"><BookText size={20} /></button>
          <button className="p-2 bg-white rounded-full shadow-sm border"><MoreHorizontal size={20} /></button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-32">
        {activeTab === 'home' ? (
          <div className="flex flex-col items-center pt-10">
            <label className="w-44 h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all group">
              <Plus size={40} className="text-gray-300 group-hover:text-black" />
              <span className="mt-4 text-xs text-gray-400">导入 EPUB</span>
              <input type="file" accept=".epub" className="hidden" onChange={handleImport} />
            </label>
            <p className="mt-8 text-xs text-gray-400">{allBooks.length} 本书</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {allBooks.map(book => (
              <div key={book.id} className="relative group animate-in fade-in zoom-in duration-300">
                <Link href={`/reader?id=${book.id}`}>
                  <div className="aspect-[3/4] bg-white rounded shadow-md overflow-hidden border border-gray-100 active:scale-95 transition-transform flex items-center justify-center">
                    {book.cover ? (
                      <img src={book.cover} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-xs text-gray-400 p-2 text-center">{book.title}</span>
                    )}
                  </div>
                </Link>
                <button 
                  onClick={() => db.books.delete(book.id!)}
                  className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
                <p className="mt-2 text-[10px] text-gray-400 truncate">{book.title}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full h-24 bg-white/80 backdrop-blur-md border-t flex justify-around items-center pb-6 z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-black' : 'text-gray-300'}`}>
          <Plus size={26} /><span className="text-[10px]">主页</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-black' : 'text-gray-300'}`}>
          <BookText size={26} /><span className="text-[10px]">书库</span>
        </button>
        <div className="absolute right-8 bottom-28 p-4 bg-white shadow-xl rounded-full border border-gray-50"><Search size={22} /></div>
      </nav>
    </div>
  );
}