import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-card-background pt-16 pb-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Contact Us</h3>
            <div className="flex items-center text-muted mb-2">
              <a href="mailto:zhlidev@gmail.com" className="hover:text-primary transition-colors">zhlidev@gmail.com</a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Download App</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8">
          <div className="mt-6 text-sm text-center text-muted">
            <p>© 2026 Pydroid 3. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
