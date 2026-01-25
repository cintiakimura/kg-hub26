import React from 'react';
import KGLogo from '../ui/KGLogo';
import KGButton from '../ui/KGButton';
import { LogOut, User } from 'lucide-react';

export default function AppHeader({ 
  user, 
  orgId, 
  onLogout, 
  title = "KG Hub" 
}) {
  return (
    <header className="bg-white border-b-2 border-[#00C600] px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KGLogo size={40} />
          <span className="text-lg text-gray-800">{title}</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <User size={16} />
              <span>Welcome {user.full_name || user.email}</span>
              {orgId && <span className="text-[#00C600]">– {orgId}</span>}
            </div>
            <KGButton variant="ghost" size="sm" onClick={onLogout}>
              <LogOut size={16} />
            </KGButton>
          </div>
        )}
      </div>
    </header>
  );
}