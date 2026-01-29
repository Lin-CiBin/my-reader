import Dexie, { type Table } from 'dexie';

export interface Book {
  id?: number;
  title: string;
  data: ArrayBuffer;
  cover?: string; // 存储封面图片数据
  format: string;
  category: string;
}

export class MyDatabase extends Dexie {
  books!: Table<Book>;
  constructor() {
    super('ReaderDB');
    this.version(1).stores({
      books: '++id, title, category'
    });
  }
}

export const db = new MyDatabase();