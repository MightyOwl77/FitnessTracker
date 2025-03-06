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
        <nav className="hidden md:flex space-x-6">
          <Link href="/view-plan">
            <span className="hover:text-green-200 transition-colors cursor-pointer">View Plan</span>
          </Link>
          <Link href="/user-data">
            <span className="hover:text-green-200 transition-colors cursor-pointer">Profile</span>
          </Link>
          <Link href="/set-goals">
            <span className="hover:text-green-200 transition-colors cursor-pointer">Set Goals</span>
          </Link>
          <Link href="/daily-log">
            <span className="hover:text-green-200 transition-colors cursor-pointer">Daily Log</span>
          </Link>
          <Link href="/body-stats">
            <span className="hover:text-green-200 transition-colors cursor-pointer">Body Stats</span>
          </Link>
          <Link href="/progress">
            <span className="hover:text-green-200 transition-colors cursor-pointer">Progress</span>
          </Link>
        </nav>
        <div className="md:hidden">
          {/* Mobile menu button */}
          <button className="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}