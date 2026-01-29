"use client";
import { useState } from 'react';
import { ReactReader } from 'react-reader';

interface Props {
  data: ArrayBuffer;
}

const EpubViewer = ({ data }: Props) => {
  const [location, setLocation] = useState<string | number>(0);

  return (
    <div style={{ height: '100vh' }}>
      <ReactReader
        url={data}
        location={location}
        locationChanged={(cfi: string) => setLocation(cfi)}
        swipeable={true}
        epubOptions={{
          flow: 'paginated',
          manager: 'default',
        }}
      />
    </div>
  );
};

export default EpubViewer;