import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DeviceModal from '../components/common/DeviceModal';
import DevicesList from '../components/features/DeviceManagement/DevicesList';
import { deviceApi } from '../services/api/deviceApi';
import { useDeviceUpdates } from '../hooks/useRealtime';
import toast from 'react-hot-toast';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { latestUpdate } = useDeviceUpdates();

  // Fetch devices from API
  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await deviceApi.getDevices();
      // Handle both paginated and list responses
      const deviceList = response.content || response;
      setDevices(Array.isArray(deviceList) ? deviceList : []);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Handle real-time device updates
  useEffect(() => {
    if (!latestUpdate) return;

    if (latestUpdate.type === 'DEVICE_CREATED' && latestUpdate.device) {
      setDevices(prev => [latestUpdate.device, ...prev]);
      toast.success(`Device "${latestUpdate.device.name}" added`);
    } else if (latestUpdate.type === 'DEVICE_UPDATED' && latestUpdate.device) {
      setDevices(prev => prev.map(d => 
        d.id === latestUpdate.device.id ? latestUpdate.device : d
      ));
    } else if (latestUpdate.type === 'DEVICE_STATUS_CHANGED' && latestUpdate.device) {
      setDevices(prev => prev.map(d => 
        d.id === latestUpdate.device.id ? latestUpdate.device : d
      ));
    } else if (latestUpdate.type === 'DEVICE_DELETED' && latestUpdate.deviceId) {
      setDevices(prev => prev.filter(d => d.id !== latestUpdate.deviceId));
      toast.success('Device removed');
    }
  }, [latestUpdate]);

  const filteredDevices = devices.filter((device) => {
    const name = device.name || '';
    const location = device.location || '';
    const status = (device.status || '').toLowerCase();
    
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const handleEdit = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      setEditingDevice(device);
      setShowDeviceModal(true);
    }
  };

  const handleDelete = async (deviceId) => {
    try {
      await deviceApi.deleteDevice(deviceId);
      setDevices(devices.filter((d) => d.id !== deviceId));
      toast.success('Device deleted');
    } catch (error) {
      console.error('Failed to delete device:', error);
      toast.error('Failed to delete device');
    }
  };

  const handleView = (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      // For now, open in edit mode as read-only view
      setEditingDevice(device);
      setShowDeviceModal(true);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDevice(null);
    setShowDeviceModal(true);
  };

  const handleCloseModal = () => {
    setShowDeviceModal(false);
    setEditingDevice(null);
  };

  const handleDeviceSubmit = async (deviceData) => {
    try {
      setModalLoading(true);
      
      if (editingDevice) {
        // Update existing device
        const updatedDevice = await deviceApi.updateDevice(editingDevice.id, deviceData);
        setDevices(prev => prev.map(d => d.id === editingDevice.id ? updatedDevice : d));
        toast.success(`Device "${updatedDevice.name}" updated successfully`);
      } else {
        // Create new device
        const newDevice = await deviceApi.createDevice(deviceData);
        setDevices(prev => [newDevice, ...prev]);
        toast.success(`Device "${newDevice.name}" added successfully`);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save device:', error);
      const message = error.response?.data?.message || 'Failed to save device';
      toast.error(message);
    } finally {
      setModalLoading(false);
    }
  };

  const onlineCount = devices.filter((d) => (d.status || '').toUpperCase() === 'ONLINE').length;
  const offlineCount = devices.filter((d) => (d.status || '').toUpperCase() === 'OFFLINE').length;
  const warningCount = devices.filter((d) => (d.status || '').toUpperCase() === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Devices</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and monitor all connected devices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={fetchDevices} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" size="md" className="flex gap-2" onClick={handleOpenAddModal}>
            <Plus size={18} />
            Add Device
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{devices.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-300 text-xl">
              {devices.length}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400 mt-1">{onlineCount}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center text-success-600 dark:text-success-300 text-xl">
              {onlineCount}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warning</p>
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-1">{warningCount}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center text-warning-600 dark:text-warning-300 text-xl">
              {warningCount}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-danger-600 dark:text-danger-400 mt-1">{offlineCount}</p>
            </div>
            <div className="w-12 h-12 bg-danger-100 dark:bg-danger-900 rounded-lg flex items-center justify-center text-danger-600 dark:text-danger-300 text-xl">
              {offlineCount}
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Devices Table */}
      <Card title={`Devices (${filteredDevices.length})`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-primary-500" size={32} />
          </div>
        ) : (
          <DevicesList
            devices={filteredDevices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}
      </Card>

      {/* Device Modal for Add/Edit */}
      <DeviceModal
        isOpen={showDeviceModal}
        onClose={handleCloseModal}
        onSubmit={handleDeviceSubmit}
        initialData={editingDevice}
        loading={modalLoading}
      />
    </div>
  );
}
