import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2, Truck, Package } from 'lucide-react';

export default function MainLanding() {
  const navigate = useNavigate();

  const loginOptions = [
    {
      title: 'Client',
      icon: Building2,
      description: 'Track your vehicles, quotes & shipments',
      page: 'ClientLoginLanding',
      color: '#00c600'
    },
    {
      title: 'Supplier',
      icon: Package,
      description: 'Manage quotes & deliveries',
      page: 'SupplierLoginLanding',
      color: '#00c600'
    },
    {
      title: 'Manager',
      icon: Truck,
      description: 'Control production & logistics',
      page: 'ManagerLoginLanding',
      color: '#00c600'
    }
  ];

  return (
    <div style={{
      background: '#212121',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697651f65fc49ec896171492/e2c435b98_KG_primary_logo_green.png"
          alt="KG Logo"
          style={{ width: '120px', margin: '0 auto 60px' }}
        />
        
        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '20px', 
          color: '#00c600',
          fontWeight: '400'
        }}>
          KG Hub
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          marginBottom: '60px', 
          opacity: 0.8,
          fontWeight: '400'
        }}>
          Choose your portal
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '30px',
          marginTop: '40px'
        }}>
          {loginOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.title}
                onClick={() => navigate(createPageUrl(option.page))}
                style={{
                  background: '#2a2a2a',
                  border: '2px solid #00c600',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 198, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Icon size={48} color="#00c600" />
                <div>
                  <div style={{ 
                    fontSize: '24px', 
                    color: 'white',
                    marginBottom: '8px',
                    fontWeight: '400'
                  }}>
                    {option.title}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#aaa',
                    fontWeight: '400'
                  }}>
                    {option.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}