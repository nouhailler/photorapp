import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { usePhotos } from '../context/PhotoContext';
import type { Photo } from '../types/types';

const TopAppBar: React.FC = () => {
  const { addPhotos } = usePhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newItems = Array.from(files).map((file, index) => {
        const photo: Photo = {
          id: Date.now().toString() + index,
          url: '', // Handled by getPhotoUrl
          alt: file.name,
          date: new Date().toISOString().split('T')[0],
          isFavorite: false,
          albumIds: [],
          tags: [],
          storage: 'local',
          metadata: {
            device: 'Uploaded File',
            resolution: 'Unknown',
            date: new Date().toLocaleString(),
          }
        };
        return { photo, blob: file };
      });
      await addPhotos(newItems);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-container-padding">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 active:scale-95 duration-200 ease-in-out cursor-pointer">
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjkNhuI9ob5G7EK5DQ0ZiDXrwRgN6dNjhPS9mRAU0yoaJtJTPFesNMTu9eWp8ZeHf0d2_LiecwV-LqqrRvGmX_QFsW7jUrkwcyS8mHNSWrRKu2zvNu-RUQdw_3ta2xethFJgx05O9EFw_8bwbs5f8Il57zJazgBkljmWWVYMKYaV2GUHI02sTKe0qFAfPNjOxJ83MjvjSHTgnjz-dDaluSy8z5tKPcu90oudChh3MFcXKTdBWEmarTtF0jbdwlq9hpPkw_-hRxiOs" 
          />
        </div>
        <h1 className="text-headline-md font-bold tracking-tight text-on-surface">Gallery Pro</h1>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        <button 
          onClick={handleImportClick}
          className="bg-primary text-on-primary text-label-md font-semibold px-4 py-2 rounded-xl active:scale-95 duration-200 ease-in-out transition-colors hover:bg-primary-container"
        >
          Import
        </button>
      </div>
    </header>
  );
};

const BottomNavBar: React.FC = () => {
  const navItems = [
    { label: 'Photos', icon: 'photo_library', path: '/' },
    { label: 'Albums', icon: 'collections_bookmark', path: '/albums' },
    { label: 'IA', icon: 'auto_awesome', path: '/ia' },
    { label: 'Recherche', icon: 'search', path: '/search' },
    { label: 'Partage', icon: 'group', path: '/sharing' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-t border-outline-variant/30 pb-safe flex justify-around items-center px-4 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-1 active:scale-90 duration-200 transition-all cursor-pointer ${
              isActive 
                ? 'text-primary bg-primary-container/20 rounded-xl' 
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined ${isActive ? 'material-symbols-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-label-sm font-medium mt-0.5">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopAppBar />
      <main className="pt-20 pb-24 flex-grow">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default Layout;
