import React from 'react';

interface MetricGaugeProps {
  title: string;
  subtitle: string;
  value: string;
  unit: string;
  min: string;
  max: string;
}

export function MetricGauge({
  title,
  subtitle,
  value,
  unit,
  min,
  max,
}: MetricGaugeProps) {
  const valueNum = parseFloat(value);
  const minNum = parseFloat(min);
  const maxNum = parseFloat(max);
  const range = maxNum - minNum;

  const percentValue = range === 0 ? 0 : (valueNum - minNum) / range;
  const angle = -90 + percentValue * 180;

  return (
    <div className="w-60 p-4 bg-white rounded shadow space-y-3">
      {/* Título à esquerda */}
      <div className="text-left">
        <div className="text-sm font-bold text-gray-800">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>

      {/* Semicírculo centralizado */}
      <div className="relative w-full h-24 flex justify-center items-end">
        {/* Gauge SVG */}
        <svg width="100%" height="100%" viewBox="0 0 200 100" className="absolute top-0 left-0">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {/* Verde: 0% a 20% */}
              <stop offset="0%" stopColor="#4caf50" />
              <stop offset="20%" stopColor="#4caf50" />

              {/* Amarelo: 33% a 66% */}
              <stop offset="40%" stopColor="#ffeb3b" />
              <stop offset="70%" stopColor="#ffeb3b" />

              {/* Vermelho: 66% a 100% */}
              <stop offset="90%" stopColor="#d32f2f" />
              <stop offset="100%" stopColor="#d32f2f" />
            </linearGradient>
          </defs>
          <path
            d="M10,100 A90,90 0 0,1 190,100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="20"
          />
        </svg>

        {/* Ponteiro */}
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
            {/* Arrowhead */}
            <polygon points="4,0 8,8 0,8" fill="black" />
            {/* Stem */}
            <rect x="3" y="8" width="2" height="42" fill="black" />
          </svg>
        </div>

        {/* Valor abaixo do centro */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
          <div className="bg-white px-3 py-1 rounded shadow font-semibold">
            {unit}<span className="text-lg">{value}</span>
          </div>
        </div>

        {/* Min / Max */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
          <span>{unit}{min}</span>
          <span>{unit}{max}</span>
        </div>
      </div>
    </div>
  );
}
