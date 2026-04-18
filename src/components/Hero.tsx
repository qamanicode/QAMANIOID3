import React from 'react';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden section-padding">
      <div className="absolute inset-0 bg-background -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-text">
            Python Development
            <span className="block text-primary">On Your Android Device</span>
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl font-sans">
            A powerful Python IDE in your pocket. Write, run, and debug Python code anywhere, anytime. With features like code completion, syntax highlighting, and an offline interpreter.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="inline-flex items-center justify-center gap-2 text-sm font-medium h-12 rounded-md px-8 bg-primary text-white hover:bg-primary/90 transition-colors">
              Download Now
            </button>
            <button className="inline-flex items-center justify-center gap-2 text-sm font-medium h-12 rounded-md px-8 border border-border bg-background hover:bg-card-background transition-colors text-text">
              Learn More
            </button>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative max-w-[300px] mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[3rem] blur-xl"></div>
            <div className="relative border-[8px] border-card-background rounded-[2.5rem] overflow-hidden bg-card-background">
              <div className="absolute top-0 inset-x-0 h-6 bg-card-background rounded-t-2xl"></div>
              {/* Using a placeholder for the video, referencing the structure in the provided HTML */}
              <img src="https://picsum.photos/seed/pydroid/300/600" alt="Pydroid Screenshot" className="w-full aspect-[9/19.5] object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
