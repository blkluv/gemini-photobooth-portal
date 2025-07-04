import React, { useState } from 'react';
import { Button } from './Button';

const BOOTH_PIN = '1234'; // Change this per booth
const ADMIN_PIN = '9999'; // Your admin PIN
const DEVICE_KEY = 'booth-xyz-key'; // Set this in localStorage on the booth device

interface PinGateProps {
  onUnlock: (isAdmin: boolean) => void;
}

const PinGate: React.FC<PinGateProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeviceKeyModal, setShowDeviceKeyModal] = useState(false);
  const [deviceKeyInput, setDeviceKeyInput] = useState('');
  const [deviceKeyError, setDeviceKeyError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const deviceKey = localStorage.getItem('kioskKey');
      if (pin === ADMIN_PIN) {
        // If device key is missing, prompt to set it
        if (!deviceKey) {
          setShowDeviceKeyModal(true);
        } else {
          localStorage.setItem('photoboothPin', '1');
          setError('');
          onUnlock(true); // Admin unlock
        }
      } else if (pin === BOOTH_PIN && deviceKey === DEVICE_KEY) {
        localStorage.setItem('photoboothPin', '1');
        setError('');
        onUnlock(false); // Regular user unlock
      } else if (pin === BOOTH_PIN) {
        setError('Device not authorized for this PIN.');
      } else {
        setError('Incorrect PIN.');
      }
      setLoading(false);
    }, 500);
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
    onUnlock(true); // Admin unlock when setting device key
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
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Enter PIN</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full mb-4 p-3 border border-slate-300 rounded text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="PIN"
            autoFocus
            disabled={loading}
            maxLength={12}
          />
          {error && <div className="text-red-500 mb-2 text-sm text-center">{error}</div>}
          <Button type="submit" variant="special" className="w-full" disabled={loading || !pin}>
            {loading ? 'Checking...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PinGate; 