import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { validateKey } from '../backend-app/keyGate';

const BOOTH_PIN = '1234'; // Change this per booth
const ADMIN_PIN = '9999'; // Your admin PIN
const DEVICE_KEY = 'booth-xyz-key'; // Set this in localStorage on the booth device

interface PinGateProps {
  onUnlock: (isAdmin: boolean) => void;
}

const PinGate: React.FC<PinGateProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeviceKeyModal, setShowDeviceKeyModal] = useState(false);
  const [deviceKeyInput, setDeviceKeyInput] = useState('');
  const [deviceKeyError, setDeviceKeyError] = useState('');
  const [mode, setMode] = useState<'pin' | 'key'>('key'); // default to key mode
  const [trialTimeLeft, setTrialTimeLeft] = useState<number | null>(null);

  // Check for trial expiry on mount and every second
  useEffect(() => {
    const checkTrialExpiry = () => {
      const trialExpiry = localStorage.getItem('trialKeyExpiry');
      if (trialExpiry) {
        const expiryTime = parseInt(trialExpiry, 10);
        const now = Date.now();
        const timeLeft = expiryTime - now;
        
        if (timeLeft <= 0) {
          // Trial expired
          setError('Your free trial has expired. Please purchase a key.');
          localStorage.removeItem('trialKeyExpiry');
          localStorage.removeItem('photoboothKey');
          setTrialTimeLeft(null);
          // Auto-redirect to landing page after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          // Trial still valid, show countdown
          setTrialTimeLeft(Math.floor(timeLeft / 1000));
        }
      } else {
        setTrialTimeLeft(null);
      }
    };

    // Check immediately
    checkTrialExpiry();

    // Check every second
    const interval = setInterval(checkTrialExpiry, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (mode === 'pin') {
    setTimeout(() => {
      const deviceKey = localStorage.getItem('kioskKey');
      if (pin === ADMIN_PIN) {
        if (!deviceKey) {
          setShowDeviceKeyModal(true);
        } else {
          localStorage.setItem('photoboothPin', '1');
            setSuccess('Admin access granted!');
            setTimeout(() => onUnlock(true), 1000);
        }
      } else if (pin === BOOTH_PIN && deviceKey === DEVICE_KEY) {
        localStorage.setItem('photoboothPin', '1');
          setSuccess('Access granted!');
          setTimeout(() => onUnlock(false), 1000);
      } else if (pin === BOOTH_PIN) {
        setError('Device not authorized for this PIN.');
      } else {
        setError('Incorrect PIN.');
      }
      setLoading(false);
    }, 500);
    } else {
      // Key mode: validate via backend
      try {
        const result = await validateKey(key.trim());
        if (result.valid) {
          localStorage.setItem('photoboothKey', key.trim());
          if (result.type === 'trial') {
            localStorage.setItem('trialKeyExpiry', (result.expires * 1000).toString());
            setSuccess(`Trial access granted! Time remaining: ${formatTimeLeft(Math.floor((result.expires * 1000 - Date.now()) / 1000))}`);
          } else {
            localStorage.removeItem('trialKeyExpiry');
            setSuccess('Event access granted!');
          }
          setTimeout(() => onUnlock(false), 1500);
        } else {
          setError('Invalid or expired key.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleSetDeviceKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceKeyInput.trim()) {
      setDeviceKeyError('Device key cannot be empty.');
      return;
    }
    localStorage.setItem('kioskKey', deviceKeyInput.trim());
    localStorage.setItem('photoboothPin', '1');
    setDeviceKeyError('');
    setShowDeviceKeyModal(false);
    setSuccess('Device key set successfully!');
    setTimeout(() => onUnlock(true), 1000);
  };

  if (showDeviceKeyModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-xs flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Set Device Key</h2>
          <form onSubmit={handleSetDeviceKey} className="w-full flex flex-col items-center">
            <input
              type="text"
              value={deviceKeyInput}
              onChange={e => setDeviceKeyInput(e.target.value)}
              className="w-full mb-4 p-3 border border-slate-300 rounded text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Enter device key"
              autoFocus
              maxLength={64}
            />
            {deviceKeyError && <div className="text-red-500 mb-2 text-sm text-center">{deviceKeyError}</div>}
            <Button type="submit" variant="special" className="w-full">
              Save Device Key
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-xs flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Unlock Photobooth</h2>
        
        {/* Trial countdown */}
        {trialTimeLeft !== null && (
          <div className="w-full mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-yellow-800 font-semibold">Trial Time Remaining</div>
              <div className="text-lg font-mono text-yellow-900">{formatTimeLeft(trialTimeLeft)}</div>
            </div>
          </div>
        )}

        <div className="flex mb-4 w-full">
          <button
            className={`flex-1 py-2 rounded-l-lg font-semibold transition-colors ${mode === 'key' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            onClick={() => setMode('key')}
            disabled={loading}
          >
            Event/Trial Key
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg font-semibold transition-colors ${mode === 'pin' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            onClick={() => setMode('pin')}
            disabled={loading}
          >
            Admin PIN
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          {mode === 'key' ? (
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full mb-4 p-3 border border-slate-300 rounded text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Enter event or trial key"
              autoFocus
              maxLength={64}
              disabled={loading}
            />
          ) : (
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full mb-4 p-3 border border-slate-300 rounded text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Admin PIN"
            autoFocus
              maxLength={12}
            disabled={loading}
          />
          )}
          
          {error && (
            <div className="text-red-500 mb-2 text-sm text-center bg-red-50 p-2 rounded border border-red-200 w-full">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 mb-2 text-sm text-center bg-green-50 p-2 rounded border border-green-200 w-full">
              {success}
            </div>
          )}
          
          <Button 
            type="submit" 
            variant="special" 
            className="w-full" 
            disabled={loading || (mode === 'key' ? !key.trim() : !pin)}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking...
              </div>
            ) : (
              'Unlock'
            )}
          </Button>
        </form>
        
        {/* Help text */}
        <div className="mt-4 text-xs text-slate-500 text-center">
          {mode === 'key' ? (
            <div>
              <div>Valid keys: EVENT-1234, EVENT-5678, EVENT-9999</div>
              <div>Trial keys: TRIAL-XXXX (e.g., TRIAL-ABCD)</div>
            </div>
          ) : (
            <div>
              <div>Admin PIN: 9999</div>
              <div>Booth PIN: 1234</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PinGate; 