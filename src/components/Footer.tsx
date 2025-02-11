import React from 'react';
import { Book, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold">City of Rest</h2>
                <p className="text-gray-400">International Ministries</p>
              </div>
            </div>
            <p className="text-gray-400">
              Providing timeless biblical principles to help guide believers through life's challenges
              with grace and purpose.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:contact@cityofrest.org" className="text-gray-400 hover:text-white">
                  criministries2019@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-400" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-white">
                  +27 (073) 330-8348
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">
                  1 Beach Road, Maitland, Cape Town South Africa
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Service Times</h3>
            <div className="space-y-2 text-gray-400">
              <p>Sunday Service: 9:00 AM </p>
              <p>Bible Study: Tuesday 7:00 PM</p>
              <p>Prayer Meeting: Friday 6:00 PM</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} City of Rest International Ministries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}