// components/QRCodeDisplay.jsx
import QRCode from 'react-qr-code';

const QRCodeDisplay = ({ 
  value, 
  size = 80,
  className = ""
}) => {
  if (!value) return null;

  return (
    <div className={`qr-code-container ${className}`}>
      <QRCode
        value={value}
        size={size}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox="0 0 256 256"
      />
    </div>
  );
};

export default QRCodeDisplay;