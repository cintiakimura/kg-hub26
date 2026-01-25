import React, { useEffect, useState } from 'react';
import { Sun, Moon, Home, Users, Package, TruckIcon, DollarSign, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import Hub from '@/components/Hub';

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  
  const [userRole, setUserRole] = useState(null);
  const [hubOpen, setHubOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    
    if (saved === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      
      if (profiles.length > 0) {
        setUserRole(profiles[0].role);
      }
    } catch (err) {
      console.log('No user role');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const getNavItems = () => {
    if (!userRole) return [];
    
    if (userRole === 'client') {
      return [
        { icon: Home, label: 'Dashboard', page: 'ClientDashboard' },
        { icon: FileText, label: 'Quotes', page: 'ClientQuotes' },
        { icon: TruckIcon, label: 'Shipments', page: 'ClientShipments' }
      ];
    }
    
    if (userRole === 'supplier') {
      return [
        { icon: Home, label: 'Dashboard', page: 'SupplierDashboard' }
      ];
    }
    
    if (userRole === 'manager') {
      return [
        { icon: Home, label: 'Production', page: 'ManagerDashboard' },
        { icon: Users, label: 'Clients', page: 'ManagerClients' },
        { icon: FileText, label: 'Sales Quotes', page: 'ManagerSalesQuotes' },
        { icon: Package, label: 'Supplier Quotes', page: 'ManagerSupplierQuotes' },
        { icon: TruckIcon, label: 'Logistics', page: 'ManagerLogistics' },
        { icon: DollarSign, label: 'Financials', page: 'ManagerFinancials' }
      ];
    }
    
    return [];
  };

  const handleProfileClick = () => {
    if (userRole === 'manager') {
      navigate(createPageUrl('ManagerProfile'));
    }
  };

  const navItems = getNavItems();
  const showSidebar = navItems.length > 0 && !location.pathname.includes('Login');

  return (
    <div className="flex min-h-screen">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 bg-[#00c600] text-white p-2 transition-all hover:shadow-[0_0_8px_rgba(0,198,0,0.6)]"
        style={{ borderRadius: '8px' }}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {showSidebar && (
        <div className="fixed left-0 top-0 h-full w-16 bg-white dark:bg-[#212121] border-r border-[#00c600] z-40 flex flex-col items-center py-4 gap-4">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
            alt="KG"
            className="w-10 h-10 object-contain cursor-pointer"
            onClick={handleProfileClick}
          />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <button
                key={item.page}
                onClick={() => navigate(createPageUrl(item.page))}
                className={`p-2 rounded transition-all ${isActive ? 'bg-[#00c600] bg-opacity-20' : ''}`}
                title={item.label}
              >
                <Icon size={20} color="#00c600" />
              </button>
            );
          })}
        </div>
      )}

      <div className={`flex-1 ${showSidebar ? 'ml-16' : ''}`}>

        <button
          onClick={() => setHubOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full flex items-center justify-center hub-pulse overflow-hidden shadow-lg hover:scale-110 transition-all duration-300"
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/d4f926ee2_Gemini_Generated_Image_hft3tmhft3tmhft3.png"
            alt="Hub"
            className="w-full h-full object-cover"
          />
        </button>

          <Hub isOpen={hubOpen} onClose={() => setHubOpen(false)} />

          {children}
        </div>
    </div>
  );
}