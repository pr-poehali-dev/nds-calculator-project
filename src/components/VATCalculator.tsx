import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface OKVEDItem {
  code: string;
  name: string;
}

const VATCalculator = () => {
  const [amount, setAmount] = useState<string>('100000');
  const [okvedCode, setOkvedCode] = useState<string>('');
  const [okvedList, setOkvedList] = useState<OKVEDItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [taxSystem, setTaxSystem] = useState<'general' | 'usn'>('general');
  const [vatRate2025, setVatRate2025] = useState<number>(20);
  const [vatRate2026, setVatRate2026] = useState<number>(22);
  const [usnRevenue, setUsnRevenue] = useState<number>(100);

  useEffect(() => {
    const fetchOKVED = async () => {
      try {
        const response = await fetch('https://classifikators.ru/assets/downloads/okved/okved.csv');
        const text = await response.text();
        const lines = text.split('\n').slice(1);
        const parsedData = lines
          .filter(line => line.trim())
          .map(line => {
            const matches = line.match(/^"?([^"]*)"?[,;]"?([^"]*)"?/);
            if (matches) {
              return {
                code: matches[1].trim(),
                name: matches[2].trim()
              };
            }
            return null;
          })
          .filter((item): item is OKVEDItem => item !== null);
        setOkvedList(parsedData);
      } catch (error) {
        console.error('Ошибка загрузки ОКВЭД:', error);
      }
    };
    
    fetchOKVED();
  }, []);

  useEffect(() => {
    if (taxSystem === 'usn') {
      if (usnRevenue >= 60 && usnRevenue < 250) {
        setVatRate2025(5);
        setVatRate2026(5);
      } else if (usnRevenue >= 250 && usnRevenue <= 450) {
        setVatRate2025(7);
        setVatRate2026(7);
      } else {
        setVatRate2025(0);
        setVatRate2026(0);
      }
    }
  }, [taxSystem, usnRevenue]);

  const filteredOKVED = okvedList.filter(item =>
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateVAT = (rate: number) => {
    const numAmount = parseFloat(amount) || 0;
    return (numAmount * rate / 100).toFixed(2);
  };

  const vat2025 = calculateVAT(vatRate2025);
  const vat2026 = calculateVAT(vatRate2026);
  const difference = (parseFloat(vat2026) - parseFloat(vat2025)).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Калькулятор НДС
          </h1>
          <p className="text-lg text-muted-foreground">
            Расчет НДС для разных ОКВЭД с учетом изменений 2025-2026
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="animate-scale-in hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" className="text-primary" />
                Выбор ОКВЭД
              </CardTitle>
              <CardDescription>Найдите ваш код деятельности</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Поиск по коду или названию</Label>
                <Input
                  id="search"
                  placeholder="Введите код или название..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="okved">ОКВЭД</Label>
                <Select value={okvedCode} onValueChange={setOkvedCode}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите ОКВЭД" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {filteredOKVED.slice(0, 50).map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.code} - {item.name.substring(0, 60)}
                        {item.name.length > 60 ? '...' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in hover:shadow-lg transition-shadow" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calculator" className="text-primary" />
                Параметры расчета
              </CardTitle>
              <CardDescription>Укажите сумму и систему налогообложения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Сумма (₽)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Введите сумму"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Tabs value={taxSystem} onValueChange={(v) => setTaxSystem(v as 'general' | 'usn')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">Общая система</TabsTrigger>
                  <TabsTrigger value="usn">УСН</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="rate2025">Ставка НДС 2025 (%)</Label>
                    <Select 
                      value={vatRate2025.toString()} 
                      onValueChange={(v) => setVatRate2025(parseFloat(v))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (Экспорт)</SelectItem>
                        <SelectItem value="10">10% (Продовольствие)</SelectItem>
                        <SelectItem value="20">20% (Стандартная)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="usn" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="revenue">Годовой доход (млн ₽)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      placeholder="Введите доход"
                      value={usnRevenue}
                      onChange={(e) => setUsnRevenue(parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {usnRevenue >= 60 && usnRevenue < 250 
                        ? '5% - доход от 60 до 250 млн'
                        : usnRevenue >= 250 && usnRevenue <= 450
                        ? '7% - доход от 250 до 450 млн'
                        : 'Введите доход от 60 до 450 млн'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in mb-8" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" className="text-primary" />
              Результаты расчета
            </CardTitle>
            <CardDescription>Сравнение НДС за 2025 и 2026 годы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-blue-600 text-white">2025</Badge>
                  <Icon name="Calendar" className="text-blue-600" size={20} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ставка НДС</p>
                  <p className="text-3xl font-bold text-blue-900">{vatRate2025}%</p>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs text-muted-foreground">Сумма НДС</p>
                    <p className="text-xl font-semibold text-blue-800">{vat2025} ₽</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-purple-600 text-white">2026</Badge>
                  <Icon name="Calendar" className="text-purple-600" size={20} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ставка НДС</p>
                  <p className="text-3xl font-bold text-purple-900">{vatRate2026}%</p>
                  <div className="pt-2 border-t border-purple-200">
                    <p className="text-xs text-muted-foreground">Сумма НДС</p>
                    <p className="text-xl font-semibold text-purple-800">{vat2026} ₽</p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-orange-600 text-white">Разница</Badge>
                  <Icon name="ArrowUpRight" className="text-orange-600" size={20} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Изменение</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {parseFloat(difference) >= 0 ? '+' : ''}{difference} ₽
                  </p>
                  <div className="pt-2 border-t border-orange-200">
                    <p className="text-xs text-muted-foreground">В процентах</p>
                    <p className="text-xl font-semibold text-orange-800">
                      {parseFloat(vat2025) > 0 
                        ? `${((parseFloat(difference) / parseFloat(vat2025)) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="text-primary mt-1" size={20} />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Информация о расчете:</p>
                  {taxSystem === 'general' ? (
                    <>
                      <p>• 0% - экспорт товаров и международные перевозки</p>
                      <p>• 10% - продовольственные товары, детские товары, медицина</p>
                      <p>• 20% (2025) / 22% (2026) - стандартная ставка</p>
                    </>
                  ) : (
                    <>
                      <p>• 5% - при доходе от 60 до 250 млн рублей</p>
                      <p>• 7% - при доходе от 250 до 450 млн рублей</p>
                      <p>• Ставки УСН не изменяются в 2026 году</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VATCalculator;
