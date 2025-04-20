import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, BarChart3, Table2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConsolidatedPreviewProps {
  data: any[] | null;
  onDownload: () => void;
}

/**
 * Компонент для отображения предварительного просмотра консолидированных данных
 */
const ConsolidatedPreview = ({ data, onDownload }: ConsolidatedPreviewProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Нет данных для отображения</p>
            <p className="text-sm text-muted-foreground mt-1">
              Загрузите файлы и выполните сведение данных
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Получаем ключи (колонки) из первой строки
  const columns = Object.keys(data[0]);
  
  // Находим числовые колонки для графика
  const numericColumns = columns.filter(col => 
    typeof data[0][col] === 'number'
  );
  
  // Находим текстовые колонки для категорий
  const textColumns = columns.filter(col => 
    typeof data[0][col] === 'string' || typeof data[0][col] === 'boolean'
  );
  
  // Простая визуализация данных в виде таблицы
  const renderTable = () => (
    <div className="border rounded-md">
      <div className="p-3 bg-muted/50 font-medium flex items-center justify-between">
        <span>Табличное представление</span>
        <span className="text-sm text-muted-foreground">
          Показано {Math.min(10, data.length)} из {data.length} строк
        </span>
      </div>
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
                  <TableCell key={`${rowIndex}-${colIndex}`}>
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.length > 10 && (
        <div className="p-2 text-sm text-center text-muted-foreground">
          Скачайте файл для просмотра всех данных
        </div>
      )}
    </div>
  );

  // Простая визуализация данных в виде ASCII-графика
  const renderChart = () => {
    if (numericColumns.length === 0 || textColumns.length === 0) {
      return (
        <div className="p-6 text-center">
          <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Недостаточно данных для построения графика
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Требуются числовые и текстовые поля в данных
          </p>
        </div>
      );
    }

    // Для простоты берем первую текстовую колонку как категорию и первую числовую для значений
    const categoryColumn = textColumns[0];
    const valueColumn = numericColumns[0];
    
    // Ограничиваем количество категорий для графика
    const topCategories = [...new Set(data.map(item => item[categoryColumn]))].slice(0, 6);
    
    // Вычисляем максимальное значение для масштабирования
    const maxValue = Math.max(...data
      .filter(item => topCategories.includes(item[categoryColumn]))
      .map(item => Number(item[valueColumn]) || 0)
    );
    
    // Группируем данные по категориям
    const chartData = topCategories.map(category => {
      const categoryItems = data.filter(item => item[categoryColumn] === category);
      const sum = categoryItems.reduce((acc, item) => acc + (Number(item[valueColumn]) || 0), 0);
      return { category, value: sum };
    }).sort((a, b) => b.value - a.value);
    
    return (
      <div className="p-4 border rounded-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Визуализация данных</h3>
          <div className="text-sm text-muted-foreground">
            По полям: {categoryColumn} / {valueColumn}
          </div>
        </div>
        
        <div className="space-y-3">
          {chartData.map(item => {
            const percentage = Math.round((item.value / maxValue) * 100);
            return (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[200px]">
                    {item.category}
                  </span>
                  <span>{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {topCategories.length < new Set(data.map(item => item[categoryColumn])).size && (
          <div className="mt-4 text-xs text-center text-muted-foreground">
            Показаны только топ-{topCategories.length} категорий
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Результат сведения</CardTitle>
        <Button 
          onClick={onDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Скачать Excel
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 flex flex-col items-center">
              <p className="text-muted-foreground text-sm mb-1">Строк данных</p>
              <p className="text-2xl font-bold">{data.length}</p>
            </Card>
            <Card className="p-4 flex flex-col items-center">
              <p className="text-muted-foreground text-sm mb-1">Столбцов</p>
              <p className="text-2xl font-bold">{columns.length}</p>
            </Card>
            <Card className="p-4 flex flex-col items-center">
              <p className="text-muted-foreground text-sm mb-1">Числовых полей</p>
              <p className="text-2xl font-bold">{numericColumns.length}</p>
            </Card>
          </div>
          
          <Tabs defaultValue="table">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table2 className="w-4 h-4" />
                Таблица
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                График
              </TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4">
              {renderTable()}
            </TabsContent>
            <TabsContent value="chart" className="mt-4">
              {renderChart()}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedPreview;
