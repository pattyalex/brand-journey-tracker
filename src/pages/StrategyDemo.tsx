
import React from "react";
import { BrandStrategySections } from "../components/strategy/BrandStrategySections";

const StrategyDemo = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Brand Strategy Dashboard</h1>
        <p className="text-gray-600">Define your purpose and maintain your focus with these powerful reminders</p>
      </div>
      
      <BrandStrategySections />
    </div>
  );
};

export default StrategyDemo;
