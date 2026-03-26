import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const devices = [
  { id: 'desktop', icon: Monitor, label: 'Desktop', width: 1200, height: 800 },
  { id: 'tablet', icon: Tablet, label: 'Tablet', width: 768, height: 1024 },
  { id: 'mobile', icon: Smartphone, label: 'Mobile', width: 375, height: 667 },
];

/**
 * DevicePreview component for testing responsive design
 * Shows how the UI looks on different devices
 */
export default function DevicePreview({ children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const currentDevice = devices.find((d) => d.id === selectedDevice);

  return (
    <>
      {/* Preview Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 p-3 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-500/30',
          'hover:bg-primary-600 transition-colors',
          className
        )}
        title="Device Preview"
      >
        <Monitor size={24} />
      </motion.button>

      {/* Preview Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden max-w-[95vw] max-h-[95vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Device Preview
                  </h3>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                    {devices.map((device) => {
                      const Icon = device.icon;
                      return (
                        <button
                          key={device.id}
                          onClick={() => setSelectedDevice(device.id)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            selectedDevice === device.id
                              ? 'bg-primary-500 text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                          )}
                          title={device.label}
                        >
                          <Icon size={18} />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentDevice?.width} × {currentDevice?.height}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Preview Container */}
              <div className="p-4 bg-gray-100 dark:bg-slate-900 overflow-auto">
                <motion.div
                  key={selectedDevice}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: currentDevice?.width,
                    height: currentDevice?.height,
                    maxWidth: '100%',
                    maxHeight: 'calc(95vh - 100px)',
                  }}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-auto mx-auto border border-gray-200 dark:border-slate-700"
                >
                  {children}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
