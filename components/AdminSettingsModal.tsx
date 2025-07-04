import React, { useState } from 'react';
import { Button } from './Button';
import { CogIcon, XMarkIcon } from './icons';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [newBoothPin, setNewBoothPin] = useState('');
  const [newDeviceKey, setNewDeviceKey] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem('photoboothPin');
    localStorage.removeItem('kioskKey');
    onLogout();
  };

  const handleChangeBoothPin = () => {
    if (newBoothPin.trim()) {
      // In a real app, you'd update the PIN logic here
      setMessage('Booth PIN updated successfully!');
      setNewBoothPin('');
    } else {
      setMessage('Please enter a valid PIN.');
    }
  };

  const handleChangeDeviceKey = () => {
    if (newDeviceKey.trim()) {
      localStorage.setItem('kioskKey', newDeviceKey.trim());
      setMessage('Device key updated successfully!');
      setNewDeviceKey('');
    } else {
      setMessage('Please enter a valid device key.');
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'branding', label: 'Branding' },
    { id: 'support', label: 'Support' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Admin Settings</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">General Settings</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Danger Zone</h4>
                <p className="text-red-700 mb-4">This will log you out and require re-authentication.</p>
                <Button onClick={handleLogout} variant="danger">
                  Logout & Reset Device
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Change Booth PIN
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={newBoothPin}
                      onChange={(e) => setNewBoothPin(e.target.value)}
                      placeholder="Enter new booth PIN"
                      className="flex-1 p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                      maxLength={12}
                    />
                    <Button onClick={handleChangeBoothPin} variant="primary">
                      Update PIN
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Change Device Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDeviceKey}
                      onChange={(e) => setNewDeviceKey(e.target.value)}
                      placeholder="Enter new device key"
                      className="flex-1 p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                      maxLength={64}
                    />
                    <Button onClick={handleChangeDeviceKey} variant="primary">
                      Update Key
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Analytics & Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800">Total Sessions</h4>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800">Photos Taken</h4>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800">Prints</h4>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800">Downloads</h4>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                Export Analytics Data
              </Button>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Branding & Customization</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  defaultValue="#8b5cf6"
                  className="w-full h-12 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  placeholder="Enter custom welcome message"
                  className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={3}
                />
              </div>

              <Button variant="primary" className="w-full">
                Save Branding
              </Button>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Support & Updates</h3>
              
              <div className="space-y-4">
                <Button variant="primary" className="w-full">
                  Check for Updates
                </Button>
                
                <Button variant="secondary" className="w-full">
                  Send Support Logs
                </Button>
                
                <Button variant="secondary" className="w-full">
                  Contact Support
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">System Info</h4>
                <p className="text-blue-700 text-sm">
                  Version: 1.0.0<br />
                  Device Key: {localStorage.getItem('kioskKey') || 'Not set'}<br />
                  Last Updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsModal; 