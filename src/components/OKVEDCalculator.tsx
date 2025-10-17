import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Header from './OKVEDCalculator/Header';
import OKVEDSelector from './OKVEDCalculator/OKVEDSelector';
import TaxSystemSelector from './OKVEDCalculator/TaxSystemSelector';
import TaxInputs from './OKVEDCalculator/TaxInputs';
import ResultCards from './OKVEDCalculator/ResultCards';

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
    if (revenue > 250 || employees > 100) return 8;
    return 6;
  };

  const getUSNRate2026 = (revenue: number, employees: number): number => {
    if (revenue < 10) return 0;
    if (revenue > 450 || employees > 130) return 0;
    if (revenue > 250 || employees > 100) return 8;
    return 6;
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
        
        <Header />

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          
          <Card className="border border-slate-800/50 bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:border-slate-700/50 hover:shadow-emerald-500/5">
            <div className="p-8 space-y-8">
              
              <OKVEDSelector
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                okvedList={okvedList}
                filteredOKVED={filteredOKVED}
                okvedCode={okvedCode}
                setOkvedCode={setOkvedCode}
                selectedOKVED={selectedOKVED}
              />

              <TaxSystemSelector
                taxSystem={taxSystem}
                setTaxSystem={setTaxSystem}
              />

              <TaxInputs
                taxSystem={taxSystem}
                amount={amount}
                setAmount={setAmount}
                vatRate2025={vatRate2025}
                setVatRate2025={setVatRate2025}
                usnRevenue={usnRevenue}
                setUsnRevenue={setUsnRevenue}
                employeeCount={employeeCount}
                setEmployeeCount={setEmployeeCount}
              />
            </div>
          </Card>

          <ResultCards
            result2025={result2025}
            result2026={result2026}
            vat2025Rate={vat2025Rate}
            vat2026Rate={vat2026Rate}
            difference={difference}
            taxSystem={taxSystem}
          />
        </div>
      </div>
    </div>
  );
};

export default OKVEDCalculator;
