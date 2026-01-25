import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { Mail, Calendar } from 'lucide-react';

export default function ManagerProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await base44.auth.me();
    setUser(u);
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-6 text-[#00c600]">Manager Profile</h1>

      <div className="border border-[#00c600] rounded-lg p-6 mb-6">
        <div className="mb-4">
          <div className="text-sm opacity-70">Name</div>
          <div className="text-lg">{user.full_name}</div>
        </div>
        <div className="mb-4">
          <div className="text-sm opacity-70">Email</div>
          <div className="text-lg">{user.email}</div>
        </div>
        <div>
          <div className="text-sm opacity-70">Role</div>
          <div className="text-lg">Manager</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#00c600] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail size={24} color="#00c600" />
            <div className="text-lg">Gmail</div>
          </div>
          <p className="text-sm opacity-70 mb-4">
            Connect your Gmail to manage emails directly from KG Hub. Read inbox, send messages, manage drafts.
          </p>
          <button 
            onClick={() => alert('Gmail OAuth not yet authorized. Contact admin to enable.')}
            className="w-full opacity-50 cursor-not-allowed"
            disabled
          >
            Connect Gmail
          </button>
        </div>

        <div className="border border-[#00c600] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={24} color="#00c600" />
            <div className="text-lg">Google Calendar</div>
          </div>
          <p className="text-sm opacity-70 mb-4">
            Sync your Google Calendar. View events, create appointments, manage your schedule.
          </p>
          <button onClick={() => navigate(createPageUrl('ManagerCalendar'))} className="w-full">
            Open Calendar
          </button>
        </div>
      </div>
    </div>
  );
}