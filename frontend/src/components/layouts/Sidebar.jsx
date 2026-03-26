import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Gauge,
  AlertCircle,
  FileText,
  Settings,
  ChevronRight,
  Shield,
  Wrench,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Get user role
  const userRole = user?.role || user?.roles?.[0] || 'USER';

  // Base menu items for all users
  const baseMenuItems = [
    {
      label: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Energy Monitoring',
      href: '/app/energy',
      icon: Zap,
    },
    {
      label: 'Devices',
      href: '/app/devices',
      icon: Gauge,
    },
    {
      label: 'Alerts',
      href: '/app/alerts',
      icon: AlertCircle,
    },
    {
      label: 'Reports',
      href: '/app/reports',
      icon: FileText,
    },
    {
      label: 'Settings',
      href: '/app/settings',
      icon: Settings,
    },
  ];

  // Role-specific menu items
  const roleMenuItems = [];

  // Add Admin Dashboard for ADMIN and MANAGER roles
  if (['ADMIN', 'MANAGER'].includes(userRole)) {
    roleMenuItems.push({
      label: 'Admin Dashboard',
      href: '/app/admin',
      icon: Shield,
    });
  }

  // Add Technician Dashboard for TECHNICIAN, MANAGER, and ADMIN roles
  if (['TECHNICIAN', 'MANAGER', 'ADMIN'].includes(userRole)) {
    roleMenuItems.push({
      label: 'Technician Dashboard',
      href: '/app/technician',
      icon: Wrench,
    });
  }

  // Combine menu items
  const menuItems = [...baseMenuItems.slice(0, 1), ...roleMenuItems, ...baseMenuItems.slice(1)];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white overflow-y-auto transition-transform duration-300 transform z-40 lg:relative lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold">
              E
            </div>
            <span className="font-bold text-lg">EMS</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={18} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800 text-xs text-gray-400">
          <p>Energy Management System v1.0</p>
          <p>© 2026 All rights reserved</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
