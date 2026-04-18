import React from 'react';
import { Zap, Code, Keyboard, Monitor, Layers, Navigation } from 'lucide-react';

const features = [
  { title: "Offline Python Interpreter", description: "Run Python programs without internet connection. Perfect for coding on the go.", icon: Zap },
  { title: "Smart Code Features", description: "Code prediction, auto-indentation, and real-time code analysis just like in professional desktop IDEs.", icon: Code },
  { title: "Extended Keyboard", description: "Specialized keyboard bar with all Python symbols and shortcuts you need.", icon: Keyboard },
  { title: "Syntax Highlighting & Themes", description: "Multiple color themes and syntax highlighting for better code readability.", icon: Monitor },
  { title: "Tabs Support", description: "Work on multiple files simultaneously with an intuitive tab system.", icon: Layers },
  { title: "Enhanced Navigation", description: "Jump to definitions and assignments with interactive code navigation.", icon: Navigation },
];

export default function Features() {
  return (
    <section id="features" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text font-display">Powerful Features for Python Development</h2>
          <p className="mt-4 text-lg text-muted">Everything you need to write Python code on your Android device</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass-card p-6 rounded-lg transition-transform hover:scale-105">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">{feature.title}</h3>
              <p className="text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
