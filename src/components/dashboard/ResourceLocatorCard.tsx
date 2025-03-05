import React from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, MagnifyingGlassIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Resource {
  name: string;
  type: string;
  distance: string;
  address: string;
  rating: number;
}

export const ResourceLocatorCard: React.FC = () => {
  const [resources] = React.useState<Resource[]>([
    {
      name: "Women's Health Center",
      type: "Clinic",
      distance: "0.8 miles",
      address: "123 Healthcare Ave",
      rating: 4.5
    },
    {
      name: "City General Hospital",
      type: "Hospital",
      distance: "1.2 miles",
      address: "456 Medical Blvd",
      rating: 4.2
    }
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <MapPinIcon className="w-6 h-6 text-pink-500" />
        <h2 className="text-xl font-semibold text-gray-800">Healthcare Resources</h2>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for healthcare services..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-800">{resource.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{resource.type}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{resource.address}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-pink-600">{resource.distance}</span>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(resource.rating) ? 'text-yellow-400' : 'text-gray-200'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 py-2 bg-white rounded-lg text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors duration-200">
                Get Directions
              </button>
              <button className="flex-1 py-2 bg-white rounded-lg text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors duration-200">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
          Filter by Type
        </button>
        <button className="p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200">
          Sort by Distance
        </button>
      </div>
    </motion.div>
  );
}; 