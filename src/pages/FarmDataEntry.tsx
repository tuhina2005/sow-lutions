import React, { useState } from 'react';
import PageTransition from '../components/shared/PageTransition';
import FarmDataManager from '../components/admin/FarmDataManager';
import SimpleFarmDataEntry from '../components/simple/SimpleFarmDataEntry';
import FixedFarmDataEntry from '../components/simple/FixedFarmDataEntry';
import UltraSimpleFarmEntry from '../components/simple/UltraSimpleFarmEntry';
import { agritechChatbotService } from '../services/ai/agritech-chatbot.service';

export default function FarmDataEntry() {
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useSimpleForm, setUseSimpleForm] = useState(false);
  const [useFixedForm, setUseFixedForm] = useState(false);
  const [useUltraSimpleForm, setUseUltraSimpleForm] = useState(false);

  const createUserProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        name: 'Demo User',
        email: 'demo@example.com',
        location: 'Punjab, India',
        state: 'Punjab',
        district: 'Ludhiana',
        preferred_language: 'en',
        farm_size: 5.0,
        farming_experience_years: 10
      };

      const newUserId = await agritechChatbotService.createUserProfile(profileData);
      
      if (newUserId) {
        setUserId(newUserId);
        setUserProfile({
          user_id: newUserId,
          ...profileData,
          farms: []
        });
        alert('User profile created successfully! Now you can add farm data.');
      } else {
        alert('Failed to create user profile. Please try again.');
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      alert('Error creating user profile. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataAdded = () => {
    // Refresh user profile or show success message
    alert('Farm data added successfully! You can now get personalized crop recommendations.');
  };

  return (
    <PageTransition>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Farm Data Entry</h1>
          <p className="text-gray-600">
            Add your farm information to get personalized agricultural recommendations from the AI chatbot.
          </p>
        </div>

        {/* Debug Tools */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Having Issues?</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setUseSimpleForm(!useSimpleForm);
                setUseFixedForm(false);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              {useSimpleForm ? 'Use Advanced Form' : 'Use Simple Form'}
            </button>
            <button
              onClick={() => {
                setUseFixedForm(!useFixedForm);
                setUseSimpleForm(false);
                setUseUltraSimpleForm(false);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {useFixedForm ? 'Use Advanced Form' : 'Use Fixed Form (Debug)'}
            </button>
            <button
              onClick={() => {
                setUseUltraSimpleForm(!useUltraSimpleForm);
                setUseSimpleForm(false);
                setUseFixedForm(false);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {useUltraSimpleForm ? 'Use Advanced Form' : 'Ultra Simple (Recommended)'}
            </button>
            <a
              href="/farm-debug"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Debug Tool
            </a>
          </div>
        </div>

        {useUltraSimpleForm ? (
          <UltraSimpleFarmEntry />
        ) : useFixedForm ? (
          <FixedFarmDataEntry />
        ) : useSimpleForm ? (
          <SimpleFarmDataEntry />
        ) : !userId ? (
          <div className="bg-white border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create Your Profile First
            </h2>
            <p className="text-gray-600 mb-6">
              We need to create a user profile before you can add farm data. This will help personalize your agricultural recommendations.
            </p>
            <button
              onClick={createUserProfile}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Profile Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Your Profile</h3>
              <div className="text-sm text-green-700">
                <p><strong>Name:</strong> {userProfile?.name}</p>
                <p><strong>Location:</strong> {userProfile?.location}</p>
                <p><strong>Farm Size:</strong> {userProfile?.farm_size} acres</p>
                <p><strong>User ID:</strong> {userId}</p>
              </div>
            </div>

            {/* Farm Data Manager */}
            <FarmDataManager 
              userId={userId} 
              onDataAdded={handleDataAdded}
            />

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Why This Data Matters</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>Soil Type:</strong> Determines which crops will grow best in your soil</p>
                <p><strong>pH Level:</strong> Affects nutrient availability and crop health</p>
                <p><strong>Location:</strong> Provides weather and climate-specific advice</p>
                <p><strong>Irrigation:</strong> Helps recommend appropriate watering schedules</p>
                <p><strong>Farm Size:</strong> Tailors recommendations for your scale of farming</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Next Steps</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>1. Add your farm data using the form above</p>
                <p>2. Go to the AI Assistant chatbot</p>
                <p>3. Ask questions like "What crops are suitable for my soil?"</p>
                <p>4. Get personalized recommendations based on your data!</p>
              </div>
              <div className="mt-4">
                <a
                  href="/agritech-chatbot"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Go to AI Assistant →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
