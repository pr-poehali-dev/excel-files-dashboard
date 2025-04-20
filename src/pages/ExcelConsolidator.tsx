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
import { Activity, ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

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
      <div className="flex items-center gap-2 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Сведение Excel файлов</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Инструмент сведения данных
          </CardTitle>
          <CardDescription>
            Загрузите Excel файлы для их консолидации с различными настройками обработки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="files" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="files">Файлы</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="result" disabled={!consolidatedData}>Результат</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="space-y-6">
              {files.length === 0 ? (
                <FileUploadArea onFileUpload={handleFileUpload} />
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => handleFileUpload([])}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Добавить файлы
                    </Button>
                    
                    <Button 
                      onClick={handleConsolidateFiles}
                      variant="default"
                      className="flex items-center gap-2"
                      disabled={files.filter(f => f.selected).length === 0}
                    >
                      <Activity className="h-4 w-4" />
                      Консолидировать файлы
                    </Button>
                    
                    {consolidatedData && (
                      <Button 
                        onClick={handleDownloadConsolidated}
                        variant="secondary"
                        className="flex items-center gap-2 ml-auto"
                      >
                        <Download className="h-4 w-4" />
                        Скачать результат
                      </Button>
                    )}
                  </div>
                  
                  <FilesList 
                    files={files}
                    onToggleFileSelection={toggleFileSelection}
                    onRemoveFile={removeFile}
                    onSelectAllFiles={selectAllFiles}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <ConsolidationSettings 
                settings={settings}
                onUpdateSettings={updateSettings}
                availableColumns={availableColumns}
                filesExist={files.length > 0}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleConsolidateFiles}
                  disabled={files.filter(f => f.selected).length === 0}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Консолидировать с этими настройками
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="result" className="space-y-6">
              <ConsolidatedPreview 
                consolidatedData={consolidatedData}
                onDownload={handleDownloadConsolidated}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t p-4 text-sm text-muted-foreground">
          <p>Поддерживаемые форматы: .xlsx, .xls</p>
          <p>Инструмент позволяет объединять, группировать и сводить данные из нескольких Excel файлов.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExcelConsolidator;
