import React, { useState } from 'react';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/shared/Card';
import AreaChart from '../components/analytics/AreaChart';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { fetchAnalyticsData } from '../services/analytics';

const regions = ['Coimbatore', 'Thiruvarur', 'Nagapattinam', 'Theni', 'Cuddalore', 'Kancheepuram', 'Thiruvannamalai', 'Villupuram', 'Vellore', 'Thanjavur', 'Salem', 'Ramanathapuram', 'Madurai', 'Nagercoil (Kannyiakumari)', 'Erode', 'Ariyalur', 'Dindigul', 'Namakkal', 'Thiruvellore', 'Pudukkottai', 'Virudhunagar', 'Dharmapuri'];

const crops = ['Paddy(Dhan)(Common)', 'Maize', 'Jowar(Sorghum)', 'Bengal Gram(Gram)(Whole)', 'Black Gram (Urd Beans)(Whole)', 'Green Gram (Moong)(Whole)', 'Groundnut', 'Sesamum(Sesame,Gingelly,Til)', 'Soyabean', 'Sunflower', 'Cotton', 'Banana', 'Bajra(Pearl Millet/Cumbu)', 'Ragi (Finger Millet)', 'Cashewnuts', 'Turmeric', 'Coffee', 'Arhar (Tur/Red Gram)(Whole)', 'Green Peas', 'Gur(Jaggery)', 'Cowpea (Lobia/Karamani)', 'Rubber', 'Kulthi(Horse Gram)', 'Karamani', 'Thinai (Italian Millet)', 'T.V. Cumbu', 'Castor Seed', 'Neem Seed', 'Copra', 'Dry Chillies', 'Coconut', 'Arecanut(Betelnut/Supari)', 'Tobacco', 'Sugarcane', 'Tamarind Fruit', 'Black Gram Dal (Urd Dal)', 'Green Gram Dal (Moong Dal)', 'Ground Nut Seed', 'Groundnut pods (raw)', 'Groundnut (Split)', 'Ginger(Dry)', 'Coriander(Leaves)', 'Cotton Seed', 'Tapioca', 'Corriander seed', 'Pepper ungarbled', 'Kodo Millet(Varagu)', 'Hybrid Cumbu', 'Beaten Rice', 'Avare Dal', 'Gingelly Oil', 'Elephant Yam (Suran)', 'Paddy(Dhan)(Basmati)', 'Onion', 'Chili Red', 'Brinjal', 'Black pepper', 'Tomato', 'Bottle gourd', 'Coconut Seed', 'White Pumpkin', 'Raddish', 'Bengal Gram Dal (Chana Dal)', 'Spinach', 'Kabuli Chana(Chickpeas-White)'];

export default function Analytics() {
  const [region, setRegion] = useState('');
  const [crop, setCrop] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    yieldData: Array<{ name: string; value: number }> | null;
    waterData: Array<{ name: string; value: number }> | null;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await fetchAnalyticsData(region, crop);
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(data);
  // Safe calculations and checks
  const averagePrice = data?.yieldData && data?.yieldData.length > 0
    ? Math.round(data.yieldData.reduce((acc, curr) => acc + curr.value, 0) / data.yieldData.length)
    : 0;

  const bestDayIndex = data?.yieldData
    ? data.yieldData.map(item => item.value).indexOf(Math.max(...data.yieldData.map(item => item.value)))
    : -1;

  const bestDay = bestDayIndex !== -1
    ? new Date(Date.now() + (bestDayIndex + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <PageTransition>
      <div className="p-6">
        <motion.h1
          className="text-3xl font-bold mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Price Predictions
        </motion.h1>

        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Region
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Choose a region</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="crop" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Crop
                </label>
                <select
                  id="crop"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Choose a crop</option>
                  {crops.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Generate Analytics'
                )}
              </button>
            </div>
          </form>
        </Card>

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
            <AreaChart
                data={data.yieldData || []}
                color="#22c55e"
                title={`${crop} Price Trends - ${region}`}
              />
            </Card>
            {/* <Card style="padding-bottom:20px;">
            <AreaChart
                data={data.waterData || []}
                color="#22c55e"
                title={`${crop} Price Trends - ${region}`}
              />
            </Card> */}

            <Card className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{
                  label: 'Average Price',
                  value: `${averagePrice} Rupees`,
                  color: 'bg-green-100 text-green-800',
                }, {
                  label: 'Best day to sell',
                  value: bestDay,
                  color: 'bg-blue-100 text-blue-800',
                }].map((kpi, index) => (
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
        )}
      </div>
    </PageTransition>
  );
}
