import { ConsolidationSettings } from "@/types/excel";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AlertCircle, Settings2 } from "lucide-react";

interface ConsolidationSettingsProps {
  settings: ConsolidationSettings;
  onUpdateSettings: (settings: Partial<ConsolidationSettings>) => void;
  availableColumns: string[];
  filesExist: boolean;
}

/**
 * Компонент настроек консолидации файлов
 */
const ConsolidationSettingsComponent = ({ 
  settings, 
  onUpdateSettings, 
  availableColumns,
  filesExist 
}: ConsolidationSettingsProps) => {
  
  // Выбор нескольких столбцов для значений
  const handleValueColumnToggle = (column: string) => {
    const newValueColumns = settings.valueColumns.includes(column)
      ? settings.valueColumns.filter(col => col !== column)
      : [...settings.valueColumns, column];
    
    onUpdateSettings({ valueColumns: newValueColumns });
  };
  
  return (
    <div className="space-y-6">
      {!filesExist && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Нет файлов</AlertTitle>
          <AlertDescription>
            Загрузите Excel файлы для настройки параметров консолидации
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="consolidation-type">Тип консолидации</Label>
          <Select
            disabled={!filesExist}
            value={settings.consolidationType}
            onValueChange={(value: "append" | "summary" | "pivot") => 
              onUpdateSettings({ consolidationType: value })
            }
          >
            <SelectTrigger id="consolidation-type">
              <SelectValue placeholder="Выберите тип консолидации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="append">Простое объединение</SelectItem>
              <SelectItem value="summary">Сводка по группам</SelectItem>
              <SelectItem value="pivot">Сводная таблица</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {settings.consolidationType === "append" && 
              "Все данные будут просто объединены в одну таблицу"}
            {settings.consolidationType === "summary" && 
              "Данные будут сгруппированы по выбранному столбцу с применением агрегирующей функции"}
            {settings.consolidationType === "pivot" && 
              "Будет создана сводная таблица с группировкой по выбранному столбцу"}
          </p>
        </div>

        {(settings.consolidationType === "summary" || settings.consolidationType === "pivot") && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="group-by-column">Столбец для группировки</Label>
              <Select
                disabled={!filesExist || availableColumns.length === 0}
                value={settings.groupByColumn || ""}
                onValueChange={(value) => 
                  onUpdateSettings({ groupByColumn: value || null })
                }
              >
                <SelectTrigger id="group-by-column">
                  <SelectValue placeholder="Выберите столбец для группировки" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(column => (
                    <SelectItem key={column} value={column}>{column}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Данные будут сгруппированы по значениям этого столбца
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="aggregation-function">Функция агрегации</Label>
              <Select
                disabled={!filesExist}
                value={settings.aggregationFunction}
                onValueChange={(value: "sum" | "average" | "max" | "min" | "count") => 
                  onUpdateSettings({ aggregationFunction: value })
                }
              >
                <SelectTrigger id="aggregation-function">
                  <SelectValue placeholder="Выберите функцию агрегации" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Сумма</SelectItem>
                  <SelectItem value="average">Среднее значение</SelectItem>
                  <SelectItem value="max">Максимум</SelectItem>
                  <SelectItem value="min">Минимум</SelectItem>
                  <SelectItem value="count">Количество</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Эта функция будет применена к числовым столбцам при группировке
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="value-columns">
                <AccordionTrigger className="py-2">
                  Выбор столбцов со значениями
                </AccordionTrigger>
                <AccordionContent>
                  {availableColumns.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Нет доступных столбцов
                    </p>
                  ) : (
                    <div className="space-y-2 py-2">
                      <p className="text-sm text-muted-foreground">
                        Выберите столбцы с числовыми данными для агрегации:
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {availableColumns.map(column => (
                          <div key={column} className="flex items-center space-x-2">
                            <Checkbox
                              id={`value-column-${column}`}
                              checked={settings.valueColumns.includes(column)}
                              onCheckedChange={() => handleValueColumnToggle(column)}
                            />
                            <label
                              htmlFor={`value-column-${column}`}
                              className="text-sm cursor-pointer"
                            >
                              {column}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
        
        <div className="pt-4 space-y-2">
          <h3 className="text-sm font-medium">Дополнительные настройки</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-empty-rows"
                checked={settings.skipEmptyRows}
                onCheckedChange={(checked) => 
                  onUpdateSettings({ skipEmptyRows: !!checked })
                }
              />
              <label
                htmlFor="skip-empty-rows"
                className="text-sm cursor-pointer"
              >
                Пропускать пустые строки
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserve-headers"
                checked={settings.preserveHeaders}
                onCheckedChange={(checked) => 
                  onUpdateSettings({ preserveHeaders: !!checked })
                }
              />
              <label
                htmlFor="preserve-headers"
                className="text-sm cursor-pointer"
              >
                Сохранять заголовки столбцов
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {(settings.consolidationType === "summary" || settings.consolidationType === "pivot") && 
       (!settings.groupByColumn || settings.valueColumns.length === 0) && (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Требуется дополнительная настройка</AlertTitle>
          <AlertDescription>
            {!settings.groupByColumn && "Выберите столбец для группировки. "}
            {settings.valueColumns.length === 0 && "Выберите хотя бы один столбец со значениями."}
          </AlertDescription>
        </Alert>
      )}
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="preview">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span>Предпросмотр настроек</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Параметр</TableHead>
                  <TableHead>Значение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Тип консолидации</TableCell>
                  <TableCell>
                    {settings.consolidationType === "append" && "Простое объединение"}
                    {settings.consolidationType === "summary" && "Сводка по группам"}
                    {settings.consolidationType === "pivot" && "Сводная таблица"}
                  </TableCell>
                </TableRow>
                {(settings.consolidationType === "summary" || settings.consolidationType === "pivot") && (
                  <>
                    <TableRow>
                      <TableCell>Столбец группировки</TableCell>
                      <TableCell>{settings.groupByColumn || "Не выбран"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Функция агрегации</TableCell>
                      <TableCell>
                        {settings.aggregationFunction === "sum" && "Сумма"}
                        {settings.aggregationFunction === "average" && "Среднее значение"}
                        {settings.aggregationFunction === "max" && "Максимум"}
                        {settings.aggregationFunction === "min" && "Минимум"}
                        {settings.aggregationFunction === "count" && "Количество"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Выбранные столбцы значений</TableCell>
                      <TableCell>
                        {settings.valueColumns.length > 0 
                          ? settings.valueColumns.join(", ")
                          : "Не выбраны"}
                      </TableCell>
                    </TableRow>
                  </>
                )}
                <TableRow>
                  <TableCell>Пропускать пустые строки</TableCell>
                  <TableCell>{settings.skipEmptyRows ? "Да" : "Нет"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Сохранять заголовки</TableCell>
                  <TableCell>{settings.preserveHeaders ? "Да" : "Нет"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ConsolidationSettingsComponent;
