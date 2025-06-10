import React, { useState } from "react";
import QrReader from "react-qr-reader";

const ScanQrPage: React.FC = () => {
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: string | null) => {
    if (data) {
      setScannedUrl(data);
      // Optionally, you can auto-redirect:
      // window.location.href = data;
    }
  };

  const handleError = (err: any) => {
    setError("QR scan error: " + err?.message || String(err));
  };

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Scan QR Code</h2>
      {!scannedUrl && (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: "100%" }}
          />
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {scannedUrl && (
        <div>
          <p>QR code detected:</p>
          <a href={scannedUrl} target="_blank" rel="noopener noreferrer">{scannedUrl}</a>
          <br />
          <button onClick={() => setScannedUrl(null)}>Scan Another</button>
        </div>
      )}
    </div>
  );
};

export default ScanQrPage;
