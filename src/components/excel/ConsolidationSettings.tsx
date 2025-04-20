import { ConsolidationSettings } from "@/types/excel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConsolidationSettingsProps {
  settings: ConsolidationSettings;
  onUpdateSettings: (settings: Partial<ConsolidationSettings>) => void;
  disabled?: boolean;
}

/**
 * Компонент настроек сведения Excel файлов
 */
const ConsolidationSettingsComponent = ({ 
  settings, 
  onUpdateSettings,
  disabled = false
}: ConsolidationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Настройки сведения</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="consolidationType">Тип сведения</Label>
            <Tabs 
              value={settings.consolidationType} 
              onValueChange={(value: "append" | "summary" | "pivot") => 
                onUpdateSettings({ consolidationType: value })
              }
              className="w-full"
              disabled={disabled}
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="append">Простое</TabsTrigger>
                <TabsTrigger value="summary">Сводка</TabsTrigger>
                <TabsTrigger value="pivot">Сводная таблица</TabsTrigger>
              </TabsList>
              <TabsContent value="append" className="pt-4 text-sm text-muted-foreground">
                Просто объединяет данные из всех файлов в одну таблицу без агрегации.
              </TabsContent>
              <TabsContent value="summary" className="pt-4 text-sm text-muted-foreground">
                Группирует данные по текстовым полям и агрегирует числовые значения.
              </TabsContent>
              <TabsContent value="pivot" className="pt-4 text-sm text-muted-foreground">
                Создает полноценную сводную таблицу с группировкой по строкам и столбцам.
              </TabsContent>
            </Tabs>
          </div>
          
          {(settings.consolidationType === "summary" || settings.consolidationType === "pivot") && (
            <div className="space-y-3">
              <Label htmlFor="aggregationFunction">Функция агрегации</Label>
              <Select
                value={settings.aggregationFunction}
                onValueChange={(value) => onUpdateSettings({ aggregationFunction: value })}
                disabled={disabled}
              >
                <SelectTrigger id="aggregationFunction">
                  <SelectValue placeholder="Выберите функцию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Сумма</SelectItem>
                  <SelectItem value="average">Среднее</SelectItem>
                  <SelectItem value="max">Максимум</SelectItem>
                  <SelectItem value="min">Минимум</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="preserveHeaders" className="cursor-pointer">
                Сохранять заголовки
                <p className="text-xs font-normal text-muted-foreground mt-1">
                  Сохраняет исходные заголовки колонок
                </p>
              </Label>
              <Switch 
                id="preserveHeaders"
                checked={settings.preserveHeaders}
                onCheckedChange={(checked) => onUpdateSettings({ preserveHeaders: checked })}
                disabled={disabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="skipEmptyRows" className="cursor-pointer">
                Пропускать пустые строки
                <p className="text-xs font-normal text-muted-foreground mt-1">
                  Не учитывает строки без значений при сведении
                </p>
              </Label>
              <Switch 
                id="skipEmptyRows"
                checked={settings.skipEmptyRows}
                onCheckedChange={(checked) => onUpdateSettings({ skipEmptyRows: checked })}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidationSettingsComponent;
