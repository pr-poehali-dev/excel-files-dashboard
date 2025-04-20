import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BarChart as BarChartIcon, 
  TableIcon, 
  Download, 
  Settings 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConsolidatedPreviewProps {
  data: any[] | null;
  chartData: any[] | null;
  onDownload: () => void;
}

// Функция для определения цветов баров графика
const getBarColors = () => [
  "#8B5CF6", // Purple
  "#0EA5E9", // Blue
  "#F97316", // Orange
  "#10B981", // Green
  "#F43F5E", // Red
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#0284C7", // Light Blue
  "#059669", // Emerald
  "#D946EF", // Fuchsia
  "#6D28D9", // Violet
];

/**
 * Компонент для отображения результатов консолидации с таблицей и графиком
 */
const ConsolidatedPreview = ({ data, chartData, onDownload }: ConsolidatedPreviewProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="border border-dashed rounded-md p-8 text-center">
        <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Нет данных для отображения</h3>
        <p className="text-muted-foreground">
          Сначала сведите файлы для просмотра результата
        </p>
      </div>
    );
  }

  // Получаем заголовки столбцов из первой строки данных
  const columns = Object.keys(data[0]);
  
  // Получаем метаданные для графика
  const chartKeys = chartData && chartData.length > 0 
    ? Object.keys(chartData[0]).filter(key => key !== 'name')
    : [];
  
  const colors = getBarColors();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Результат сведения</h3>
          <p className="text-sm text-muted-foreground">
            Всего строк: {data.length}
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
      
      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            <span>Таблица</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chart" 
            disabled={!chartData || chartData.length === 0}
            className="flex items-center gap-2"
          >
            <BarChartIcon className="h-4 w-4" />
            <span>График</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table" className="p-0">
          <div className="border rounded-md">
            <div className="p-3 bg-muted/50 font-medium flex items-center justify-between">
              <span>Просмотр консолидированных данных</span>
              <span className="text-sm text-muted-foreground">
                {data.length > 10 
                  ? `Показано 10 из ${data.length} строк` 
                  : `Показано ${data.length} строк`
                }
              </span>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(0, 10).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map((column, colIndex) => (
                          <TableCell key={colIndex}>
                            {row[column] !== null && row[column] !== undefined
                              ? String(row[column])
                              : ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
            {data.length > 10 && (
              <div className="p-2 text-sm text-center text-muted-foreground">
                Скачайте файл для просмотра всех данных.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="chart">
          {chartData && chartData.length > 0 && chartKeys.length > 0 ? (
            <div className="border rounded-md">
              <div className="p-3 bg-muted/50 font-medium">
                <span>Визуализация сведенных данных</span>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chartKeys.map((key, index) => (
                      <Bar 
                        key={key} 
                        dataKey={key} 
                        fill={colors[index % colors.length]} 
                        name={key}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="border border-dashed rounded-md p-8 text-center">
              <BarChartIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Нет данных для графика</h3>
              <p className="text-muted-foreground">
                Для построения графика необходимы сгруппированные числовые данные
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedPreview;
