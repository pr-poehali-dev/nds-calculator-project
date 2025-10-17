interface TaxSystemSelectorProps {
  taxSystem: 'general' | 'usn' | 'psn';
  setTaxSystem: (value: 'general' | 'usn' | 'psn') => void;
}

const TaxSystemSelector = ({ taxSystem, setTaxSystem }: TaxSystemSelectorProps) => {
  return (
    <div className="space-y-5">
      <label className="text-sm font-medium text-slate-300">Налоговый режим</label>
      <div className="flex gap-2 p-1.5 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/30">
        <button
          onClick={() => setTaxSystem('general')}
          className={`flex-1 h-11 rounded-xl font-medium text-sm transition-all duration-300 ${
            taxSystem === 'general'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          ОСНО
        </button>
        <button
          onClick={() => setTaxSystem('usn')}
          className={`flex-1 h-11 rounded-xl font-medium text-sm transition-all duration-300 ${
            taxSystem === 'usn'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          УСН
        </button>
        <button
          onClick={() => setTaxSystem('psn')}
          className={`flex-1 h-11 rounded-xl font-medium text-sm transition-all duration-300 ${
            taxSystem === 'psn'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          ПСН
        </button>
      </div>
    </div>
  );
};

export default TaxSystemSelector;
