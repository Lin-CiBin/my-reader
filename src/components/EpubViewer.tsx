"use client";
import { useState } from 'react';
import { ReactReader } from 'react-reader';

interface Props {
  data?: ArrayBuffer; 
}

export default function EpubViewer({ data }: Props) {
  const [location, setLocation] = useState<string | number>(0);

  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9] text-gray-400">
        正在载入书籍内容...
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <ReactReader
        url={data}
        location={location}
        locationChanged={(cfi: string) => setLocation(cfi)}
        epubOptions={{ flow: 'paginated', manager: 'default' }}
      />
    </div>
  );
}