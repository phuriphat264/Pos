'use client';
import { useState } from 'react';
import { PosLeftPanel } from '@/components/pos/PosLeftPanel';
import { PosRightPanel } from '@/components/pos/PosRightPanel';

export default function Home() {
  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-100">
      <div className="flex-1 border-r border-gray-200 overflow-hidden flex flex-col">
        <PosLeftPanel />
      </div>
      <div className="w-full md:w-[400px] lg:w-[480px] bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] z-0">
        <PosRightPanel />
      </div>
    </div>
  );
}
