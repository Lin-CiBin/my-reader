"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark'; // 真正渲染到屏幕上的颜色
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 1. 记录用户的选择模式
  const [mode, setMode] = useState<ThemeMode>('system');
  // 2. 记录最终计算出的视觉主题
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 初始化：从本地存储读取
  useEffect(() => {
    const saved = localStorage.getItem('app-theme-mode') as ThemeMode;
    if (saved) setMode(saved);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const computeTheme = () => {
      if (mode === 'system') {
        // 如果是跟随系统，检查系统媒体查询
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        // 如果是手动选择，直接使用选择的模式
        setResolvedTheme(mode as 'light' | 'dark');
      }
    };

    computeTheme();

    // 监听系统变化（当用户在系统设置里切换黑夜模式时触发）
    const listener = () => {
      if (mode === 'system') computeTheme();
    };

    mediaQuery.addEventListener('change', listener);
    localStorage.setItem('app-theme-mode', mode);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {/* 在最外层 div 应用 dark 类名，配合 Tailwind 或 CSS 变量 */}
      <div className={resolvedTheme === 'dark' ? 'dark' : ''} style={{ height: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};