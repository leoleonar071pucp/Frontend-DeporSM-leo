import React from "react"

interface ChartDataItem {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartDataItem[];
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  // Comprobación de datos vacíos o inválidos
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-4 h-32 flex items-center justify-center">No hay datos para "{title}".</div>;
  }
  const maxValue = Math.max(...data.map((d: ChartDataItem) => d.value));
  // Permitir gráfico con valor 0, pero mostrar mensaje si todos son <= 0
  if (data.every(d => d.value <= 0)) {
     return <div className="text-center text-gray-500 py-4 h-32 flex items-center justify-center">Valores cero o negativos para "{title}".</div>;
  }
  // Usar 1 si maxValue es 0 o negativo para evitar división por cero en style
  const safeMaxValue = maxValue <= 0 ? 1 : maxValue;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">{title}</h3>
      <div className="space-y-2">
        {data.map((item: ChartDataItem, index: number) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.name}</span>
              <span className="font-medium">{item.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${(item.value / safeMaxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}