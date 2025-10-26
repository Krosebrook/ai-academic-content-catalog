import React, { useState } from 'react';
import * as api from '../../api/apiService';
import FFCard from '../education/shared/FFCard';
import FFButton from '../education/shared/FFButton';
import ProgressBar from '../education/shared/ProgressBar';

interface DataMigrationProps {
  onComplete: () => void;
}

const DataMigration: React.FC<DataMigrationProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localContent = JSON.parse(localStorage.getItem('flashfusion_ai_content') || '[]');
  
  const handleMigration = async () => {
    setStatus('migrating');
    setError(null);
    try {
      // In a real app, you might chunk this for very large amounts of data.
      await api.batchCreateContent(localContent);
      setProgress(100);
      setStatus('complete');
      // Clear local storage after successful migration
      localStorage.removeItem('flashfusion_ai_content');
      localStorage.removeItem('flashfusion_ai_collections');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 ff-fade-in-up">
      <FFCard>
        <h2 style={{fontFamily: 'var(--ff-font-primary)'}} className="text-2xl font-bold text-center mb-2">Migrate Your Data</h2>
        <p className="text-ff-text-muted text-center mb-6">
          We found {localContent.length} content items saved in this browser. Would you like to move them to your new secure account?
        </p>

        {status === 'idle' && (
          <div className="flex gap-4">
            <FFButton onClick={onComplete} variant="secondary" style={{backgroundColor: 'var(--ff-surface)'}} className="w-full">Skip for Now</FFButton>
            <FFButton onClick={handleMigration} variant="primary" className="w-full">Migrate Data</FFButton>
          </div>
        )}
        
        {status === 'migrating' && (
          <div>
            <p className="text-center mb-2">Migrating... please don't close this window.</p>
            <ProgressBar value={progress} />
          </div>
        )}

        {status === 'complete' && (
          <div className="text-center">
            <p className="text-green-400 mb-4">Migration successful!</p>
            <FFButton onClick={onComplete} variant="primary" className="w-full">Continue to Sign In</FFButton>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <p className="text-red-400 mb-2">Migration failed: {error}</p>
            <FFButton onClick={handleMigration} variant="accent" className="w-full">Retry Migration</FFButton>
          </div>
        )}

      </FFCard>
    </div>
  );
};

export default DataMigration;