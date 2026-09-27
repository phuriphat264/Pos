'use client';
import { useState } from 'react';
import { PosLeftPanel } from '@/components/pos/PosLeftPanel';
import { PosRightPanel } from '@/components/pos/PosRightPanel';

export default function Home() {
  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-100 overflow-y-auto md:overflow-hidden">
      <div className="flex-none h-[65vh] md:h-auto md:flex-1 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
        <PosLeftPanel />
      </div>
      <div className="flex-none min-h-[50vh] md:min-h-0 md:flex-shrink-0 w-full md:w-[360px] lg:w-[400px] xl:w-[480px] bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] z-0">
        <PosRightPanel />
      </div>
    </div>
  );
}
