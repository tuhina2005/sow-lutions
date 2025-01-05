import React from 'react';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/shared/Card';
import AreaChart from '../components/analytics/AreaChart';
import { motion } from 'framer-motion';

const cropYieldData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
];

const waterUsageData = [
  { name: 'Jan', value: 200 },
  { name: 'Feb', value: 400 },
  { name: 'Mar', value: 300 },
  { name: 'Apr', value: 500 },
  { name: 'May', value: 400 },
  { name: 'Jun', value: 600 },
];

export default function Analytics() {
  return (
    <PageTransition>
      <div className="p-6">
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Analytics Dashboard
        </motion.h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <AreaChart 
              data={cropYieldData} 
              color="#22c55e" 
              title="Crop Yield Trends"
            />
          </Card>
          
          <Card>
            <AreaChart 
              data={waterUsageData} 
              color="#3b82f6" 
              title="Water Usage Analysis"
            />
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Average Yield', value: '750 kg/ha', color: 'bg-green-100 text-green-800' },
                { label: 'Water Efficiency', value: '85%', color: 'bg-blue-100 text-blue-800' },
                { label: 'Growth Rate', value: '+12%', color: 'bg-purple-100 text-purple-800' },
              ].map((kpi, index) => (
                <motion.div
                  key={kpi.label}
                  className={`p-4 rounded-lg ${kpi.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="text-sm font-medium">{kpi.label}</h4>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}