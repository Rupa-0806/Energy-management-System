import { Trash2, Edit2, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function DevicesList({ devices = [], onEdit, onDelete, onView }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-success-50 dark:bg-success-900 text-success-700 dark:text-success-300';
      case 'offline':
        return 'bg-danger-50 dark:bg-danger-900 text-danger-700 dark:text-danger-300';
      case 'idle':
        return 'bg-warning-50 dark:bg-warning-900 text-warning-700 dark:text-warning-300';
      default:
        return 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle size={16} />;
      case 'offline':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  if (!devices || devices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No devices found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Device Name
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Type
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Location
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Last Reading
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr
              key={device.id}
              className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{device.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: {device.id}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{device.type}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{device.location}</span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}
                >
                  {getStatusIcon(device.status)}
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{device.lastReading || 'N/A'}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onView(device.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(device.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(device.id)}
                    className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900 text-danger-600 dark:text-danger-400 transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
