import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface OKVEDItem {
  code: string;
  name: string;
}

const OKVEDCalculator = () => {
  const [amount, setAmount] = useState<string>('100000');
  const [okvedCode, setOkvedCode] = useState<string>('');
  const [okvedList, setOkvedList] = useState<OKVEDItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Калькулятор НДС по ОКВЭД
          </h1>
          <p className="text-gray-600">
            Сравните расчёт НДС для 2025 и 2026 года
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Calculator" size={24} />
              Расчёт НДС
            </CardTitle>
            <CardDescription>
              Выберите ОКВЭД и систему налогообложения для расчёта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div>
                <Label htmlFor="search">Поиск ОКВЭД</Label>
                <Input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите код или название..."
                />
              </div>
              
              <div>
                <Label htmlFor="okved">Выберите ОКВЭД</Label>
                <Select value={okvedCode} onValueChange={setOkvedCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите из списка..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(searchQuery ? filteredOKVED : okvedList).slice(0, 50).map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.code} - {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedOKVED && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <Icon name="Check" className="inline h-4 w-4 text-green-600 mr-1" />
                    {selectedOKVED.code} - {selectedOKVED.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Сумма без НДС (₽)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100000"
              />
            </div>

            <Tabs value={taxSystem} onValueChange={(v) => setTaxSystem(v as 'general' | 'usn')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Общая система</TabsTrigger>
                <TabsTrigger value="usn">УСН</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    💡 Если ваш доход за последние 3 месяца ≤ 2 млн ₽, вы можете получить освобождение от НДС
                  </p>
                </div>

                <div>
                  <Label htmlFor="rate2025">Ставка НДС 2025 (%)</Label>
                  <Select
                    value={vatRate2025.toString()}
                    onValueChange={(v) => setVatRate2025(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% (Экспорт)</SelectItem>
                      <SelectItem value="10">10% (Льготная)</SelectItem>
                      <SelectItem value="20">20% (Стандартная)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    {vatRate2025 === 20 
                      ? 'В 2026 году ставка повысится до 22%'
                      : 'Ставка не изменится в 2026 году'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="usn" className="space-y-4 mt-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    ⚠️ Применяется с 01.01.2025 только для налогоплательщиков УСН
                  </p>
                </div>

                <div>
                  <Label htmlFor="revenue">Доход за календарный год (млн ₽)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={usnRevenue}
                    onChange={(e) => setUsnRevenue(Number(e.target.value))}
                    placeholder="100"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {usnRevenue < 60 && '❌ УСН НДС не применяется (доход < 60 млн)'}
                    {usnRevenue >= 60 && usnRevenue <= 250 && '✅ Ставка НДС: 5%'}
                    {usnRevenue > 250 && usnRevenue <= 450 && '✅ Ставка НДС: 7%'}
                    {usnRevenue > 450 && '❌ Превышен лимит для УСН (> 450 млн)'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="border-t pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="Calendar" size={20} />
                      2025 год
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ставка НДС:</span>
                      <Badge variant="secondary">{vat2025Rate}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Сумма НДС:</span>
                      <span className="font-semibold">{result2025.vat.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Итого:</span>
                      <span className="font-bold text-green-700">
                        {result2025.total.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="Calendar" size={20} />
                      2026 год
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ставка НДС:</span>
                      <Badge variant="secondary">{vat2026Rate}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Сумма НДС:</span>
                      <span className="font-semibold">{result2026.vat.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Итого:</span>
                      <span className="font-bold text-orange-700">
                        {result2026.total.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {difference !== 0 && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon name="TrendingUp" size={24} className="text-red-600" />
                        <span className="font-semibold text-gray-700">Разница в 2026 году:</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">
                        +{difference.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Увеличение налоговой нагрузки на {((difference / result2025.total) * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Info" size={20} />
              Справочная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-1">Общая система налогообложения (2025):</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>0%</strong> - экспорт, свободная таможенная зона</li>
                <li><strong>10%</strong> - продовольствие, детские товары, медтовары, книги</li>
                <li><strong>20%</strong> - все остальные товары и услуги</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">УСН с НДС (с 01.01.2025):</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>5%</strong> - доход 60-250 млн ₽</li>
                <li><strong>7%</strong> - доход 250-450 млн ₽</li>
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-semibold text-yellow-800 mb-1">Важно!</p>
              <p className="text-yellow-700">
                С 2026 года стандартная ставка НДС 20% повышается до 22%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OKVEDCalculator;