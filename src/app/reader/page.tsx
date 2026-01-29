"use client";
import { useState } from 'react';
import { ReactReader } from 'react-reader';

interface Props {
  // 在 data 后面加个问号，表示这个属性可以不传，或者可以是 undefined
  data?: ArrayBuffer; 
}

const EpubViewer = ({ data }: Props) => {
  const [location, setLocation] = useState<string | number>(0);

  // 增加一个保护判断：如果没有数据，就显示加载中
  // 这样既解决了 TS 报错，也提升了用户体验，符合截图的极简审美
  if (!data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white text-gray-400">
        <p className="animate-pulse">正在准备书卷...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white">
      <ReactReader
        url={data}
        location={location}
        locationChanged={(cfi: string) => setLocation(cfi)}
        epubOptions={{
          flow: 'paginated', // 像纸质书一样分页
          manager: 'default',
        }}
      />
    </div>
  );
};

export default EpubViewer;