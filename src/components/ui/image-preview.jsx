import React, { useRef, useState, useEffect } from "react";

const ImagePreview = ({ file, onChange }) => {
  const fileInputRef = useRef();
  const [preview, setPreview] = useState(null);

  // ✅ Generate and clean up preview URL
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      onClick={handleClick}
      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100"
    >
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <span className="text-gray-500 text-sm">Click to Upload</span>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => onChange(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default ImagePreview;
