import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, TableProperties, Download } from "lucide-react";

// Импорт компонентов
import FileUploadArea from "@/components/excel/FileUploadArea";
import FilesList from "@/components/excel/FilesList";
import ConsolidationSettings from "@/components/excel/ConsolidationSettings";
import ConsolidatedPreview from "@/components/excel/ConsolidatedPreview";

// Импорт логики
import { useExcelConsolidator } from "@/hooks/useExcelConsolidator";

/**
 * Страница для сведения всех Excel файлов в один
 */
const ExcelConsolidator = () => {
  const {
    files,
    consolidatedData,
    settings,
    isProcessing,
    handleFilesUpload,
    handleConsolidate,
    handleRemoveFile,
    handleDownloadResult,
    updateSettings,
  } = useExcelConsolidator();

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Сведение Excel файлов</CardTitle>
          <CardDescription>
            Загрузите Excel файлы для их объединения в единую сводную таблицу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="upload">Загрузка</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="result" disabled={!consolidatedData}>Результат</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6">
              <FileUploadArea 
                onFilesUpload={handleFilesUpload} 
                isProcessing={isProcessing}
              />
              
              <FilesList 
                files={files}
                onRemoveFile={handleRemoveFile}
              />
              
              {files.length > 0 && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleConsolidate}
                    disabled={isProcessing || files.length === 0}
                    className="flex items-center gap-2"
                  >
                    <TableProperties className="h-4 w-4" />
                    Создать сводную таблицу
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <ConsolidationSettings 
                settings={settings}
                onUpdateSettings={updateSettings}
                disabled={files.length === 0}
              />
            </TabsContent>
            
            <TabsContent value="result" className="space-y-6">
              <ConsolidatedPreview 
                data={consolidatedData}
                onDownload={handleDownloadResult}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t p-4 text-sm text-muted-foreground">
          <p>Поддерживаемые форматы: .xlsx, .xls</p>
          <p>Для корректного сведения файлы должны иметь схожую структуру данных.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExcelConsolidator;
