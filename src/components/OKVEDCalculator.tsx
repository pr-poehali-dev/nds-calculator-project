import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OKVEDItem {
  code: string;
  name: string;
}

const OKVEDCalculator = () => {
  const [amount, setAmount] = useState<string>('100000');
  const [okvedCode, setOkvedCode] = useState<string>('');
  const [okvedList, setOkvedList] = useState<OKVEDItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [taxSystem, setTaxSystem] = useState<'general' | 'usn'>('general');
  const [vatRate2025, setVatRate2025] = useState<number>(20);
  const [usnRevenue, setUsnRevenue] = useState<number>(100);

  useEffect(() => {
    loadOKVED();
  }, []);

  const loadOKVED = async () => {
    try {
      const loadResponse = await fetch('https://functions.poehali.dev/1ff0e99f-8dbb-4bfa-8c5c-25fc2cf2ade3', {
        method: 'POST'
      });
      await loadResponse.json();

      const response = await fetch('https://functions.poehali.dev/63a16725-a07b-46f3-a4cc-3f086e039f71');
      const data = await response.json();
      setOkvedList(data.items || []);
    } catch (error) {
      console.error('Error loading OKVED:', error);
    }
  };

  const getVatRate2026 = (rate2025: number) => {
    return rate2025 === 20 ? 22 : rate2025;
  };

  const calculateVAT = (baseAmount: number, rate: number) => {
    const vat = (baseAmount * rate) / 100;
    const total = baseAmount + vat;
    return { vat, total };
  };

  const numAmount = parseFloat(amount) || 0;
  
  const vat2025Rate = taxSystem === 'usn' 
    ? (usnRevenue >= 250 ? 7 : 5)
    : vatRate2025;
  
  const vat2026Rate = getVatRate2026(vat2025Rate);

  const result2025 = calculateVAT(numAmount, vat2025Rate);
  const result2026 = calculateVAT(numAmount, vat2026Rate);
  const difference = result2026.total - result2025.total;

  const filteredOKVED = okvedList.filter(item =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedOKVED = okvedList.find(item => item.code === okvedCode);

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-16 space-y-3">
          <h1 className="text-5xl font-light tracking-tight text-[#1d1d1f]">
            НДС
          </h1>
          <p className="text-lg font-light text-[#6e6e73]">
            Расчёт для 2025 и 2026
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-0 shadow-[0_2px_16px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden bg-white">
            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6e6e73] tracking-wide uppercase">
                  ОКВЭД
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    placeholder="Введите код или название"
                    className="h-12 border-0 bg-[#f5f5f7] rounded-xl text-base focus-visible:ring-1 focus-visible:ring-[#0071e3] transition-all"
                  />
                  {isDropdownOpen && (searchQuery ? filteredOKVED : okvedList).length > 0 && (
                    <div className="absolute w-full mt-2 max-h-64 overflow-auto bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-10">
                      {(searchQuery ? filteredOKVED : okvedList).slice(0, 50).map((item) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            setOkvedCode(item.code);
                            setSearchQuery(item.code);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-[#f5f5f7] transition-colors ${
                            okvedCode === item.code ? 'bg-[#f5f5f7]' : ''
                          }`}
                        >
                          <span className="font-medium">{item.code}</span>
                          <span className="text-[#6e6e73] ml-2">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedOKVED && (
                  <p className="text-sm text-[#6e6e73] mt-2 font-light">
                    {selectedOKVED.code} · {selectedOKVED.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#6e6e73] tracking-wide uppercase">
                  Сумма без НДС
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100000"
                    className="h-12 border-0 bg-[#f5f5f7] rounded-xl text-base pr-12 focus-visible:ring-1 focus-visible:ring-[#0071e3] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e6e73] font-light">₽</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-[#f5f5f7] rounded-xl">
                  <button
                    onClick={() => setTaxSystem('general')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      taxSystem === 'general'
                        ? 'bg-white text-[#1d1d1f] shadow-sm'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    Общая система
                  </button>
                  <button
                    onClick={() => setTaxSystem('usn')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                      taxSystem === 'usn'
                        ? 'bg-white text-[#1d1d1f] shadow-sm'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    УСН
                  </button>
                </div>

                {taxSystem === 'general' && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#6e6e73] tracking-wide uppercase">
                        Ставка НДС 2025
                      </label>
                      <Select
                        value={vatRate2025.toString()}
                        onValueChange={(v) => setVatRate2025(Number(v))}
                      >
                        <SelectTrigger className="h-12 border-0 bg-[#f5f5f7] rounded-xl text-base focus:ring-1 focus:ring-[#0071e3]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
                          <SelectItem value="0" className="rounded-lg py-3">0%</SelectItem>
                          <SelectItem value="10" className="rounded-lg py-3">10%</SelectItem>
                          <SelectItem value="20" className="rounded-lg py-3">20%</SelectItem>
                        </SelectContent>
                      </Select>
                      {vatRate2025 === 20 && (
                        <p className="text-xs text-[#6e6e73] font-light">
                          В 2026 изменится на 22%
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {taxSystem === 'usn' && (
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium text-[#6e6e73] tracking-wide uppercase">
                      Доход за год (млн ₽)
                    </label>
                    <Input
                      type="number"
                      value={usnRevenue}
                      onChange={(e) => setUsnRevenue(Number(e.target.value))}
                      placeholder="100"
                      className="h-12 border-0 bg-[#f5f5f7] rounded-xl text-base focus-visible:ring-1 focus-visible:ring-[#0071e3]"
                    />
                    <p className="text-xs text-[#6e6e73] font-light">
                      {usnRevenue >= 60 && usnRevenue <= 250 && 'Ставка 5%'}
                      {usnRevenue > 250 && usnRevenue <= 450 && 'Ставка 7%'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-[0_2px_16px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden bg-white">
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#6e6e73] tracking-wide uppercase">
                    2025
                  </p>
                  <p className="text-4xl font-light text-[#1d1d1f] tracking-tight">
                    {result2025.total.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-[#6e6e73] font-light">₽</p>
                </div>
                <div className="space-y-1 pt-4 border-t border-[#d2d2d7]">
                  <p className="text-xs text-[#6e6e73] font-light">Ставка {vat2025Rate}%</p>
                  <p className="text-xs text-[#6e6e73] font-light">
                    НДС {result2025.vat.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-[0_2px_16px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden bg-white">
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#6e6e73] tracking-wide uppercase">
                    2026
                  </p>
                  <p className="text-4xl font-light text-[#1d1d1f] tracking-tight">
                    {result2026.total.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-[#6e6e73] font-light">₽</p>
                </div>
                <div className="space-y-1 pt-4 border-t border-[#d2d2d7]">
                  <p className="text-xs text-[#6e6e73] font-light">Ставка {vat2026Rate}%</p>
                  <p className="text-xs text-[#6e6e73] font-light">
                    НДС {result2026.vat.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {difference !== 0 && (
            <Card className="border-0 shadow-[0_2px_16px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden bg-gradient-to-br from-[#f5f5f7] to-white">
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-[#6e6e73] tracking-wide">
                    Разница
                  </p>
                  <div className="text-right">
                    <p className="text-2xl font-light text-[#1d1d1f]">
                      +{difference.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                    </p>
                    <p className="text-xs text-[#6e6e73] font-light mt-1">
                      +{((difference / result2025.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OKVEDCalculator;