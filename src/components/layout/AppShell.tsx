import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-amber-50/40 flex items-center justify-center p-0 sm:p-4 md:p-6 select-none">
      {/* Phone Mockup Wrapper for larger screens, normal view for mobiles */}
      <div className="w-full h-screen sm:h-[840px] sm:max-w-[412px] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 bg-white overflow-hidden flex flex-col relative">
        {/* Notch for simulated phone on desktop */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-800 rounded-b-2xl z-50"></div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#fcfbfa] pt-0 pb-16 sm:pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppShell;
