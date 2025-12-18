import React from 'react';

interface InlineAlertProps {
  message: string | null;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const InlineAlert: React.FC<InlineAlertProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  React.useEffect(() => {
    if (autoClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#16a34a',
          border: '1px solid #16a34a'
        };
      case 'error':
        return {
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#dc2626',
          border: '1px solid #dc2626'
        };
      case 'warning':
        return {
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#d97706',
          border: '1px solid #d97706'
        };
      default:
        return {
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#2563eb',
          border: '1px solid #2563eb'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div 
      style={{
        padding: '1rem',
        margin: '1rem 0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
        fontWeight: '500',
        ...getAlertStyles()
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{getIcon()}</span>
        <span>{message}</span>
      </div>
      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'inherit', 
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '0',
          marginLeft: '1rem',
          opacity: '0.7',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
};

export default InlineAlert;


