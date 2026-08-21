import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FolderTree,
  BookUp,
  BookDown,
  BookMarked,
  BookmarkCheck,
  Users,
  History,
  ShieldAlert,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Library
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, toggleSidebar, overdueCount = 0, unreadCount = 0 }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'MAIN MENU',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Books Catalog', path: '/books', icon: BookOpen },
        ...(isAdmin ? [
          { name: 'Add Book', path: '/books/add', icon: PlusCircle },
          { name: 'Categories', path: '/categories', icon: FolderTree }
        ] : [])
      ]
    },
    {
      title: 'CIRCULATION',
      items: [
        ...(isAdmin ? [
          { name: 'Issue Book', path: '/issues/new', icon: BookUp },
          { name: 'Return Book', path: '/issues/return', icon: BookDown }
        ] : []),
        { name: 'Issued Books', path: '/issues', icon: BookMarked },
        { name: 'Bookings / Reservations', path: '/bookings', icon: BookmarkCheck },
        { 
          name: 'Overdue Books', 
          path: '/overdue', 
          icon: ShieldAlert,
          badge: overdueCount > 0 ? overdueCount : null,
          badgeColor: 'bg-rose-500 text-white'
        }
      ]
    },
    {
      title: 'MANAGEMENT & AUDIT',
      items: [
        ...(isAdmin ? [
          { name: 'Students / Users', path: '/students', icon: Users }
        ] : []),
        { name: 'Borrowing History', path: '/history', icon: History },
        { 
          name: 'Notifications', 
          path: '/notifications', 
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null,
          badgeColor: 'bg-indigo-500 text-white'
        },
        { name: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              <Library className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-lg text-white tracking-tight">LibraSphere</span>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Library OS v2.0</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h4>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                  
                  {item.badge && (
                    <span
                      className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        item.badgeColor
                      } ${isCollapsed ? 'absolute -top-1 -right-1 px-1.5' : ''}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* User Profile & Logout Bottom Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="User Avatar"
                className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};
