import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Cpu, 
  MapPin, 
  Hash, 
  Network, 
  Building2, 
  Zap, 
  Calendar,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { DEVICE_TYPES } from '../../utils/constants';
import Button from './Button';

// Device type options with icons and descriptions
const DEVICE_TYPE_OPTIONS = [
  { value: 'METER', label: 'Energy Meter', description: 'Measures energy consumption' },
  { value: 'SENSOR', label: 'Sensor', description: 'Environmental monitoring' },
  { value: 'SWITCH', label: 'Smart Switch', description: 'Remote power control' },
  { value: 'INVERTER', label: 'Inverter', description: 'Power conversion' },
  { value: 'BATTERY', label: 'Battery Storage', description: 'Energy storage system' },
  { value: 'HVAC', label: 'HVAC System', description: 'Heating/cooling control' },
  { value: 'SOLAR_PANEL', label: 'Solar Panel', description: 'Solar energy generation' },
  { value: 'EV_CHARGER', label: 'EV Charger', description: 'Electric vehicle charging' },
];

// Input field component
const FormField = ({ label, icon: Icon, error, required, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-danger-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" 
          size={18} 
        />
      )}
      {children}
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-danger-500 text-xs mt-1 flex items-center gap-1"
      >
        <AlertCircle size={12} />
        {error}
      </motion.p>
    )}
  </div>
);

// Text input component
const TextInput = ({ icon: Icon, error, className, ...props }) => (
  <input
    {...props}
    className={cn(
      'w-full py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700/50 dark:text-white transition-all duration-200',
      Icon ? 'pl-10 pr-4' : 'px-4',
      error 
        ? 'border-danger-500 focus:ring-danger-500' 
        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500',
      className
    )}
  />
);

// Select input component
const SelectInput = ({ icon: Icon, error, options, className, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" 
        size={18} 
      />
    )}
    <select
      {...props}
      className={cn(
        'w-full py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700/50 dark:text-white transition-all duration-200 appearance-none cursor-pointer',
        Icon ? 'pl-10 pr-10' : 'px-4 pr-10',
        error 
          ? 'border-danger-500 focus:ring-danger-500' 
          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500',
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

// Toggle switch component
const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-600'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  </div>
);

/**
 * DeviceModal - Production-ready modal for adding/editing devices
 * 
 * @param {boolean} isOpen - Control modal visibility
 * @param {function} onClose - Callback when modal closes
 * @param {function} onSubmit - Callback with device data on form submit
 * @param {object} initialData - Pre-fill form for editing (null for new device)
 * @param {boolean} loading - Show loading state on submit button
 */
export default function DeviceModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  loading = false 
}) {
  const isEditMode = !!initialData;
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'METER',
    location: '',
    serialNumber: '',
    modelNumber: '',
    ipAddress: '',
    macAddress: '',
    manufacturer: '',
    model: '',
    firmwareVersion: '',
    powerRating: '',
    installationDate: '',
    isSmart: true,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          type: initialData.type || 'METER',
          location: initialData.location || '',
          serialNumber: initialData.serialNumber || '',
          modelNumber: initialData.modelNumber || '',
          ipAddress: initialData.ipAddress || '',
          macAddress: initialData.macAddress || '',
          manufacturer: initialData.manufacturer || '',
          model: initialData.model || '',
          firmwareVersion: initialData.firmwareVersion || '',
          powerRating: initialData.powerRating?.toString() || '',
          installationDate: initialData.installationDate 
            ? new Date(initialData.installationDate).toISOString().split('T')[0] 
            : '',
          isSmart: initialData.isSmart ?? true,
        });
      } else {
        setFormData({
          name: '',
          type: 'METER',
          location: '',
          serialNumber: '',
          modelNumber: '',
          ipAddress: '',
          macAddress: '',
          manufacturer: '',
          model: '',
          firmwareVersion: '',
          powerRating: '',
          installationDate: '',
          isSmart: true,
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Device name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        return '';
      case 'type':
        if (!value) return 'Device type is required';
        return '';
      case 'location':
        if (!value.trim()) return 'Location is required';
        return '';
      case 'ipAddress':
        if (value && !/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
          return 'Invalid IP address format';
        }
        return '';
      case 'macAddress':
        if (value && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value)) {
          return 'Invalid MAC address format (e.g., AA:BB:CC:DD:EE:FF)';
        }
        return '';
      case 'powerRating':
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          return 'Power rating must be a positive number';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      powerRating: formData.powerRating ? parseFloat(formData.powerRating) : null,
      installationDate: formData.installationDate || null,
    };

    // Include ID if editing
    if (initialData?.id) {
      submitData.id = initialData.id;
    }

    onSubmit(submitData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-primary-500/10 to-primary-600/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Device' : 'Add New Device'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEditMode ? 'Update device information' : 'Configure a new device'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-xs text-primary-600 dark:text-primary-400 font-bold">1</span>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Device Name" icon={Cpu} required error={errors.name}>
                      <TextInput
                        icon={Cpu}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., Main Office Meter"
                        error={errors.name}
                      />
                    </FormField>

                    <FormField label="Device Type" required error={errors.type}>
                      <SelectInput
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        options={DEVICE_TYPE_OPTIONS}
                        error={errors.type}
                      />
                    </FormField>

                    <FormField label="Location" icon={MapPin} required error={errors.location} className="md:col-span-2">
                      <TextInput
                        icon={MapPin}
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., Building A, Floor 2, Room 201"
                        error={errors.location}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Hardware Details Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-xs text-primary-600 dark:text-primary-400 font-bold">2</span>
                    Hardware Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Serial Number" icon={Hash} error={errors.serialNumber}>
                      <TextInput
                        icon={Hash}
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., SN-12345678"
                        error={errors.serialNumber}
                      />
                    </FormField>

                    <FormField label="Model Number" error={errors.modelNumber}>
                      <TextInput
                        name="modelNumber"
                        value={formData.modelNumber}
                        onChange={handleChange}
                        placeholder="e.g., EM-2000X"
                      />
                    </FormField>

                    <FormField label="Manufacturer" icon={Building2} error={errors.manufacturer}>
                      <TextInput
                        icon={Building2}
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        placeholder="e.g., Schneider Electric"
                      />
                    </FormField>

                    <FormField label="Model" error={errors.model}>
                      <TextInput
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="e.g., PowerLogic PM5500"
                      />
                    </FormField>

                    <FormField label="Firmware Version" error={errors.firmwareVersion}>
                      <TextInput
                        name="firmwareVersion"
                        value={formData.firmwareVersion}
                        onChange={handleChange}
                        placeholder="e.g., v2.1.3"
                      />
                    </FormField>

                    <FormField label="Power Rating (Watts)" icon={Zap} error={errors.powerRating}>
                      <TextInput
                        icon={Zap}
                        name="powerRating"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.powerRating}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 5000"
                        error={errors.powerRating}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Network Settings Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-xs text-primary-600 dark:text-primary-400 font-bold">3</span>
                    Network Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="IP Address" icon={Network} error={errors.ipAddress}>
                      <TextInput
                        icon={Network}
                        name="ipAddress"
                        value={formData.ipAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., 192.168.1.100"
                        error={errors.ipAddress}
                      />
                    </FormField>

                    <FormField label="MAC Address" error={errors.macAddress}>
                      <TextInput
                        name="macAddress"
                        value={formData.macAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g., AA:BB:CC:DD:EE:FF"
                        error={errors.macAddress}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Additional Settings Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-xs text-primary-600 dark:text-primary-400 font-bold">4</span>
                    Additional Settings
                  </h3>
                  <div className="space-y-4">
                    <FormField label="Installation Date" icon={Calendar}>
                      <TextInput
                        icon={Calendar}
                        name="installationDate"
                        type="date"
                        value={formData.installationDate}
                        onChange={handleChange}
                      />
                    </FormField>

                    <ToggleSwitch
                      label="Smart Device"
                      description="Enable IoT connectivity and real-time monitoring"
                      checked={formData.isSmart}
                      onChange={(value) => setFormData((prev) => ({ ...prev, isSmart: value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      {isEditMode ? 'Save Changes' : 'Add Device'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
