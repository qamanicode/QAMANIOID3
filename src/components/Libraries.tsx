import React from 'react';

const libraries = [
  { category: "Core Libraries", items: ["NumPy", "Pandas", "SciPy", "SymPy"] },
  { category: "Data Visualization", items: ["Matplotlib"] },
  { category: "Machine Learning and AI", items: ["Scikit-learn", "TensorFlow Lite", "PyTorch"] },
];

export default function Libraries() {
  return (
    <section id="libraries" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-text mb-16 font-display">Supported Libraries</h2>
        <div className="space-y-12">
          {libraries.map((section, index) => (
            <div key={index}>
              <h3 className="text-2xl font-semibold text-primary mb-6">{section.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="glass-card p-4 rounded-lg">
                    <span className="text-text font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
