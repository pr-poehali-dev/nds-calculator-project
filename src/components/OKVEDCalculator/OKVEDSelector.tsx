import { Input } from '@/components/ui/input';

interface OKVEDItem {
  code: string;
  name: string;
}

interface OKVEDSelectorProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (value: boolean) => void;
  okvedList: OKVEDItem[];
  filteredOKVED: OKVEDItem[];
  okvedCode: string;
  setOkvedCode: (value: string) => void;
  selectedOKVED?: OKVEDItem;
}

const OKVEDSelector = ({
  searchQuery,
  setSearchQuery,
  isDropdownOpen,
  setIsDropdownOpen,
  okvedList,
  filteredOKVED,
  okvedCode,
  setOkvedCode,
  selectedOKVED
}: OKVEDSelectorProps) => {
  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
        ОКВЭД
      </label>
      <div className="relative group">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          placeholder="Введите код или название"
          className="h-14 border border-slate-700/30 bg-slate-800/40 backdrop-blur-sm rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300"
        />
        {isDropdownOpen && (searchQuery ? filteredOKVED : okvedList).length > 0 && (
          <div className="absolute w-full mt-2 max-h-72 overflow-auto bg-slate-900/98 backdrop-blur-xl rounded-2xl shadow-2xl z-10 border border-slate-700/50">
            {(searchQuery ? filteredOKVED : okvedList).slice(0, 50).map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setOkvedCode(item.code);
                  setSearchQuery(item.code);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-5 py-4 hover:bg-slate-800/60 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl ${
                  okvedCode === item.code ? 'bg-slate-800/60 border-l-2 border-emerald-500' : ''
                }`}
              >
                <span className="font-semibold text-white">{item.code}</span>
                <span className="text-slate-400 ml-3 text-sm">{item.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedOKVED && (
        <p className="text-sm text-slate-500 font-light mt-3">
          {selectedOKVED.code} · {selectedOKVED.name}
        </p>
      )}
    </div>
  );
};

export default OKVEDSelector;
