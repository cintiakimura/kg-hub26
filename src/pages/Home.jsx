import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KGLogo from '@/components/ui/KGLogo';
import KGCard from '@/components/ui/KGCard';
import { Building2, Package, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  const portals = [
    {
      title: 'Client Portal',
      description: 'Manage vehicles, connectors, and request quotes',
      icon: Building2,
      href: createPageUrl('ClientLogin'),
      color: 'bg-blue-50'
    },
    {
      title: 'Supplier Portal',
      description: 'Handle purchase orders and mark parts ready',
      icon: Package,
      href: createPageUrl('SupplierLogin'),
      color: 'bg-purple-50'
    },
    {
      title: 'Manager Portal',
      description: 'Production control, logistics, and financials',
      icon: Shield,
      href: createPageUrl('ManagerLogin'),
      color: 'bg-green-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#00C600] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <KGLogo size={40} />
          <span className="text-xl text-gray-800">KG Hub</span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b-2 border-[#00C600]">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl text-gray-900 mb-4">
            Welcome to KG Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete business management for automotive parts. 
            Track vehicles, manage orders, and control logistics in one place.
          </p>
        </div>
      </div>

      {/* Portal Selection */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-center text-gray-500 mb-8">Select your portal to continue</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link key={portal.title} to={portal.href}>
                <KGCard className="h-full hover:shadow-lg transition-shadow group">
                  <div className={`w-12 h-12 ${portal.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-[#00C600]" />
                  </div>
                  
                  <h2 className="text-lg text-gray-900 mb-2">{portal.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">{portal.description}</p>
                  
                  <div className="flex items-center text-[#00C600] text-sm group-hover:gap-2 transition-all">
                    <span>Enter</span>
                    <ArrowRight size={16} className="ml-1" />
                  </div>
                </KGCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#00C600] bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          KG Hub – Business Management System
        </div>
      </footer>
    </div>
  );
}