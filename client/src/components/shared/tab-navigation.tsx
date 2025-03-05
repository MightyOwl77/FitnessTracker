import { Link } from "wouter";
import { 
  UserCircle, 
  Target, 
  ClipboardList, 
  Utensils, 
  Weight 
} from "lucide-react";

interface TabNavigationProps {
  activeTab: number;
}

export default function TabNavigation({ activeTab }: TabNavigationProps) {
  const tabs = [
    { id: 1, name: "User Data", icon: <UserCircle className="mr-2 h-4 w-4" />, path: "/user-data" },
    { id: 2, name: "Set Goals", icon: <Target className="mr-2 h-4 w-4" />, path: "/set-goals" },
    { id: 3, name: "Your Plan", icon: <ClipboardList className="mr-2 h-4 w-4" />, path: "/view-plan" },
    { id: 4, name: "Daily Log", icon: <Utensils className="mr-2 h-4 w-4" />, path: "/daily-log" },
    { id: 5, name: "Body Stats", icon: <Weight className="mr-2 h-4 w-4" />, path: "/body-stats" },
  ];

  return (
    <nav className="relative mb-8">
      <div className="flex overflow-x-auto py-2 scrollbar-hide">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`tab-button whitespace-nowrap px-4 py-2 font-medium text-sm md:text-base ${
              activeTab === tab.id ? "text-neutral-800" : "text-neutral-500"
            } flex-1 text-center focus:outline-none flex items-center justify-center`}
          >
            {tab.icon}
            {tab.name}
          </Link>
        ))}
      </div>
      <span 
        className="tab-indicator absolute bottom-0 left-0 h-1 bg-primary-500 rounded-full transition-all duration-300" 
        style={{ 
          width: `${100 / tabs.length}%`, 
          transform: `translateX(${(activeTab - 1) * 100}%)` 
        }}
      ></span>
    </nav>
  );
}
