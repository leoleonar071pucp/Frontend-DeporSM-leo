import React from "react"

interface ChartDataItem {
  name: string;
  value: number;
}

interface PieChartProps {
  data: ChartDataItem[];
  title: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  // Comprobación de datos vacíos o inválidos
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-4 h-48 flex items-center justify-center">No hay datos para "{title}".</div>;
  }
  const total = data.reduce((acc: number, item: ChartDataItem) => acc + item.value, 0);
  // Permitir gráfico si total es 0, pero mostrar mensaje
  if (total <= 0) {
    return <div className="text-center text-gray-500 py-4 h-48 flex items-center justify-center">El total para "{title}" es cero o negativo.</div>;
  }
  const colors = ["#0cb7f2", "#53d4ff", "#8fe3ff", "#bceeff", "#def7ff"];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">{title}</h3>
      <div className="flex justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((item: ChartDataItem, index: number) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const previousPercentages = total > 0 ? data
                .slice(0, index)
                .reduce((acc: number, curr: ChartDataItem) => acc + (curr.value / total) * 100, 0) : 0;

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={`${-previousPercentages}`}
                  transform="rotate(-90 50 50)"
                />
              )
            })}
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.map((item: ChartDataItem, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
            <span className="text-sm">{item.name}</span>
            <span className="text-sm font-medium ml-auto">{(total > 0 ? (item.value / total) * 100 : 0).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}