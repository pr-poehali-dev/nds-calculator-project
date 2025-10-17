import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaxInputsProps {
  taxSystem: 'general' | 'usn' | 'psn';
  amount: string;
  setAmount: (value: string) => void;
  vatRate2025: number;
  setVatRate2025: (value: number) => void;
  usnRevenue: number;
  setUsnRevenue: (value: number) => void;
  employeeCount: number;
  setEmployeeCount: (value: number) => void;
}

const TaxInputs = ({
  taxSystem,
  amount,
  setAmount,
  vatRate2025,
  setVatRate2025,
  usnRevenue,
  setUsnRevenue,
  employeeCount,
  setEmployeeCount
}: TaxInputsProps) => {
  return (
    <>
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
          Сумма без НДС
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="h-14 border border-slate-700/30 bg-slate-800/40 backdrop-blur-sm rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300"
        />
      </div>

      {taxSystem === 'general' && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
            Ставка НДС 2025
          </label>
          <Select
            value={vatRate2025.toString()}
            onValueChange={(value) => setVatRate2025(Number(value))}
          >
            <SelectTrigger className="h-14 border border-slate-700/30 bg-slate-800/40 backdrop-blur-sm rounded-2xl text-base px-5 text-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/98 backdrop-blur-xl border-slate-700/50 rounded-2xl">
              <SelectItem value="0" className="text-white hover:bg-slate-800/60">0% (Экспорт)</SelectItem>
              <SelectItem value="10" className="text-white hover:bg-slate-800/60">10% (Льготная)</SelectItem>
              <SelectItem value="20" className="text-white hover:bg-slate-800/60">20% (Стандартная)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {taxSystem === 'usn' && (
        <>
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
              Годовая выручка (млн ₽)
            </label>
            <Input
              type="number"
              value={usnRevenue}
              onChange={(e) => setUsnRevenue(Number(e.target.value))}
              placeholder="0"
              className="h-14 border border-slate-700/30 bg-slate-800/40 backdrop-blur-sm rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
              Количество работников
            </label>
            <Input
              type="number"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(Number(e.target.value))}
              placeholder="0"
              className="h-14 border border-slate-700/30 bg-slate-800/40 backdrop-blur-sm rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300"
            />
          </div>
        </>
      )}
    </>
  );
};

export default TaxInputs;
