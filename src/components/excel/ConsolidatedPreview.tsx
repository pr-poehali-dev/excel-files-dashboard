import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  PanelLeftOpen 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConsolidatedPreviewProps {
  data: any[] | null;
  onDownload: () => void;
}

/**
 * Компонент для отображения сведенных данных и диаграмм
 */
const ConsolidatedPreview = ({ data, onDownload }: ConsolidatedPreviewProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="border border-dashed rounded-md p-8 text-center">
        <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Нет данных для отображения</h3>
        <p className="text-muted-foreground">
          Сначала выполните сведение файлов
        </p>
      </div>
    );
  }

  // Определяем колонки из данных
  const columns = Object.keys(data[0]);
  
  // Подготавливаем данные для диаграммы (первые 5 строк и 2 числовых столбца)
  const chartColumns = columns.filter(column => 
    typeof data[0][column] === 'number' || 
    !isNaN(parseFloat(data[0][column]))
  ).slice(0, 2);
  
  const chartData = data.slice(0, 5).map((row, index) => {
    const item: any = { name: `Строка ${index + 1}` };
    chartColumns.forEach(column => {
      item[column] = typeof row[column] === 'number' 
        ? row[column] 
        : parseFloat(row[column]) || 0;
    });
    return item;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Результат сведения</h3>
          <p className="text-sm text-muted-foreground">
            Всего строк: {data.length}, столбцов: {columns.length}
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
      
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table" className="flex items-center gap-1">
            <PanelLeftOpen className="h-4 w-4" />
            Таблица
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Диаграмма
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Предпросмотр данных</CardTitle>
              <CardDescription>
                Показаны первые 10 строк из {data.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] rounded-md border mt-4">
                <div className="p-4">
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
                              {String(row[column] ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Визуализация данных</CardTitle>
              <CardDescription>
                График по первым 5 строкам и {chartColumns.length} числовым столбцам
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartColumns.length > 0 ? (
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      {chartColumns.map((column, index) => (
                        <Bar
                          key={column}
                          dataKey={column}
                          fill={index === 0 ? "#8884d8" : "#82ca9d"}
                          name={column}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center border rounded-md mt-4">
                  <p className="text-muted-foreground text-center">
                    Невозможно построить график. Не найдены числовые столбцы в данных.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedPreview;
