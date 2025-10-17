import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OKVEDItem {
  code: string;
  name: string;
}

const VATCalculator = () => {
  const [amount, setAmount] = useState<string>('100000');
  const [okvedCode, setOkvedCode] = useState<string>('');
  const [okvedList, setOkvedList] = useState<OKVEDItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [taxSystem, setTaxSystem] = useState<'general' | 'usn' | 'psn' | 'ausn'>('general');
  const [vatRate2025, setVatRate2025] = useState<number>(20);
  const [vatRate2026, setVatRate2026] = useState<number>(22);
  const [usnRevenue, setUsnRevenue] = useState<number>(100);
  const [generalRevenue, setGeneralRevenue] = useState<number>(10);
  const [psnRevenue, setPsnRevenue] = useState<number>(30);
  const [ausnRevenue, setAusnRevenue] = useState<number>(30);
  const [isExempt2025, setIsExempt2025] = useState<boolean>(false);
  const [isExempt2026, setIsExempt2026] = useState<boolean>(false);
  const [psnAvailable2025, setPsnAvailable2025] = useState<boolean>(true);
  const [psnAvailable2026, setPsnAvailable2026] = useState<boolean>(true);

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
      if (usnRevenue < 60) {
        setIsExempt2025(true);
        setVatRate2025(0);
      } else if (usnRevenue >= 60 && usnRevenue < 250) {
        setIsExempt2025(false);
        setVatRate2025(5);
      } else if (usnRevenue >= 250 && usnRevenue <= 450) {
        setIsExempt2025(false);
        setVatRate2025(7);
      } else {
        setIsExempt2025(false);
        setVatRate2025(0);
      }
      
      if (usnRevenue < 10) {
        setIsExempt2026(true);
        setVatRate2026(0);
      } else if (usnRevenue >= 60 && usnRevenue < 250) {
        setIsExempt2026(false);
        setVatRate2026(5);
      } else if (usnRevenue >= 250 && usnRevenue <= 450) {
        setIsExempt2026(false);
        setVatRate2026(7);
      } else {
        setIsExempt2026(false);
        setVatRate2026(0);
      }
    } else if (taxSystem === 'general') {
      if (generalRevenue <= 2) {
        setIsExempt2025(true);
        setIsExempt2026(true);
      } else {
        setIsExempt2025(false);
        setIsExempt2026(false);
      }
    } else if (taxSystem === 'psn') {
      if (psnRevenue <= 60) {
        setPsnAvailable2025(true);
        setIsExempt2025(true);
        setVatRate2025(0);
      } else {
        setPsnAvailable2025(false);
        setIsExempt2025(false);
      }
      
      if (psnRevenue <= 10) {
        setPsnAvailable2026(true);
        setIsExempt2026(true);
        setVatRate2026(0);
      } else {
        setPsnAvailable2026(false);
        setIsExempt2026(false);
      }
    } else if (taxSystem === 'ausn') {
      if (ausnRevenue <= 60) {
        setIsExempt2025(true);
        setIsExempt2026(true);
        setVatRate2025(0);
        setVatRate2026(0);
      } else {
        setIsExempt2025(false);
        setIsExempt2026(false);
      }
    }
  }, [taxSystem, usnRevenue, generalRevenue, psnRevenue, ausnRevenue]);

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

              <TooltipProvider>
                <Tabs value={taxSystem} onValueChange={(v) => setTaxSystem(v as 'general' | 'usn' | 'psn' | 'ausn')}>
                  <TabsList className="grid w-full grid-cols-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="general">ОСН</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Общая система налогообложения</p>
                        <p className="text-xs mt-1">Стандартный режим для всех организаций и ИП</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="usn">УСН</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Упрощенная система налогообложения</p>
                        <p className="text-xs mt-1">Специальный режим с пониженной ставкой</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="psn">ПСН</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Патентная система налогообложения</p>
                        <p className="text-xs mt-1">Только для ИП. Покупка патента на вид деятельности</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="ausn">АУСН</TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">Автоматизированная упрощённая система</p>
                        <p className="text-xs mt-1">Спецрежим с автоматическим учётом для ИП и ООО</p>
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>
                
                <TabsContent value="general" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="generalRevenue">Выручка за 3 месяца (млн ₽)</Label>
                    <Input
                      id="generalRevenue"
                      type="number"
                      placeholder="Введите выручку"
                      value={generalRevenue}
                      onChange={(e) => setGeneralRevenue(parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                  </div>
                  {!isExempt2025 && !isExempt2026 && (
                    <div>
                      <Label htmlFor="rate2025">Ставка НДС (%)</Label>
                      <Select 
                        value={vatRate2025.toString()} 
                        onValueChange={(v) => {
                          const rate = parseFloat(v);
                          setVatRate2025(rate);
                          if (rate === 20) {
                            setVatRate2026(22);
                          } else {
                            setVatRate2026(rate);
                          }
                        }}
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
                      <p className="text-sm text-muted-foreground mt-2">
                        {vatRate2025 === 20 
                          ? 'В 2026 году ставка изменится на 22%'
                          : 'Ставка не изменится в 2026 году'}
                      </p>
                    </div>
                  )}
                  {(isExempt2025 || isExempt2026) && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">✓ Освобождение от НДС</p>
                      <p className="text-xs text-green-700 mt-1">Выручка не превышает 2 млн ₽ за 3 месяца</p>
                    </div>
                  )}
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
                    {isExempt2025 && isExempt2026 ? (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">✓ Автоматическое освобождение от НДС</p>
                        <p className="text-xs text-green-700 mt-1">Доход не превышает 60 млн ₽ в 2025 и 10 млн ₽ в 2026</p>
                      </div>
                    ) : isExempt2025 && !isExempt2026 ? (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">⚠ Изменение статуса</p>
                        <p className="text-xs text-yellow-700 mt-1">2025: освобождение (до 60 млн) | 2026: НДС обязателен (лимит 10 млн)</p>
                      </div>
                    ) : !isExempt2025 && isExempt2026 ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">✓ Освобождение с 2026</p>
                        <p className="text-xs text-blue-700 mt-1">2025: НДС обязателен | 2026: освобождение (до 10 млн)</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        {usnRevenue >= 60 && usnRevenue < 250 
                          ? '5% - доход от 60 до 250 млн'
                          : usnRevenue >= 250 && usnRevenue <= 450
                          ? '7% - доход от 250 до 450 млн'
                          : 'Доход выше 450 млн - УСН недоступна'}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="psn" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="psnRevenue">Годовой доход (млн ₽)</Label>
                    <Input
                      id="psnRevenue"
                      type="number"
                      placeholder="Введите доход"
                      value={psnRevenue}
                      onChange={(e) => setPsnRevenue(parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                    {psnAvailable2025 && psnAvailable2026 ? (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">✓ ПСН доступна</p>
                        <p className="text-xs text-green-700 mt-1">Доход не превышает 60 млн ₽ (2025) и 10 млн ₽ (2026)</p>
                        <p className="text-xs text-green-700">НДС не уплачивается при патентной системе</p>
                      </div>
                    ) : psnAvailable2025 && !psnAvailable2026 ? (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">⚠ Потеря ПСН в 2026</p>
                        <p className="text-xs text-red-700 mt-1">2025: ПСН доступна (до 60 млн) | 2026: доход превышает лимит 10 млн</p>
                        <p className="text-xs text-red-700 font-semibold mt-2">Потребуется переход на УСН или ОСН с уплатой НДС!</p>
                      </div>
                    ) : !psnAvailable2025 && !psnAvailable2026 ? (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">✗ ПСН недоступна</p>
                        <p className="text-xs text-red-700 mt-1">Доход превышает допустимый лимит для патента</p>
                        <p className="text-xs text-red-700">Рассмотрите УСН или ОСН</p>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">⚠ Изменение условий</p>
                        <p className="text-xs text-yellow-700 mt-1">Проверьте доступность ПСН для вашей ситуации</p>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 font-medium mb-2">Важные изменения 2026:</p>
                      <p className="text-xs text-blue-700">• Лимит дохода снижен с 60 до 10 млн ₽</p>
                      <p className="text-xs text-blue-700">• Исключена розничная торговля через стационарные точки</p>
                      <p className="text-xs text-blue-700">• Исключены грузоперевозки</p>
                      <p className="text-xs text-blue-700">• Упрощен пересчет стоимости патента</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ausn" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="ausnRevenue">Годовой доход (млн ₽)</Label>
                    <Input
                      id="ausnRevenue"
                      type="number"
                      placeholder="Введите доход"
                      value={ausnRevenue}
                      onChange={(e) => setAusnRevenue(parseFloat(e.target.value) || 0)}
                      className="mt-2"
                    />
                    {ausnRevenue <= 60 ? (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">✓ АУСН доступна</p>
                        <p className="text-xs text-green-700 mt-1">Доход не превышает 60 млн ₽ в год</p>
                        <p className="text-xs text-green-700">НДС не уплачивается при АУСН</p>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800 font-medium">✗ АУСН недоступна</p>
                        <p className="text-xs text-red-700 mt-1">Доход превышает лимит 60 млн ₽</p>
                        <p className="text-xs text-red-700">Рассмотрите УСН или ОСН</p>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 font-medium mb-2">Особенности АУСН:</p>
                      <p className="text-xs text-blue-700">• Доступна с 2025 года во всех регионах РФ</p>
                      <p className="text-xs text-blue-700">• Численность работников до 5 человек</p>
                      <p className="text-xs text-blue-700">• Автоматический учет в личном кабинете</p>
                      <p className="text-xs text-blue-700">• Не уплачиваются страховые взносы</p>
                      <p className="text-xs text-blue-700">• Ставка: 8% (доходы) или 20% (доходы-расходы)</p>
                    </div>
                  </div>
                </TabsContent>
                </Tabs>
              </TooltipProvider>
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
                  {isExempt2025 && (
                    <Badge className="bg-green-600 text-white">Освобождение</Badge>
                  )}
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
                  {isExempt2026 && (
                    <Badge className="bg-green-600 text-white">Освобождение</Badge>
                  )}
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
                      <p>• Освобождение: выручка ≤ 2 млн ₽ за 3 месяца (требуется уведомление)</p>
                    </>
                  ) : taxSystem === 'usn' ? (
                    <>
                      <p>• 0% - автоматически при доходе до 60 млн ₽ (2025) / до 10 млн ₽ (2026)</p>
                      <p>• 5% - при доходе от 60 до 250 млн рублей</p>
                      <p>• 7% - при доходе от 250 до 450 млн рублей</p>
                      <p className="font-semibold text-orange-700">⚠ ВАЖНО: в 2026 лимит освобождения снижается с 60 до 10 млн!</p>
                    </>
                  ) : taxSystem === 'psn' ? (
                    <>
                      <p>• ПСН - патентная система налогообложения (только для ИП)</p>
                      <p>• 2025: доход до 60 млн ₽, персонал до 15 человек</p>
                      <p>• 2026: доход снижен до 10 млн ₽, исключены розница и грузоперевозки</p>
                      <p>• НДС не уплачивается при использовании патента</p>
                      <p className="font-semibold text-red-700 mt-2">⚠ При превышении лимита переход на УСН/ОСН с уплатой НДС!</p>
                    </>
                  ) : taxSystem === 'ausn' ? (
                    <>
                      <p>• АУСН - автоматизированная упрощённая система (для ИП и ООО)</p>
                      <p>• Доход до 60 млн ₽, численность до 5 человек</p>
                      <p>• Доступна с 2025 года во всех регионах РФ</p>
                      <p>• НДС не уплачивается, страховые взносы не платятся</p>
                      <p>• Автоматический учёт доходов/расходов в личном кабинете</p>
                      <p className="font-semibold text-green-700 mt-2">✓ Ставки не изменяются в 2026 году</p>
                    </>
                  ) : null}
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