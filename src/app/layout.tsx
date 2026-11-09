import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PHM Studio | 预测性维护工作台',
  description: '在浏览器中导入振动 CSV、提取特征并计算频谱。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
