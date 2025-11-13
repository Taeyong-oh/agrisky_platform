import { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { 
  LayoutDashboard, 
  MapPin, 
  Plane,
  Users, 
  Route, 
  BarChart3,
  Settings,
  Menu
} from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import FarmlandManagement from '@/components/FarmlandManagement';
import DroneManagement from '@/components/DroneManagement';
import WorkMatching from '@/components/WorkMatching';
import FlightOptimization from '@/components/FlightOptimization';

const menuItems = [
  {
    title: "대시보드",
    icon: LayoutDashboard,
    component: "dashboard"
  },
  {
    title: "농지 관리",
    icon: MapPin,
    component: "farmland"
  },
  {
    title: "드론 관리",
    icon: Plane,
    component: "drone"
  },
  {
    title: "작업 매칭",
    icon: Users,
    component: "matching"
  },
  {
    title: "비행 최적화",
    icon: Route,
    component: "optimization"
  },
  {
    title: "데이터 분석",
    icon: BarChart3,
    component: "analytics"
  }
];

export default function App() {
  const [activeComponent, setActiveComponent] = useState("dashboard");

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "farmland":
        return <FarmlandManagement />;
      case "drone":
        return <DroneManagement />;
      case "matching":
        return <WorkMatching />;
      case "optimization":
        return <FlightOptimization />;
      case "analytics":
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">데이터 분석</h3>
              <p className="text-muted-foreground">
                상세한 데이터 분석 기능이 곧 추가됩니다.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">농업 드론 AI</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.component}>
                  <SidebarMenuButton
                    onClick={() => setActiveComponent(item.component)}
                    isActive={activeComponent === item.component}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 flex items-center gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <Settings className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground" />
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            {renderComponent()}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}