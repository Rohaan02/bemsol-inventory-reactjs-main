// src/pages/Settings/SettingsIndex.jsx
import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { toast } from "react-toastify";
import settingsAPI from "@/lib/settingsAPI";
import {
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  FileText,
  Hash,
  Package,
  Building,
  Save,
} from "lucide-react";

// Constants
const SETTING_KEYS = {
  APP_NAME: "app_name",
  ADDRESS: "address",
  PHONE: "phone_no",
  WHATSAPP: "whatsapp_no",
  EMAIL: "email_address",
  LOGO: "app_logo",
  SKU_PREFIX: "account_sku_prefix",
  INVOICE_LENGTH: "invoice_length",
};

const ICON_MAP = {
  [SETTING_KEYS.APP_NAME]: <Building size={18} className="text-gray-500" />,
  [SETTING_KEYS.ADDRESS]: <MapPin size={18} className="text-gray-500" />,
  [SETTING_KEYS.PHONE]: <Phone size={18} className="text-gray-500" />,
  [SETTING_KEYS.WHATSAPP]: <Phone size={18} className="text-green-500" />,
  [SETTING_KEYS.EMAIL]: <Mail size={18} className="text-gray-500" />,
  [SETTING_KEYS.LOGO]: <ImageIcon size={18} className="text-gray-500" />,
  [SETTING_KEYS.SKU_PREFIX]: <Hash size={18} className="text-gray-500" />,
  [SETTING_KEYS.INVOICE_LENGTH]: <FileText size={18} className="text-gray-500" />,
};

const DEFAULT_ICON = <Package size={18} className="text-gray-500" />;

// Format setting label utility function
const formatSettingLabel = (key) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

// Separate component for individual setting fields
const SettingField = ({ setting, index, logoPreview, onChange, onLogoChange }) => {
  const icon = ICON_MAP[setting.option_key] || DEFAULT_ICON;
  const label = formatSettingLabel(setting.option_key);

  if (setting.option_key === SETTING_KEYS.LOGO) {
    return (
      <div className="col-span-full flex flex-col items-center p-4 border border-gray-200 rounded-lg">
        <label className="block text-gray-700 mb-4 font-medium flex items-center gap-2">
          {icon}
          App Logo
        </label>
        
        {logoPreview && (
          <img
            src={logoPreview}
            alt="Logo Preview"
            className="h-32 w-32 object-contain mb-4 border-2 border-dashed border-gray-300 rounded-lg p-2"
          />
        )}
        
        <Input
          type="file"
          accept="image/*"
          onChange={onLogoChange}
          className="w-full max-w-xs"
        />
        <p className="text-sm text-gray-500 mt-2">PNG, JPG, SVG up to 5MB</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon}
        {label}
      </label>
      
      <Input
        value={setting.option_value || ""}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Enter ${label}`}
        className="w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

const SettingsIndex = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  // Memoized data fetching
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      const settingsData = response || [];
      
      setSettings(settingsData);

      // Set logo preview if available
      const logoSetting = settingsData.find(setting => 
        setting.option_key === SETTING_KEYS.LOGO
      );
      if (logoSetting?.option_value) {
        setLogoPreview(logoSetting.option_value);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle setting changes
  const handleSettingChange = (index, value) => {
    setSettings(prev => prev.map((setting, i) => 
      i === index ? { ...setting, option_value: value } : setting
    ));
  };

  // Handle logo file upload
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const updatedSettings = settings.map(setting =>
      setting.option_key === SETTING_KEYS.LOGO 
        ? { ...setting, file } 
        : setting
    );
    
    setSettings(updatedSettings);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Save all settings
  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      
      const updatePromises = settings.map(async (setting) => {
        if (setting.option_key === SETTING_KEYS.LOGO && setting.file) {
          const formData = new FormData();
          formData.append("option_value", setting.file);
          return settingsAPI.update(setting.option_key, formData, true);
        } else {
          return settingsAPI.update(setting.option_key, { 
            option_value: setting.option_value 
          });
        }
      });

      await Promise.all(updatePromises);
      toast.success("Settings updated successfully");
      await fetchSettings(); // Refresh data
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
       <div className="flex h-full min-h-screen bg-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <Loader size="lg" message="Loading settings..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">
              Application Settings
            </h1>

            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  General Settings
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {settings.map((setting, index) => (
                    <SettingField
                      key={setting.id}
                      setting={setting}
                      index={index}
                      logoPreview={logoPreview}
                      onChange={handleSettingChange}
                      onLogoChange={handleLogoChange}
                    />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader size="sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsIndex;