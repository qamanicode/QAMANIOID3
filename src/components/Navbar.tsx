import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold font-display text-text">Pydroid 3</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button className="text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</button>
              <button className="text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors">Libraries</button>
              <button className="text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors">Use cases</button>
              <button className="text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors">Other languages</button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors">Download Now</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
