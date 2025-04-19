import { ConsolidationSettings as SettingsType } from "@/types/excel";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ConsolidationSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  disabled: boolean;
}

/**
 * Компонент настроек сведения Excel файлов
 */
const ConsolidationSettings = ({ 
  settings, 
  onUpdateSettings, 
  disabled 
}: ConsolidationSettingsProps) => {
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Метод сведения</CardTitle>
          <CardDescription>
            Выберите, каким образом следует объединить данные
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.consolidationType}
            onValueChange={(value: "append" | "summary" | "pivot") => 
              onUpdateSettings({ consolidationType: value })
            }
            className="space-y-4"
            disabled={disabled}
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="append" id="append" />
              <div className="grid gap-1.5">
                <Label htmlFor="append" className="font-medium">Объединение строк (Append)</Label>
                <p className="text-sm text-muted-foreground">
                  Объединяет все строки из разных файлов в одну таблицу. 
                  Подходит для файлов с одинаковой структурой.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="summary" id="summary" />
              <div className="grid gap-1.5">
                <Label htmlFor="summary" className="font-medium">Сводная таблица (Summary)</Label>
                <p className="text-sm text-muted-foreground">
                  Создает отчет с общими итогами по всем файлам.
                  Подходит для сравнения однотипных данных из разных источников.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <RadioGroupItem value="pivot" id="pivot" />
              <div className="grid gap-1.5">
                <Label htmlFor="pivot" className="font-medium">Сводная таблица (Pivot)</Label>
                <p className="text-sm text-muted-foreground">
                  Создает структурированный отчет с группировкой и агрегацией.
                  Подходит для анализа данных из разных файлов.
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Обработка данных</CardTitle>
          <CardDescription>
            Настройте способ обработки данных при сведении
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="preserveHeaders">Сохранять заголовки исходных файлов</Label>
              <p className="text-sm text-muted-foreground">
                Добавлять имя исходного файла к названиям столбцов
              </p>
            </div>
            <Switch
              id="preserveHeaders"
              checked={settings.preserveHeaders}
              onCheckedChange={(checked) => 
                onUpdateSettings({ preserveHeaders: checked })
              }
              disabled={disabled || settings.consolidationType === "pivot"}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="skipEmptyRows">Пропускать пустые строки</Label>
              <p className="text-sm text-muted-foreground">
                Игнорировать строки без значимых данных
              </p>
            </div>
            <Switch
              id="skipEmptyRows"
              checked={settings.skipEmptyRows}
              onCheckedChange={(checked) => 
                onUpdateSettings({ skipEmptyRows: checked })
              }
              disabled={disabled}
            />
          </div>
          
          {settings.consolidationType === "summary" && (
            <div className="space-y-3">
              <Label>Функция агрегации</Label>
              <Select
                value={settings.aggregationFunction}
                onValueChange={(value) => 
                  onUpdateSettings({ aggregationFunction: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите функцию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Сумма</SelectItem>
                  <SelectItem value="average">Среднее</SelectItem>
                  <SelectItem value="count">Количество</SelectItem>
                  <SelectItem value="min">Минимум</SelectItem>
                  <SelectItem value="max">Максимум</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      
      {disabled && (
        <Alert variant="default" className="bg-muted">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Загрузите файлы, чтобы настроить параметры сведения
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConsolidationSettings;
