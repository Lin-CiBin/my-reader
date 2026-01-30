import Dexie, { type Table } from 'dexie';

export interface Book {
  id?: number;
  title: string;
  data: ArrayBuffer;
  cover?: string;
  format: string;
  category: string;
  lastLocation?: string; // 新增字段：记录上次阅读位置的 CFI
}

export class MyDatabase extends Dexie {
  books!: Table<Book>;
  constructor() {
    super('ReaderDB');
    // 版本号从 1 改为 2
    this.version(2).stores({
      // 添加 lastLocation 索引
      books: '++id, title, category, lastLocation'
    });
  }
}

export const db = new MyDatabase();