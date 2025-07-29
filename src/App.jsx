// App.jsx
// This is the main component that holds the state and logic of the application.

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

// Main App Component
export default function App() {
  // State for all user inputs with default values
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 65,
    annualSalary: 80000,
    salaryGrowth: 3, // in percent
    monthlyExpenses: 2500,
    currentSavings: 50000,
    investmentReturn: 7, // in percent
    inflationRate: 2.5, // in percent
  });

  // State to hold the calculated results
  const [results, setResults] = useState(null);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
  };

  const handleCalculation = (e) => {
    e.preventDefault();
    // --- Core Financial Calculation Logic ---

    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    if (yearsToRetirement < 0) {
        alert("Retirement age must be greater than current age.");
        return;
    }

    const annualExpenses = inputs.monthlyExpenses * 12;
    const inflation = inputs.inflationRate / 100;
    const growthRate = inputs.salaryGrowth / 100;
    const returnRate = inputs.investmentReturn / 100;

    // 1. Calculate the required savings goal (FI Number) at retirement
    // This is based on the 4% rule (annual expenses * 25)
    const expensesAtRetirement = annualExpenses * Math.pow(1 + inflation, yearsToRetirement);
    const fiNumber = expensesAtRetirement * 25;

    // 2. Project the growth of savings year by year
    let projectedSavings = inputs.currentSavings;
    let currentSalary = inputs.annualSalary;
    let projectionData = []; // For the chart

    for (let i = 0; i < yearsToRetirement; i++) {
        const age = inputs.currentAge + i;
        
        // Calculate savings for the current year
        const annualSavings = currentSalary - annualExpenses;
        
        // Add savings to the total and apply investment returns
        projectedSavings += annualSavings;
        projectedSavings *= (1 + returnRate);

        // Update salary for the next year
        currentSalary *= (1 + growthRate);

        // Store data for the chart
        projectionData.push({
            age: age + 1,
            savings: Math.round(projectedSavings),
            goal: Math.round(fiNumber),
        });
    }

    setResults({
        fiNumber,
        expensesAtRetirement,
        projectedSavings,
        isOnTrack: projectedSavings >= fiNumber,
        projectionData,
    });
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-3xl font-bold text-center text-blue-600">Financial Independence Calculator</h1>
          <p className="text-center text-gray-500 mt-1">Plan your journey to financial freedom.</p>
        </div>
      </header>

      <main className="container mx-auto p-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- Input Form --- */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Your Financial Details</h2>
            <form onSubmit={handleCalculation} className="space-y-4">
              <InputField label="Current Age" name="currentAge" value={inputs.currentAge} onChange={handleInputChange} />
              <InputField label="Target Retirement Age" name="retirementAge" value={inputs.retirementAge} onChange={handleInputChange} />
              <InputField label="Current Annual Salary ($)" name="annualSalary" value={inputs.annualSalary} onChange={handleInputChange} type="number" />
              <InputField label="Annual Salary Growth (%)" name="salaryGrowth" value={inputs.salaryGrowth} onChange={handleInputChange} type="number" step="0.1" />
              <InputField label="Current Monthly Expenses ($)" name="monthlyExpenses" value={inputs.monthlyExpenses} onChange={handleInputChange} type="number" />
              <InputField label="Current Savings/Investments ($)" name="currentSavings" value={inputs.currentSavings} onChange={handleInputChange} type="number" />
              <InputField label="Expected Investment Return (%)" name="investmentReturn" value={inputs.investmentReturn} onChange={handleInputChange} type="number" step="0.1" />
              <InputField label="Expected Inflation Rate (%)" name="inflationRate" value={inputs.inflationRate} onChange={handleInputChange} type="number" step="0.1" />
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105">
                Calculate My Path
              </button>
            </form>
          </div>

          {/* --- Results Display --- */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Your Projection</h2>
            {results ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-lg text-center ${results.isOnTrack ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="font-bold text-lg">{results.isOnTrack ? "Congratulations! You're on track to reach your goal." : "You may need to adjust your plan to reach your goal."}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <ResultCard label="FI Number (Your Goal)" value={formatCurrency(results.fiNumber)} />
                  <ResultCard label="Projected Savings at Retirement" value={formatCurrency(results.projectedSavings)} />
                  <ResultCard label="Annual Expenses at Retirement" value={formatCurrency(results.expensesAtRetirement)} />
                  <ResultCard label="Years to Retirement" value={inputs.retirementAge - inputs.currentAge} isPlain={true} />
                </div>
                <div className="h-80 w-full mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={results.projectionData} margin={{ top: 5, right: 20, left: 30, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age">
                                <Label value="Age" offset={-15} position="insideBottom" />
                            </XAxis>
                            <YAxis tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`}>
                                 <Label value="Savings (Millions)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                            </YAxis>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend verticalAlign="top" height={36}/>
                            <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} name="Your Projected Savings" dot={false}/>
                            <Line type="monotone" dataKey="goal" stroke="#10b981" strokeWidth={2} name="Financial Independence Goal" dot={false}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                <p>Enter your financial details and click "Calculate" to see your path to financial independence.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components ---

// A reusable input field component
const InputField = ({ label, name, value, onChange, type = "number", step = "1" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      step={step}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

// A reusable card to display a single result
const ResultCard = ({ label, value, isPlain = false }) => (
    <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`font-bold text-xl ${isPlain ? 'text-gray-800' : 'text-blue-600'}`}>{value}</p>
    </div>
);

// --- Utility Functions ---

// Formats a number into a currency string
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
};

