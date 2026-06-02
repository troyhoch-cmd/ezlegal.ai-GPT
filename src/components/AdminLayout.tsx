import { Outlet, Navigate, NavLink } from 'react-router-dom';
import {
  Users,
  FileText,
  MessageSquare,
  Handshake,
  Settings,
  Shield,
  BarChart3,
  Home,
  ChevronLeft,
  Menu,
  X,
  Palette
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDemo } from '../contexts/DemoContext';
import UserMenu from './UserMenu';

interface NavItem {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    to: '/admin',
    icon: Home,
    label: 'Overview',
    description: 'Dashboard & statistics'
  },
  {
    to: '/admin/users',
    icon: Users,
    label: 'Users',
    description: 'User management & access'
  },
  {
    to: '/admin/content',
    icon: FileText,
    label: 'Content',
    description: 'Documents & templates'
  },
  {
    to: '/admin/chat',
    icon: MessageSquare,
    label: 'Chat',
    description: 'Conversations & messages'
  },
  {
    to: '/admin/partners',
    icon: Handshake,
    label: 'Partners',
    description: 'Pipeline & analytics'
  },
  {
    to: '/admin/collateral',
    icon: Palette,
    label: 'Collateral',
    description: 'Edit, preview & send marketing PDFs'
  },
  {
    to: '/admin/system',
    icon: Settings,
    label: 'System',
    description: 'RBAC & widgets'
  },
  {
    to: '/admin/audit-log',
    icon: Shield,
    label: 'Audit Log',
    description: 'Admin activity trail'
  }
];

export default function AdminLayout() {
  const { profile } = useAuth();
  const { isDemoMode } = useDemo();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!profile?.is_admin && !isDemoMode) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-navy-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <p className="font-bold text-navy-900" role="presentation">Admin Panel</p>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-navy-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-navy-200 transition-transform duration-300 z-30 overflow-y-auto`}
        >
          <div className="p-6 border-b border-navy-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-teal-600" />
              <h2 className="font-bold text-lg text-navy-900">Admin Panel</h2>
            </div>
            <p className="text-xs text-navy-600">System management</p>
          </div>

          <nav className="p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-teal-50 border border-teal-200 text-teal-700'
                          : 'hover:bg-navy-50 text-navy-700 hover:text-navy-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isActive ? 'text-teal-600' : ''}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.label}</div>
                          <div className="text-xs text-navy-500 mt-0.5">{item.description}</div>
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-navy-200 mt-auto">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm text-navy-600 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </NavLink>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <header
            role="banner"
            className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-navy-200 shadow-sm"
          >
            <div className="flex items-center justify-end h-16 px-4 sm:px-6 gap-2">
              <UserMenu />
            </div>
          </header>
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
