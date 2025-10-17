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

  const getVatRateByOKVED = (code: string, name: string): number => {
    const lowerName = name.toLowerCase();
    const lowerCode = code.toLowerCase();

    if (lowerCode.startsWith('51') || lowerName.includes('экспорт') || lowerName.includes('международн')) {
      return 0;
    }

    if (
      lowerCode.startsWith('10.') ||
      lowerCode.startsWith('11.') ||
      lowerCode.startsWith('47.2') ||
      lowerName.includes('продовольств') ||
      lowerName.includes('пищев') ||
      lowerName.includes('детск') ||
      lowerName.includes('медицин') ||
      lowerName.includes('лекарств') ||
      lowerName.includes('книж') ||
      lowerName.includes('издател')
    ) {
      return 10;
    }

    return 20;
  };

  const getUSNRate2025 = (revenue: number): number => {
    if (revenue >= 60 && revenue <= 250) return 5;
    if (revenue > 250 && revenue <= 450) return 7;
    return 0;
  };

  const getUSNRate2026 = (revenue: number): number => {
    if (revenue >= 10 && revenue <= 250) return 5;
    if (revenue > 250 && revenue <= 450) return 7;
    return 0;
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
    ? getUSNRate2025(usnRevenue)
    : vatRate2025;
  
  const vat2026Rate = taxSystem === 'usn'
    ? getUSNRate2026(usnRevenue)
    : getVatRate2026(vat2025Rate);

  const result2025 = calculateVAT(numAmount, vat2025Rate);
  const result2026 = calculateVAT(numAmount, vat2026Rate);
  const difference = result2026.total - result2025.total;

  const filteredOKVED = okvedList.filter(item =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedOKVED = okvedList.find(item => item.code === okvedCode);

  useEffect(() => {
    if (selectedOKVED && taxSystem === 'general') {
      const suggestedRate = getVatRateByOKVED(selectedOKVED.code, selectedOKVED.name);
      setVatRate2025(suggestedRate);
    }
  }, [okvedCode, selectedOKVED, taxSystem]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl animate-in fade-in duration-1000">
        
        <div className="text-center mb-20 space-y-4 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block">
            <h1 className="text-7xl sm:text-8xl font-extralight tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900">
              НДС
            </h1>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-6"></div>
          </div>
          <p className="text-xl font-light text-gray-500 tracking-wide">
            Расчёт для 2025 и 2026
          </p>
        </div>

        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-150">
          
          <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="p-8 sm:p-10 space-y-8">
              
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
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
                    className="h-14 border-0 bg-gray-50/50 backdrop-blur-sm rounded-2xl text-base px-5 focus-visible:ring-2 focus-visible:ring-gray-900/10 transition-all duration-300 group-hover:bg-gray-50"
                  />
                  {isDropdownOpen && (searchQuery ? filteredOKVED : okvedList).length > 0 && (
                    <div className="absolute w-full mt-2 max-h-72 overflow-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgb(0,0,0,0.12)] z-10 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      {(searchQuery ? filteredOKVED : okvedList).slice(0, 50).map((item, index) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            setOkvedCode(item.code);
                            setSearchQuery(item.code);
                            setIsDropdownOpen(false);
                          }}
                          style={{ animationDelay: `${index * 20}ms` }}
                          className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl animate-in fade-in slide-in-from-top-1 ${
                            okvedCode === item.code ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span className="font-medium text-gray-900">{item.code}</span>
                          <span className="text-gray-500 ml-3 text-sm">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedOKVED && (
                  <p className="text-sm text-gray-400 font-light mt-3 animate-in fade-in duration-300">
                    {selectedOKVED.code} · {selectedOKVED.name}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
                  Сумма без НДС
                </label>
                <div className="relative group">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100 000"
                    className="h-14 border-0 bg-gray-50/50 backdrop-blur-sm rounded-2xl text-base pr-16 px-5 focus-visible:ring-2 focus-visible:ring-gray-900/10 transition-all duration-300 group-hover:bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-light text-base">₽</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex gap-3 p-1.5 bg-gray-50/50 backdrop-blur-sm rounded-2xl">
                  <button
                    onClick={() => setTaxSystem('general')}
                    className={`flex-1 py-3.5 px-5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      taxSystem === 'general'
                        ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgb(0,0,0,0.04)]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Общая система
                  </button>
                  <button
                    onClick={() => setTaxSystem('usn')}
                    className={`flex-1 py-3.5 px-5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      taxSystem === 'usn'
                        ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgb(0,0,0,0.04)]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    УСН
                  </button>
                </div>

                {taxSystem === 'general' && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
                      Ставка НДС 2025
                    </label>
                    <Select
                      value={vatRate2025.toString()}
                      onValueChange={(v) => setVatRate2025(Number(v))}
                    >
                      <SelectTrigger className="h-14 border-0 bg-gray-50/50 backdrop-blur-sm rounded-2xl text-base focus:ring-2 focus:ring-gray-900/10 transition-all duration-300 hover:bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-0 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgb(0,0,0,0.12)]">
                        <SelectItem value="0" className="rounded-xl py-3 focus:bg-gray-50">0%</SelectItem>
                        <SelectItem value="10" className="rounded-xl py-3 focus:bg-gray-50">10%</SelectItem>
                        <SelectItem value="20" className="rounded-xl py-3 focus:bg-gray-50">20%</SelectItem>
                      </SelectContent>
                    </Select>
                    {vatRate2025 === 0 && (
                      <p className="text-xs text-gray-400 font-light mt-2 animate-in fade-in duration-300">
                        Экспорт, международные перевозки, товары в свободной таможенной зоне
                      </p>
                    )}
                    {vatRate2025 === 10 && (
                      <p className="text-xs text-gray-400 font-light mt-2 animate-in fade-in duration-300">
                        Продовольствие, детские товары, медицина, книги и периодика
                      </p>
                    )}
                    {vatRate2025 === 20 && (
                      <p className="text-xs text-gray-400 font-light mt-2 animate-in fade-in duration-300">
                        В 2026 повысится до 22%
                      </p>
                    )}
                  </div>
                )}

                {taxSystem === 'usn' && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
                      Доход за год (млн ₽)
                    </label>
                    <Input
                      type="number"
                      value={usnRevenue}
                      onChange={(e) => setUsnRevenue(Number(e.target.value))}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        if (input.value.startsWith('0') && input.value.length > 1) {
                          input.value = input.value.replace(/^0+/, '');
                          setUsnRevenue(Number(input.value));
                        }
                      }}
                      placeholder="100"
                      className="h-14 border-0 bg-gray-50/50 backdrop-blur-sm rounded-2xl text-base px-5 focus-visible:ring-2 focus-visible:ring-gray-900/10 transition-all duration-300 hover:bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {usnRevenue >= 10 && usnRevenue < 60 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2 animate-in fade-in duration-300">
                        <p className="text-xs text-amber-800 font-medium">
                          ⚠️ С 2026 года порог УСН снижается до 10 млн ₽
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          При доходе {usnRevenue} млн ₽ в 2025 году УСН не применяется, нужен переход на ОСНО
                        </p>
                      </div>
                    )}
                    {usnRevenue >= 60 && usnRevenue <= 250 && (
                      <div className="text-xs text-gray-600 font-light mt-2 space-y-1 animate-in fade-in duration-300">
                        <p>2025: Ставка 5%</p>
                        <p className="text-green-600">2026: Ставка 5% (порог снизился до 10 млн)</p>
                      </div>
                    )}
                    {usnRevenue > 250 && usnRevenue <= 450 && (
                      <p className="text-xs text-gray-600 font-light mt-2 animate-in fade-in duration-300">
                        Ставка 7% (доход превышает 250 млн)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:scale-[1.02]">
              <div className="p-8 space-y-8">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
                    2025
                  </p>
                  <div className="space-y-1">
                    <p className="text-5xl font-extralight text-gray-900 tracking-tight">
                      {result2025.total.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-400 font-light">рублей</p>
                  </div>
                </div>
                <div className="space-y-2 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Ставка</span>
                    <span className="text-gray-600 font-medium">{vat2025Rate}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">НДС</span>
                    <span className="text-gray-600 font-medium">{result2025.vat.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:scale-[1.02]">
              <div className="p-8 space-y-8">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
                    2026
                  </p>
                  <div className="space-y-1">
                    <p className="text-5xl font-extralight text-gray-900 tracking-tight">
                      {result2026.total.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-sm text-gray-400 font-light">рублей</p>
                  </div>
                </div>
                <div className="space-y-2 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Ставка</span>
                    <span className="text-gray-600 font-medium">{vat2026Rate}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">НДС</span>
                    <span className="text-gray-600 font-medium">{result2026.vat.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {difference !== 0 && (
            <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 tracking-[0.1em] uppercase">
                      Разница
                    </p>
                    <p className="text-sm text-gray-300 font-light">
                      Увеличение в 2026 году
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-3xl font-light text-white">
                      +{difference.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-gray-400">₽</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">+{((difference / result2025.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="text-center mt-16 animate-in fade-in duration-1000 delay-700">
          <p className="text-xs text-gray-400 font-light">
            Данные актуальны на октябрь 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default OKVEDCalculator;