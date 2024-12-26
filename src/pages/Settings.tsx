import React from 'react';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/shared/Card';
import { motion } from 'framer-motion';
import { Bell, User, Lock, Globe, Database, Palette } from 'lucide-react';

const settingsSections = [
  {
    icon: User,
    title: 'Account Settings',
    description: 'Manage your account information and preferences'
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Configure your notification preferences'
  },
  {
    icon: Lock,
    title: 'Security',
    description: 'Update your security settings and password'
  },
  {
    icon: Globe,
    title: 'Language & Region',
    description: 'Set your preferred language and regional settings'
  },
  {
    icon: Database,
    title: 'Data Management',
    description: 'Manage your data and export options'
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Customize the look and feel of your dashboard'
  }
];

export default function Settings() {
  return (
    <PageTransition>
      <div className="p-6">
        <motion.h1 
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Settings
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full cursor-pointer hover:border-green-500 border-2 border-transparent transition-colors">
                <div className="flex items-start space-x-4">
                  <section.icon className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}