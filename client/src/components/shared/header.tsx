import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="text-2xl font-bold tracking-tight flex items-center space-x-2 cursor-pointer">
            <span className="bg-white text-emerald-600 rounded-md px-2 py-1">BT</span>
            <span>Body Transformation</span>
          </div>
        </Link>
      </div>
    </header>
  );
}