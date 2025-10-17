import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ResultCardsProps {
  result2025: { vat: number; total: number };
  result2026: { vat: number; total: number };
  vat2025Rate: number;
  vat2026Rate: number;
  difference: number;
  taxSystem: 'general' | 'usn' | 'psn';
}

const ResultCards = ({
  result2025,
  result2026,
  vat2025Rate,
  vat2026Rate,
  difference,
  taxSystem
}: ResultCardsProps) => {
  const getTaxSystemLabel = () => {
    switch (taxSystem) {
      case 'general':
        return 'НДС';
      case 'usn':
        return 'УСН';
      case 'psn':
        return 'ПСН';
      default:
        return 'Налог';
    }
  };

  return (
    <>
      <Card className="border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/30">
              <Icon name="Calendar" className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">2025</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Текущий год</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-sm text-slate-400">Ставка {getTaxSystemLabel()}</span>
              <span className="text-2xl font-bold text-white">{vat2025Rate}%</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-slate-400">{getTaxSystemLabel()}</span>
              <span className="text-xl font-semibold text-blue-400">{result2025.vat.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="pt-6 border-t border-slate-700/50">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-slate-300">Итого с {getTaxSystemLabel()}</span>
                <span className="text-3xl font-bold text-white">{result2025.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/30">
              <Icon name="TrendingUp" className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">2026</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Следующий год</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-sm text-slate-400">Ставка {getTaxSystemLabel()}</span>
              <span className="text-2xl font-bold text-white">{vat2026Rate}%</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-slate-400">{getTaxSystemLabel()}</span>
              <span className="text-xl font-semibold text-purple-400">{result2026.vat.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="pt-6 border-t border-slate-700/50">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-slate-300">Итого с {getTaxSystemLabel()}</span>
                <span className="text-3xl font-bold text-white">{result2026.total.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2 border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${difference > 0 ? 'from-rose-500/20 to-rose-600/10 border-rose-500/30' : 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30'} flex items-center justify-center border`}>
              <Icon name={difference > 0 ? "TrendingUp" : "TrendingDown"} className={`w-5 h-5 ${difference > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">Разница</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider">2026 vs 2025</p>
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-5xl sm:text-6xl font-bold mb-3">
              <span className={difference > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {difference > 0 ? '+' : ''}{difference.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {difference > 0 
                ? `В 2026 году вы заплатите на ${Math.abs(difference).toLocaleString('ru-RU')} ₽ больше` 
                : difference < 0 
                ? `В 2026 году вы сэкономите ${Math.abs(difference).toLocaleString('ru-RU')} ₽`
                : 'Разницы в налогах нет'
              }
            </p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ResultCards;
