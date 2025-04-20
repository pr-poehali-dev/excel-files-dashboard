import { ConsolidationSettings as SettingsType } from "@/types/excel";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";

interface ConsolidationSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  availableColumns: string[];
  filesExist: boolean;
}

/**
 * Компонент настроек консолидации файлов
 */
const ConsolidationSettings = ({ 
  settings, 
  onUpdateSettings, 
  availableColumns,
  filesExist 
}: ConsolidationSettingsProps) => {
  
  const handleValueColumnToggle = (column: string) => {
    const newValueColumns = settings.valueColumns.includes(column)
      ? settings.valueColumns.filter(col => col !== column)
      : [...settings.valueColumns, column];
    
    onUpdateSettings({ valueColumns: newValueColumns });
  };
  
  return (
    <div className="space-y-8">
      {!filesExist && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Нет файлов</AlertTitle>
          <AlertDescription>
            Загрузите файлы для настройки параметров консолидации
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Тип консолидации</h3>
        
        <RadioGroup 
          value={settings.consolidationType}
          onValueChange={(value: 'append' | 'summary' | 'pivot') => 
            onUpdateSettings({ consolidationType: value })
          }
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="append" id="append" />
            <Label htmlFor="append" className="cursor-pointer">
              Объединение данных
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="summary" id="summary" />
            <Label htmlFor="summary" className="cursor-pointer">
              Сводка по группам
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pivot" id="pivot" />
            <Label htmlFor="pivot" className="cursor-pointer">
              Сводная таблица
            </Label>
          </div>
        </RadioGroup>
        
        <div className="text-sm text-muted-foreground">
          {settings.consolidationType === "append" && (
            "Объединение добавляет все строки из выбранных файлов в один общий набор данных."
          )}
          {settings.consolidationType === "summary" && (
            "Сводка группирует данные по выбранному столбцу и применяет выбранную функцию агрегации."
          )}
          {settings.consolidationType === "pivot" && (
            "Сводная таблица создает таблицу с группировкой по строкам и отдельными столбцами для каждого файла."
          )}
        </div>
      </div>
      
      {settings.consolidationType === "append" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Настройки объединения</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="preserveHeaders"
              checked={settings.preserveHeaders}
              onCheckedChange={(checked) => 
                onUpdateSettings({ preserveHeaders: !!checked })
              }
            />
            <Label htmlFor="preserveHeaders" className="cursor-pointer">
              Добавлять исходный файл как столбец
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="skipEmptyRows"
              checked={settings.skipEmptyRows}
              onCheckedChange={(checked) => 
                onUpdateSettings({ skipEmptyRows: !!checked })
              }
            />
            <Label htmlFor="skipEmptyRows" className="cursor-pointer">
              Пропускать пустые строки
            </Label>
          </div>
        </div>
      )}
      
      {(settings.consolidationType === "summary" || settings.consolidationType === "pivot") && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Настройки группировки и агрегации</h3>
            
            <div className="space-y-2">
              <Label htmlFor="groupByColumn">Группировать по столбцу</Label>
              <Select
                value={settings.groupByColumn || ""}
                onValueChange={(value) => 
                  onUpdateSettings({ groupByColumn: value || null })
                }
                disabled={availableColumns.length === 0}
              >
                <SelectTrigger id="groupByColumn">
                  <SelectValue placeholder="Выберите столбец для группировки" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(column => (
                    <SelectItem key={column} value={column}>{column}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {settings.consolidationType === "summary" && (
              <div className="space-y-2">
                <Label htmlFor="aggregationFunction">Функция агрегации</Label>
                <Select
                  value={settings.aggregationFunction}
                  onValueChange={(value: 'sum' | 'average' | 'max' | 'min' | 'count') => 
                    onUpdateSettings({ aggregationFunction: value })
                  }
                >
                  <SelectTrigger id="aggregationFunction">
                    <SelectValue placeholder="Выберите функцию агрегации" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Сумма</SelectItem>
                    <SelectItem value="average">Среднее</SelectItem>
                    <SelectItem value="max">Максимум</SelectItem>
                    <SelectItem value="min">Минимум</SelectItem>
                    <SelectItem value="count">Количество</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Столбцы для расчета</Label>
              <span className="text-xs text-muted-foreground">
                Выбрано: {settings.valueColumns.length}
              </span>
            </div>
            
            {availableColumns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Загрузите файлы для выбора столбцов
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableColumns
                  .filter(col => col !== settings.groupByColumn)
                  .map(column => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`col-${column}`}
                        checked={settings.valueColumns.includes(column)}
                        onCheckedChange={() => handleValueColumnToggle(column)}
                      />
                      <Label 
                        htmlFor={`col-${column}`} 
                        className="cursor-pointer truncate"
                        title={column}
                      >
                        {column}
                      </Label>
                    </div>
                  ))
                }
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.valueColumns.map(column => (
                <Badge key={column} variant="secondary" className="text-xs">
                  {column}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="skipEmptyRows"
              checked={settings.skipEmptyRows}
              onCheckedChange={(checked) => 
                onUpdateSettings({ skipEmptyRows: !!checked })
              }
            />
            <Label htmlFor="skipEmptyRows" className="cursor-pointer">
              Пропускать строки с пустыми значениями ключевого столбца
            </Label>
          </div>
        </>
      )}
    </div>
  );
};

export default ConsolidationSettings;
