import React from 'react';
import { useDrivers } from './F1ApiBackend';
import './F1DriversPage.css';

// Map country codes to flag emojis
const countryFlags: Record<string, string> = {
  'NLD': '🇳🇱', 'MEX': '🇲🇽', 'GBR': '🇬🇧', 'AUS': '🇦🇺', 
  'MCO': '🇲🇨', 'ESP': '🇪🇸', 'GER': '🇩🇪', 'CAN': '🇨🇦',
  'FRA': '🇫🇷', 'THA': '🇹🇭', 'CHN': '🇨🇳', 'JPN': '🇯🇵',
  'FIN': '🇫🇮', 'DNK': '🇩🇰', 'USA': '🇺🇸', 'ITA': '🇮🇹',
};

interface Driver {
  id: string;
  full_name: string;
  given_name: string;
  family_name: string;
  code: string;
  image_url: string | null;
  country_code: string;
  driver_number: number;
}

interface DriverCardProps {
  driver: Driver;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver }) => {
  return (
    <div 
      className="driver-card"
      style={{
        background: `linear-gradient(135deg, #e10600 0%, #a10500 50%, #15151e 100%)`,
      }}
    >
      <div className="driver-card-pattern"></div>
      
      <div className="driver-card-header">
        <div className="driver-info">
          <h3 className="driver-first-name">{driver.given_name}</h3>
          <h2 className="driver-last-name">{driver.family_name}</h2>
        </div>
        <div className="driver-number">{driver.driver_number}</div>
      </div>

      <div className="driver-image-container">
        {driver.image_url && (
          <img 
            src={driver.image_url} 
            alt={driver.full_name}
            className="driver-image"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="driver-card-footer">
        <span className="driver-nationality">
          {countryFlags[driver.country_code] || '🏁'}
        </span>
      </div>
    </div>
  );
};

const F1DriversPage: React.FC = () => {
  const { drivers, loading, error } = useDrivers();
  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <div className="f1-drivers-page">
        <h1 className="page-main-title">{currentYear} Drivers</h1>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏎️</div>
          <p>Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="f1-drivers-page">
        <h1 className="page-main-title">{currentYear} Drivers</h1>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#e10600' }}>
          <p>Error loading drivers: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="f1-drivers-page">
      <h1 className="page-main-title">{currentYear} Drivers</h1>

      <div className="drivers-grid">
        {drivers && drivers.map(driver => (
          <DriverCard key={driver.id} driver={driver} />
        ))}
      </div>
    </div>
  );
};

export default F1DriversPage;