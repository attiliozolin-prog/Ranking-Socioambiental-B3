import React from 'react';

interface BadgeProps {
  text: string;
}

export const Badge: React.FC<BadgeProps> = ({ text }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';

  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('ise') || lowerText.includes('ico2') || lowerText.includes('líder') || lowerText.includes('novo mercado')) {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (lowerText.includes('alerta') || lowerText.includes('atenção')) {
    colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
  } else if (lowerText.includes('ofensor') || lowerText.includes('suja') || lowerText.includes('multa')) {
    colorClass = 'bg-red-50 text-red-700 border-red-200';
  }

  return (
    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${colorClass} tracking-wide`}>
      {text}
    </span>
  );
};
