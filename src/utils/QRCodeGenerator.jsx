// components/QRCodeGenerator.jsx
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ value, size = 100 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    if (value) {
      generateQRCode();
    }
  }, [value, size]);

  if (!qrCodeUrl) return null;

  return (
    <img 
      src={qrCodeUrl} 
      alt="QR Code" 
      className="qr-code"
      style={{ width: size, height: size }}
    />
  );
};

export default QRCodeGenerator;