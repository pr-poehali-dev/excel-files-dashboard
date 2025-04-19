import { useState, useRef } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { FileSpreadsheet, Upload, Plus, Download, Trash } from "lucide-react";

interface FileData {
  id: string;
  name: string;
  data: any[];
  selected: boolean;
}

const ExcelMerger = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [mergedData, setMergedData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    const newFiles: FileData[] = [];
    
    Array.from(event.target.files).forEach(file => {
      // В реальном проекте здесь будет обработка Excel файлов
      // используя библиотеку для работы с XLSX
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Имитация чтения данных из файла
          const mockData = [
            { "Имя": "Тестовое имя", "Возраст": 30, "Город": "Москва" },
            { "Имя": "Пример имени", "Возраст": 25, "Город": "Санкт-Петербург" }
          ];
          
          newFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            data: mockData,
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
    
    // В реальном проекте здесь будет логика объединения Excel файлов
    // Собираем все данные из выбранных файлов
    const allData = selectedFiles.flatMap(file => file.data);
    setMergedData(allData);
    
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
          <div className="space-y-6">
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
            
            {files.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Выбор</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead className="hidden sm:table-cell">Строк</TableHead>
                      <TableHead className="w-20 text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={file.selected}
                            onChange={() => toggleFileSelection(file.id)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          {file.name}
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
            )}
            
            {mergedData && (
              <div className="border rounded-md mt-6">
                <div className="p-3 bg-muted/50 font-medium">
                  Предпросмотр объединенных данных
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
                            <TableCell key={i}>{String(value)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {mergedData.length > 5 && (
                  <div className="p-2 text-sm text-center text-muted-foreground">
                    Показано 5 из {mergedData.length} строк. Скачайте файл для просмотра всех данных.
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t p-4 text-sm text-muted-foreground">
          <p>Поддерживаемые форматы: .xlsx, .xls</p>
          <p>Для корректного объединения, файлы должны иметь одинаковую структуру колонок.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExcelMerger;