
import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricGaugeProps {
  title: string;
  subtitle: string;
  value: string;
  unit: string;
  min: string;
  max: string;
  invertGradient?: boolean;
}

export function MetricGauge({
  title,
  subtitle,
  value,
  unit,
  min,
  max,
  invertGradient = false,
}: MetricGaugeProps) {
  const valueNum = parseFloat(value);
  const minNum = parseFloat(min);
  const maxNum = parseFloat(max);
  const range = maxNum - minNum;

  const percentValue = range === 0 ? 0 : (valueNum - minNum) / range;
  const angle = -90 + percentValue * 180;

  return (
    <div className="w-60 p-4 bg-white rounded shadow space-y-3">
      <div className="text-left">
        <div className="text-sm font-bold text-gray-800">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>

      <div className="relative w-full h-24 flex justify-center items-end">
        <svg width="100%" height="100%" viewBox="0 0 200 100" className="absolute top-0 left-0">
          <defs>
            <linearGradient id={`gaugeGradient${invertGradient ? 'Inverted' : ''}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {invertGradient ? (
                <>
                  <stop offset="0%" stopColor="#d32f2f" />
                  <stop offset="40%" stopColor="#ffeb3b" />
                  <stop offset="100%" stopColor="#4caf50" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#4caf50" />
                  <stop offset="40%" stopColor="#ffeb3b" />
                  <stop offset="100%" stopColor="#d32f2f" />
                </>
              )}
            </linearGradient>
          </defs>
          <path
            d="M10,100 A90,90 0 0,1 190,100"
            fill="none"
            stroke={`url(#gaugeGradient${invertGradient ? 'Inverted' : ''})`}
            strokeWidth="20"
          />
        </svg>

        <div
          className="absolute"
          style={{
            bottom: '24px',
            left: '50%',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.5s ease-out',
          }}
        >
          <svg width="8" height="50" viewBox="0 0 8 50">
            <polygon points="4,0 8,8 0,8" fill="black" />
            <rect x="3" y="8" width="2" height="42" fill="black" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
          <div className="bg-white px-3 py-1 rounded shadow font-semibold">
            {unit}<span className="text-lg">{value}</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
          <span>{unit}{min}</span>
          <span>{unit}{max}</span>
        </div>
      </div>
    </div>
  );
}
