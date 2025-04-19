import { useState, useRef, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileSpreadsheet, 
  Upload, 
  Plus, 
  Download, 
  Trash, 
  Settings, 
  AlertCircle 
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface FileData {
  id: string;
  name: string;
  data: any[];
  columns: string[];
  selected: boolean;
}

interface MergeOptions {
  mergeType: "vertical" | "horizontal";
  ignoreEmptyCells: boolean;
  keyColumn: string | null;
}

const ExcelMerger = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [mergedData, setMergedData] = useState<any[] | null>(null);
  const [mergeOptions, setMergeOptions] = useState<MergeOptions>({
    mergeType: "vertical",
    ignoreEmptyCells: false,
    keyColumn: null
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Обновление доступных столбцов при изменении списка файлов
    if (files.length > 0) {
      const allColumns = new Set<string>();
      files.forEach(file => {
        file.columns.forEach(column => allColumns.add(column));
      });
      setAvailableColumns(Array.from(allColumns));
    } else {
      setAvailableColumns([]);
    }
  }, [files]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const newFiles: FileData[] = [];
    
    Array.from(event.target.files).forEach(file => {
      // В реальном проекте здесь будет обработка Excel файлов
      // используя библиотеку для работы с XLSX
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Имитация чтения данных из файла - разные данные для разных файлов
          const mockData = [
            { "Имя": "Иванов Иван", "Возраст": 30, "Город": "Москва", "Отдел": "Продажи" },
            { "Имя": "Петров Петр", "Возраст": 25, "Город": "Санкт-Петербург", "Отдел": "Маркетинг" }
          ];
          
          // Используем индекс для создания разных данных для каждого файла
          if (newFiles.length > 0) {
            mockData.push({ "Имя": "Сидоров Сидор", "Возраст": 35, "Город": "Казань", "Отдел": "HR" });
          }
          
          const columns = Object.keys(mockData[0]);
          
          newFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            data: mockData,
            columns: columns,
            selected: true
          });
          
          setFiles(prev => [...prev, ...newFiles]);
          
          toast({
            title: "Файл загружен",
            description: `Файл "${file.name}" успешно загружен`,
          });
        } catch (error) {
          toast({
            title: "Ошибка",
            description: "Не удалось прочитать файл. Проверьте формат Excel.",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsArrayBuffer(file);
    });
    
    // Сбрасываем input чтобы можно было загрузить тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMergeFiles = () => {
    const selectedFiles = files.filter(file => file.selected);
    
    if (selectedFiles.length < 2) {
      toast({
        title: "Недостаточно файлов",
        description: "Выберите минимум два файла для объединения",
        variant: "destructive",
      });
      return;
    }
    
    // Логика объединения в зависимости от выбранного типа
    if (mergeOptions.mergeType === "vertical") {
      // Вертикальное объединение (строки одна под другой)
      const allData = selectedFiles.flatMap(file => file.data);
      setMergedData(allData);
    } else {
      // Горизонтальное объединение (по ключевому столбцу)
      if (!mergeOptions.keyColumn) {
        toast({
          title: "Требуется ключевой столбец",
          description: "Для горизонтального объединения необходимо выбрать ключевой столбец",
          variant: "destructive",
        });
        return;
      }
      
      // Создаем объединенные данные на основе ключевого столбца
      const mergedMap = new Map();
      
      selectedFiles.forEach(file => {
        file.data.forEach(row => {
          const keyValue = row[mergeOptions.keyColumn!];
          if (!keyValue && mergeOptions.ignoreEmptyCells) return;
          
          if (!mergedMap.has(keyValue)) {
            mergedMap.set(keyValue, {});
          }
          
          const mergedRow = mergedMap.get(keyValue);
          
          // Добавляем все поля из текущей строки
          Object.entries(row).forEach(([key, value]) => {
            // Если поле уже существует с другим значением, добавляем префикс файла
            if (key in mergedRow && mergedRow[key] !== value && key !== mergeOptions.keyColumn) {
              mergedRow[`${key} (${file.name})`] = value;
            } else {
              mergedRow[key] = value;
            }
          });
        });
      });
      
      setMergedData(Array.from(mergedMap.values()));
    }
    
    toast({
      title: "Файлы объединены",
      description: `Успешно объединено ${selectedFiles.length} файлов`,
    });
  };

  const handleDownloadMerged = () => {
    if (!mergedData) return;
    
    // В реальном проекте здесь будет логика сохранения объединенного файла
    toast({
      title: "Файл сохранен",
      description: "Объединенный файл успешно скачан",
    });
  };

  const toggleFileSelection = (id: string) => {
    setFiles(files.map(file => 
      file.id === id ? { ...file, selected: !file.selected } : file
    ));
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const selectAllFiles = (selected: boolean) => {
    setFiles(files.map(file => ({ ...file, selected })));
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Объединение Excel файлов</CardTitle>
          <CardDescription>
            Загрузите файлы Excel для их объединения в один файл
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="files" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="files">Файлы</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="result" disabled={!mergedData}>Результат</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Загрузить файлы
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button 
                  onClick={handleMergeFiles}
                  variant="secondary"
                  className="flex items-center gap-2"
                  disabled={files.filter(f => f.selected).length < 2}
                >
                  <Plus className="h-4 w-4" />
                  Объединить выбранные
                </Button>
                {mergedData && (
                  <Button 
                    onClick={handleDownloadMerged}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Скачать результат
                  </Button>
                )}
              </div>
              
              {files.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox 
                      id="selectAll" 
                      checked={files.every(f => f.selected)}
                      onCheckedChange={(checked) => selectAllFiles(!!checked)}
                    />
                    <label htmlFor="selectAll" className="text-sm cursor-pointer">
                      Выбрать все файлы
                    </label>
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Выбор</TableHead>
                          <TableHead>Название</TableHead>
                          <TableHead className="hidden sm:table-cell">Столбцы</TableHead>
                          <TableHead className="hidden sm:table-cell">Строк</TableHead>
                          <TableHead className="w-20 text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <Checkbox 
                                checked={file.selected}
                                onCheckedChange={() => toggleFileSelection(file.id)}
                                id={`file-${file.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4 text-green-600" />
                              <label htmlFor={`file-${file.id}`} className="cursor-pointer">
                                {file.name}
                              </label>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {file.columns.length}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {file.data.length}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeFile(file.id)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="border border-dashed rounded-md p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Нет загруженных файлов</h3>
                  <p className="text-muted-foreground">
                    Загрузите Excel файлы для начала работы
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="grid gap-6 max-w-md">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Тип объединения</h3>
                  <Select
                    value={mergeOptions.mergeType}
                    onValueChange={(value: 'vertical' | 'horizontal') => 
                      setMergeOptions({...mergeOptions, mergeType: value})
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
                          setMergeOptions({...mergeOptions, keyColumn: value || null})
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
                          setMergeOptions({...mergeOptions, ignoreEmptyCells: !!checked})
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
                
                {files.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Нет файлов</AlertTitle>
                    <AlertDescription>
                      Загрузите файлы для настройки параметров объединения
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="result" className="space-y-6">
              {mergedData ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">Результат объединения</h3>
                      <p className="text-sm text-muted-foreground">
                        Всего строк: {mergedData.length}
                      </p>
                    </div>
                    <Button 
                      onClick={handleDownloadMerged}
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
              ) : (
                <div className="border border-dashed rounded-md p-8 text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Нет данных для отображения</h3>
                  <p className="text-muted-foreground">
                    Сначала объедините файлы для просмотра результата
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t p-4 text-sm text-muted-foreground">
          <p>Поддерживаемые форматы: .xlsx, .xls</p>
          <p>Для корректного объединения файлы должны иметь совместимую структуру данных.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExcelMerger;