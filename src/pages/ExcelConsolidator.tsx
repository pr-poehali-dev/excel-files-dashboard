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
import { TableProperties, Download, ArrowLeftRight } from "lucide-react";

// Импорт компонентов
import FileUploadArea from "@/components/excel/FileUploadArea";
import FilesList from "@/components/excel/FilesList";
import ConsolidationSettings from "@/components/excel/ConsolidationSettings";
import ConsolidatedPreview from "@/components/excel/ConsolidatedPreview";

// Импорт логики
import { useExcelConsolidator } from "@/hooks/useExcelConsolidator";

/**
 * Страница для сведения Excel файлов
 */
const ExcelConsolidator = () => {
  const {
    files,
    consolidatedData,
    chartData,
    availableColumns,
    settings,
    handleFileUpload,
    handleConsolidateFiles,
    handleDownloadConsolidated,
    toggleFileSelection,
    removeFile,
    selectAllFiles,
    updateSettings
  } = useExcelConsolidator();

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Сведение Excel файлов</CardTitle>
          <CardDescription>
            Загрузите файлы Excel для их консолидации по заданным параметрам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="files" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="files">Файлы</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="result" disabled={!consolidatedData}>Результат</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="space-y-6">
              <FileUploadArea onFileUpload={handleFileUpload} />
              
              <div className="flex justify-between items-center pt-2">
                <h3 className="text-lg font-medium">Загруженные файлы</h3>
                <Button 
                  onClick={handleConsolidateFiles}
                  variant="secondary"
                  className="flex items-center gap-2"
                  disabled={files.filter(f => f.selected).length === 0}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Свести выбранные
                </Button>
              </div>
              
              <FilesList 
                files={files}
                onToggleSelection={toggleFileSelection}
                onRemoveFile={removeFile}
                onSelectAll={selectAllFiles}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <ConsolidationSettings 
                settings={settings}
                onUpdateSettings={updateSettings}
                availableColumns={availableColumns}
                filesExist={files.length > 0}
              />
            </TabsContent>
            
            <TabsContent value="result" className="space-y-6">
              <ConsolidatedPreview 
                data={consolidatedData}
                chartData={chartData}
                onDownload={handleDownloadConsolidated}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t p-4 text-sm text-muted-foreground">
          <p>Поддерживаемые форматы: .xlsx, .xls</p>
          <p>Доступны различные методы сведения данных: простое объединение, сводка и сводная таблица.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExcelConsolidator;
