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
  const [taxSystem, setTaxSystem] = useState<'general' | 'usn' | 'psn'>('general');
  const [vatRate2025, setVatRate2025] = useState<number>(20);
  const [usnRevenue, setUsnRevenue] = useState<number>(100);
  const [employeeCount, setEmployeeCount] = useState<number>(5);

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

  const getUSNRate2025 = (revenue: number, employees: number): number => {
    if (revenue < 60) return 0;
    if (revenue > 450 || employees > 130) return 0;
    if (revenue <= 250 && employees <= 100) return 6;
    if (revenue > 250 && revenue <= 450 && employees > 100 && employees <= 130) return 8;
    return 0;
  };

  const getUSNRate2026 = (revenue: number, employees: number): number => {
    if (revenue < 10) return 0;
    if (revenue > 450 || employees > 130) return 0;
    if (revenue <= 250 && employees <= 100) return 6;
    if (revenue > 250 && revenue <= 450 && employees > 100 && employees <= 130) return 8;
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
    ? getUSNRate2025(usnRevenue, employeeCount)
    : taxSystem === 'psn'
    ? 6
    : vatRate2025;
  
  const vat2026Rate = taxSystem === 'usn'
    ? getUSNRate2026(usnRevenue, employeeCount)
    : taxSystem === 'psn'
    ? 6
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl animate-in fade-in duration-1000">
        
        <div className="text-center mb-16 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-400/60 tracking-[0.2em] uppercase">НДС Калькулятор</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-light tracking-tight text-white/95">
            Сравнение налогов
          </h1>
          <p className="text-lg font-light text-slate-400">
            2025 vs 2026
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          
          <Card className="border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:border-slate-700/50 hover:shadow-emerald-500/5">
            <div className="p-8 space-y-8">
              
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

              <div className="space-y-5">
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

                {taxSystem === 'general' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
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
                        className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
                        Количество сотрудников
                      </label>
                      <Input
                        type="number"
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(Number(e.target.value))}
                        placeholder="5"
                        className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
                        Ставка НДС 2025
                      </label>
                      <div className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl flex items-center px-5">
                        <span className="text-white text-base font-medium">{vatRate2025}%</span>
                        <span className="ml-auto text-slate-500 text-sm">автоматически по ОКВЭД</span>
                      </div>
                    </div>
                  </div>
                )}

                {taxSystem === 'usn' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
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
                        className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
                        Количество сотрудников
                      </label>
                      <Input
                        type="number"
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(Number(e.target.value))}
                        placeholder="5"
                        className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {employeeCount > 130 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                          <p className="text-xs text-red-400 font-semibold">
                            ⚠️ Превышен лимит УСН
                          </p>
                          <p className="text-xs text-red-300/80 mt-1">
                            При количестве сотрудников {employeeCount} УСН не применяется (максимум 130 чел.)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
                        Ставка НДС 2025
                      </label>
                      <div className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl flex items-center px-5">
                        <span className="text-white text-base font-medium">{vat2025Rate}%</span>
                        <span className="ml-auto text-slate-500 text-sm">автоматически</span>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <p className="text-xs text-blue-400 font-semibold mb-2">
                        ℹ️ Упрощенная система налогообложения (УСН)
                      </p>
                      <ul className="text-xs text-blue-300/80 space-y-1">
                        <li>• Базовая ставка: 6%</li>
                        <li>• Повышенная ставка: 8% (при доходе 250-450 млн или 100-130 сотрудников)</li>
                        <li>• Лимит дохода: до 450 млн ₽/год</li>
                        <li>• Макс. сотрудников: 130 человек</li>
                        <li>• Только для ИП и ООО</li>
                      </ul>
                    </div>

                    {usnRevenue >= 10 && usnRevenue < 60 && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                        <p className="text-xs text-amber-400 font-semibold">
                          ⚠️ С 2026 года порог УСН снижается до 10 млн ₽
                        </p>
                        <p className="text-xs text-amber-300/80 mt-1">
                          При доходе {usnRevenue} млн ₽ в 2025 году УСН не применяется, нужен переход на ОСНО
                        </p>
                      </div>
                    )}

                    {(usnRevenue > 450 || employeeCount > 130) && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-xs text-red-400 font-semibold">
                          ⚠️ Превышены лимиты УСН
                        </p>
                        <p className="text-xs text-red-300/80 mt-1">
                          {usnRevenue > 450 && `Доход ${usnRevenue} млн ₽ превышает лимит 450 млн. `}
                          {employeeCount > 130 && `Сотрудников ${employeeCount} превышает лимит 130 чел.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {taxSystem === 'psn' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
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
                        placeholder="30"
                        className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
                        Количество сотрудников
                      </label>
                      <Input
                        type="number"
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(Number(e.target.value))}
                        placeholder="5"
                        className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl text-base px-5 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {employeeCount > 15 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                          <p className="text-xs text-red-400 font-semibold">
                            ⚠️ Превышен лимит ПСН
                          </p>
                          <p className="text-xs text-red-300/80 mt-1">
                            При количестве сотрудников {employeeCount} патент не применяется (максимум 15 чел.)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">
                        Ставка НДС 2025
                      </label>
                      <div className="h-14 border border-slate-700/30 bg-slate-800/40 rounded-2xl flex items-center px-5">
                        <span className="text-white text-base font-medium">{vat2025Rate}%</span>
                        <span className="ml-auto text-slate-500 text-sm">автоматически</span>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <p className="text-xs text-blue-400 font-semibold mb-2">
                        ℹ️ Патентная система (ПСН)
                      </p>
                      <ul className="text-xs text-blue-300/80 space-y-1">
                        <li>• Фиксированная ставка 6%</li>
                        <li>• Лимит дохода до 60 млн ₽/год</li>
                        <li>• Только для ИП</li>
                        <li>• Не более 15 работников</li>
                      </ul>
                    </div>

                    {usnRevenue > 60 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-xs text-red-400 font-semibold">
                          ⚠️ Превышен лимит ПСН
                        </p>
                        <p className="text-xs text-red-300/80 mt-1">
                          При доходе {usnRevenue} млн ₽ патент не применяется (максимум 60 млн)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 to-slate-900/40 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 rounded-3xl overflow-hidden p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400/80 tracking-[0.15em] uppercase">2025</span>
                  <span className="text-xs font-medium text-emerald-400/60 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {vat2025Rate}%
                  </span>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400 mb-2">Сумма НДС</div>
                  <div className="text-4xl font-light text-white tracking-tight">
                    {result2025.vat.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Итого с НДС</div>
                  <div className="text-3xl font-light text-emerald-400">
                    {result2025.total.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-teal-500/20 bg-gradient-to-br from-teal-950/40 to-slate-900/40 backdrop-blur-xl shadow-2xl shadow-teal-500/5 rounded-3xl overflow-hidden p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-400/80 tracking-[0.15em] uppercase">2026</span>
                  <span className="text-xs font-medium text-teal-400/60 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
                    {vat2026Rate}%
                  </span>
                </div>
                
                <div>
                  <div className="text-sm text-slate-400 mb-2">Сумма НДС</div>
                  <div className="text-4xl font-light text-white tracking-tight">
                    {result2026.vat.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

                <div>
                  <div className="text-sm text-slate-400 mb-2">Итого с НДС</div>
                  <div className="text-3xl font-light text-teal-400">
                    {result2026.total.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className={`border ${
          difference > 0 
            ? 'border-red-500/30 bg-gradient-to-br from-red-950/30 to-slate-900/30' 
            : difference < 0 
            ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900/30'
            : 'border-slate-700/30 bg-gradient-to-br from-slate-900/30 to-slate-900/30'
        } backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden p-8 transition-all duration-500`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 tracking-[0.15em] uppercase">
                Разница
              </div>
              <div className={`text-5xl font-light tracking-tight ${
                difference > 0 ? 'text-red-400' : difference < 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {difference > 0 ? '+' : ''}{difference.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            
            {difference !== 0 && (
              <div className={`px-6 py-3 rounded-2xl font-medium text-sm ${
                difference > 0 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {difference > 0 ? 'Налог вырастет' : 'Налог снизится'}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OKVEDCalculator;