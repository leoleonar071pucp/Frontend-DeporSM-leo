import React from "react"

interface ChartDataItem {
  name: string;
  value: number;
}

interface LineChartProps {
  data: ChartDataItem[];
  title: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  // Comprobación de datos vacíos o inválidos
  if (!data || data.length < 2) { // Necesita al menos 2 puntos para una línea
    return <div className="text-center text-gray-500 py-4 h-64 flex items-center justify-center">Datos insuficientes para "{title}".</div>;
  }
  const maxValue = Math.max(...data.map((d: ChartDataItem) => d.value));
  // Permitir gráfico si maxValue es 0, pero ajustar cálculo
  const safeMaxValue = maxValue <= 0 ? 1 : maxValue;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">{title}</h3>
      <div className="h-64 relative">
        <svg className="w-full h-full">
          <polyline
            points={data
              .map(
                (item: ChartDataItem, index: number) =>
                  `${(index / (data.length - 1)) * 100}, ${100 - (item.value / safeMaxValue) * 100}`,
              )
              .join(" ")}
            fill="none"
            stroke="#0cb7f2"
            strokeWidth="2"
          />
          {data.map((item: ChartDataItem, index: number) => (
            <circle
              key={index}
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={`${100 - (item.value / safeMaxValue) * 100}%`}
              r="3"
              fill="#0cb7f2"
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {data.map((item: ChartDataItem, index: number) => (
            <div key={index} className="text-xs text-gray-500">
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}