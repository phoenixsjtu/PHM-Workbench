import Link from 'next/link';

export default function NotFound() {
  return <main className="shell intro"><h1>找不到这个页面</h1><Link className="text-link" href="/">返回 PHM Studio</Link></main>;
}
