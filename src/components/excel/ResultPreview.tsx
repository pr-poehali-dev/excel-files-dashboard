import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Settings } from "lucide-react";

interface ResultPreviewProps {
  mergedData: any[] | null;
  onDownload: () => void;
}

/**
 * Компонент для отображения результатов объединения
 */
const ResultPreview = ({ mergedData, onDownload }: ResultPreviewProps) => {
  if (!mergedData) {
    return (
      <div className="border border-dashed rounded-md p-8 text-center">
        <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Нет данных для отображения</h3>
        <p className="text-muted-foreground">
          Сначала объедините файлы для просмотра результата
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Результат объединения</h3>
          <p className="text-sm text-muted-foreground">
            Всего строк: {mergedData.length}
          </p>
        </div>
        <Button 
          onClick={onDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Скачать Excel
        </Button>
      </div>
      
      <div className="border rounded-md">
        <div className="p-3 bg-muted/50 font-medium flex items-center justify-between">
          <span>Предпросмотр объединенных данных</span>
          <span className="text-sm text-muted-foreground">
            Показано {Math.min(5, mergedData.length)} из {mergedData.length} строк
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(mergedData[0] || {}).map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedData.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value: any, i) => (
                    <TableCell key={i}>{String(value ?? '')}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {mergedData.length > 5 && (
          <div className="p-2 text-sm text-center text-muted-foreground">
            Скачайте файл для просмотра всех данных.
          </div>
        )}
      </div>
    </>
  );
};

export default ResultPreview;
