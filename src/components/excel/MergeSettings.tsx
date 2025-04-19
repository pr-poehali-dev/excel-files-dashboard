import { MergeOptions } from "@/types/excel";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface MergeSettingsProps {
  mergeOptions: MergeOptions;
  onUpdateMergeOptions: (options: Partial<MergeOptions>) => void;
  availableColumns: string[];
  filesExist: boolean;
}

/**
 * Компонент настроек объединения файлов
 */
const MergeSettings = ({ 
  mergeOptions, 
  onUpdateMergeOptions, 
  availableColumns,
  filesExist 
}: MergeSettingsProps) => {
  
  return (
    <div className="grid gap-6 max-w-md">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Тип объединения</h3>
        <Select
          value={mergeOptions.mergeType}
          onValueChange={(value: 'vertical' | 'horizontal') => 
            onUpdateMergeOptions({ mergeType: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип объединения" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Вертикальное (строки одна под другой)</SelectItem>
            <SelectItem value="horizontal">Горизонтальное (по ключевому столбцу)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Вертикальное объединение просто комбинирует все строки из разных файлов.
          Горизонтальное объединяет данные по выбранному ключевому столбцу.
        </p>
      </div>
      
      {mergeOptions.mergeType === "horizontal" && (
        <>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Ключевой столбец для объединения</h3>
            <Select
              value={mergeOptions.keyColumn || ""}
              onValueChange={(value) => 
                onUpdateMergeOptions({ keyColumn: value || null })
              }
              disabled={availableColumns.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите ключевой столбец" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map(column => (
                  <SelectItem key={column} value={column}>{column}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Данные будут объединены по значениям в этом столбце
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ignoreEmpty"
              checked={mergeOptions.ignoreEmptyCells}
              onCheckedChange={(checked) => 
                onUpdateMergeOptions({ ignoreEmptyCells: !!checked })
              }
            />
            <label
              htmlFor="ignoreEmpty"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Игнорировать пустые ячейки ключевого столбца
            </label>
          </div>
        </>
      )}
      
      {mergeOptions.mergeType === "horizontal" && !mergeOptions.keyColumn && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Внимание</AlertTitle>
          <AlertDescription>
            Для горизонтального объединения необходимо выбрать ключевой столбец
          </AlertDescription>
        </Alert>
      )}
      
      {!filesExist && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Нет файлов</AlertTitle>
          <AlertDescription>
            Загрузите файлы для настройки параметров объединения
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MergeSettings;
