import React, { useState } from 'react';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/shared/Card';
import { motion } from 'framer-motion';
import { Map as MapIcon, Layers, Filter } from 'lucide-react';

const mapLayers = [
  { id: 'soil', name: 'Soil Health', color: 'bg-orange-500' },
  { id: 'water', name: 'Water Distribution', color: 'bg-blue-500' },
  { id: 'crops', name: 'Crop Types', color: 'bg-green-500' },
];

export default function FarmMapping() {
  const [activeLayer, setActiveLayer] = useState('soil');

  return (
    <PageTransition>
      <div className="p-6">
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Farm Mapping</h1>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white rounded-lg shadow-sm flex items-center space-x-2 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm flex items-center space-x-2 hover:bg-green-700">
              <Layers className="w-4 h-4" />
              <span>Add Layer</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[600px] relative">
              <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive map will be displayed here</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Map Layers</h3>
              <div className="space-y-2">
                {mapLayers.map((layer) => (
                  <motion.button
                    key={layer.id}
                    className={`w-full p-3 rounded-lg flex items-center space-x-3 ${
                      activeLayer === layer.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveLayer(layer.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-4 h-4 rounded-full ${layer.color}`} />
                    <span>{layer.name}</span>
                  </motion.button>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Legend</h3>
              <div className="space-y-3">
                {[
                  { label: 'Optimal', color: 'bg-green-500' },
                  { label: 'Moderate', color: 'bg-yellow-500' },
                  { label: 'Critical', color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}