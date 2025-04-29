
import React from "react";
import { BrandStrategySections } from "../components/strategy/BrandStrategySections";

const StrategyDemo = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Brand Strategy Dashboard</h1>
        <p className="text-gray-600">Define your purpose and maintain your focus with these powerful reminders</p>
      </div>
      
      <BrandStrategySections />
    </div>
  );
};

export default StrategyDemo;
