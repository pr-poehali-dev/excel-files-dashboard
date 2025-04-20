import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  BarChart3, 
  Table2, 
  Settings 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

interface ConsolidatedPreviewProps {
  consolidatedData: any[] | null;
  onDownload: () => void;
}

/**
 * Компонент для отображения результатов консолидации с таблицей и графиком
 */
const ConsolidatedPreview = ({ 
  consolidatedData, 
  onDownload 
}: ConsolidatedPreviewProps) => {
  if (!consolidatedData || consolidatedData.length === 0) {
    return (
      <div className="border border-dashed rounded-md p-8 text-center">
        <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Нет данных для отображения</h3>
        <p className="text-muted-foreground">
          Сначала консолидируйте файлы для просмотра результата
        </p>
      </div>
    );
  }

  // Получаем все числовые столбцы для построения графика
  const numericColumns = Object.keys(consolidatedData[0]).filter(key => {
    const firstValue = consolidatedData[0][key];
    return typeof firstValue === 'number' || !isNaN(Number(firstValue));
  });
  
  // Берем первый нечисловой столбец как категорию для оси X
  const categoryColumn = Object.keys(consolidatedData[0]).find(key => {
    const firstValue = consolidatedData[0][key];
    return typeof firstValue === 'string' || isNaN(Number(firstValue));
  });
  
  // Выбираем первый числовой столбец для графика (если есть)
  const valueColumn = numericColumns.length > 0 ? numericColumns[0] : null;

  // Данные для графика (только первые 10 записей если их больше)
  const chartData = categoryColumn && valueColumn
    ? consolidatedData.slice(0, 10).map(item => ({
        name: String(item[categoryColumn] || 'Не указано'),
        value: Number(item[valueColumn]) || 0
      }))
    : [];
  
  // Цвета для столбцов графика
  const COLORS = [
    '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981',
    '#A3E635', '#FBBF24', '#F43F5E', '#6366F1', '#EC4899'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Результат консолидации</h3>
          <p className="text-sm text-muted-foreground">
            Всего строк: {consolidatedData.length}
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
      
      {/* Вкладки с таблицей и графиком */}
      <div className="border rounded-md">
        {/* Табличное представление */}
        <div>
          <div className="p-3 bg-muted/50 font-medium flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Table2 className="h-4 w-4" />
              <span>Табличный вид</span>
            </div>
            <Badge variant="outline">
              Показано {Math.min(7, consolidatedData.length)} из {consolidatedData.length} строк
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(consolidatedData[0]).map((key) => (
                    <TableHead key={key} className="whitespace-nowrap">
                      {key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {consolidatedData.slice(0, 7).map((row, index) => (
                  <TableRow key={index}>
                    {Object.entries(row).map(([key, value], i) => (
                      <TableCell key={`${index}-${i}`} className="truncate max-w-[200px]">
                        {String(value ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {consolidatedData.length > 7 && (
            <div className="p-2 text-xs text-center text-muted-foreground border-t">
              Скачайте файл для просмотра всех данных.
            </div>
          )}
        </div>
      </div>
      
      {/* Графическое представление */}
      {categoryColumn && valueColumn && (
        <div className="border rounded-md">
          <div className="p-3 bg-muted/50 font-medium flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Графическое представление</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{valueColumn}</span> по <span className="font-medium">{categoryColumn}</span>
            </div>
          </div>
          
          <div className="p-4 h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Недостаточно данных для построения графика
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedPreview;
