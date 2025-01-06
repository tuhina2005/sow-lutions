import React, { useState, useEffect } from 'react';

type Disease = { name: string; severity: number };
type Pest = { name: string; infestation: number };
type CropMetrics = {
  idealHeight: number;
  idealBiomass: number;
  idealLAI: number;
  idealNDVI: number;
  npkRatios: { n: number; p: number; k: number };
};

const cropMetrics: Record<string, CropMetrics> = {
  Wheat: {
    idealHeight: 100,
    idealBiomass: 8000,
    idealLAI: 4.0,
    idealNDVI: 0.85,
    npkRatios: { n: 2.8, p: 0.8, k: 1.6 }
  },
  Maize: {
    idealHeight: 250,
    idealBiomass: 12000,
    idealLAI: 5.0,
    idealNDVI: 0.82,
    npkRatios: { n: 3.0, p: 0.5, k: 1.8 }
  },
  Rice: {
    idealHeight: 120,
    idealBiomass: 6000,
    idealLAI: 6.0,
    idealNDVI: 0.89,
    npkRatios: { n: 2.6, p: 0.7, k: 2.0 }
  }
};

const initialDiseases = [
  { name: 'Leaf Rust', severity: 0 },
  { name: 'Powdery Mildew', severity: 0 },
  { name: 'Fusarium Head Blight', severity: 0 }
];

const initialPests = [
  { name: 'Aphids', infestation: 0 },
  { name: 'Stem Borers', infestation: 0 },
  { name: 'Armyworms', infestation: 0 }
];

export default function CropHealthPage() {
  const [plant, setPlant] = useState('Wheat');
  const [height, setHeight] = useState(80);
  const [lai, setLai] = useState(4.0);
  const [biomass, setBiomass] = useState(7500);
  const [ndvi, setNdvi] = useState(0.85);
  const [n, setN] = useState(2.5);
  const [p, setP] = useState(0.8);
  const [k, setK] = useState(1.5);
  const [tacScore, setTacScore] = useState(85);
  const [diseases, setDiseases] = useState<Disease[]>(initialDiseases);
  const [pests, setPests] = useState<Pest[]>(initialPests);

  useEffect(() => {
    const metrics = cropMetrics[plant];
    setHeight(Math.round(metrics.idealHeight * 0.8));
    setBiomass(Math.round(metrics.idealBiomass * 0.8));
    setLai(Number((metrics.idealLAI * 0.8).toFixed(1)));
    setNdvi(Number((metrics.idealNDVI * 0.8).toFixed(2)));
    setN(Number((metrics.npkRatios.n * 0.8).toFixed(1)));
    setP(Number((metrics.npkRatios.p * 0.8).toFixed(1)));
    setK(Number((metrics.npkRatios.k * 0.8).toFixed(1)));
  }, [plant]);

  const calculateScores = () => {
    const metrics = cropMetrics[plant];
    const growthScore = (
      (height / metrics.idealHeight * 100) +
      (lai / metrics.idealLAI * 100)
    ) / 2;

    const nutrientScore = (
      (n / metrics.npkRatios.n * 100 * 0.4) +
      (p / metrics.npkRatios.p * 100 * 0.3) +
      (k / metrics.npkRatios.k * 100 * 0.3)
    );

    const healthImpact = 100 - (
      (diseases.reduce((acc, d) => acc + d.severity, 0) / diseases.length +
      pests.reduce((acc, p) => acc + p.infestation, 0) / pests.length) * 50
    );

    const finalGrade = 0.15 * growthScore + 0.15 * nutrientScore + 0.35 * tacScore + 0.35 * healthImpact;
    return { growthScore, nutrientScore, healthImpact, finalGrade };
  };

  const { growthScore, nutrientScore, healthImpact, finalGrade } = calculateScores();
  const getGrade = (score: number) => score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D';
  const getScoreColor = (score: number) => 
    `text-${score >= 85 ? 'green' : score >= 70 ? 'blue' : score >= 50 ? 'yellow' : 'red'}-600`;

  const InputField = ({ label, value, onChange, step = 1, idealValue }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {idealValue && <span className="text-sm text-gray-500">Ideal: {idealValue}</span>}
      </div>
      <input
        type="number"
        value={value}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Crop Health Analysis</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Plant Selection</h2>
          <select
            value={plant}
            onChange={e => setPlant(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {Object.keys(cropMetrics).map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Height (cm)" 
            value={height} 
            onChange={setHeight} 
            idealValue={cropMetrics[plant].idealHeight}
          />
          <InputField 
            label="LAI" 
            value={lai} 
            onChange={setLai} 
            step={0.1} 
            idealValue={cropMetrics[plant].idealLAI.toFixed(1)}
          />

          <InputField 
            label="Nitrogen (%)" 
            value={n} 
            onChange={setN} 
            step={0.1}
            idealValue={cropMetrics[plant].npkRatios.n.toFixed(1)}
          />
          <InputField 
            label="Phosphorus (%)" 
            value={p} 
            onChange={setP} 
            step={0.1}
            idealValue={cropMetrics[plant].npkRatios.p.toFixed(1)}
          />
          <InputField 
            label="Potassium (%)" 
            value={k} 
            onChange={setK} 
            step={0.1}
            idealValue={cropMetrics[plant].npkRatios.k.toFixed(1)}
          />
          <InputField 
            label="TAC Score" 
            value={tacScore} 
            onChange={setTacScore}
            idealValue="100"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Health Issues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Disease severity</p>
              {diseases.map((disease, i) => (
                <InputField
                  key={disease.name}
                  label={`${disease.name} Severity (0-10)`}
                  value={disease.severity}
                  onChange={(value: number) => {
                    const newDiseases = [...diseases];
                    newDiseases[i].severity = value;
                    setDiseases(newDiseases);
                  }}
                />
              ))}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Pest infestation</p>
              {pests.map((pest, i) => (
                <InputField
                  key={pest.name}
                  label={`${pest.name} Infestation (0-10)`}
                  value={pest.infestation}
                  onChange={(value: number) => {
                    const newPests = [...pests];
                    newPests[i].infestation = value;
                    setPests(newPests);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Analysis Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Growth Score', value: growthScore },
              { label: 'Nutrient Score', value: nutrientScore },
              { label: 'Health Impact', value: healthImpact },
              { label: 'Final Grade', value: finalGrade, showGrade: true }
            ].map(({ label, value, showGrade }) => (
              <div key={label} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">{label}</div>
                <div className={`text-2xl font-bold ${getScoreColor(value)}`}>
                  {value.toFixed(1)}%
                  {showGrade && ` (${getGrade(value)})`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}