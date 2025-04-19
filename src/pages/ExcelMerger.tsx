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
import { Plus, Download } from "lucide-react";

// Импорт компонентов
import FileUploadButton from "@/components/excel/FileUploadButton";
import FilesTable from "@/components/excel/FilesTable";
import EmptyFilesList from "@/components/excel/EmptyFilesList";
import MergeSettings from "@/components/excel/MergeSettings";
import ResultPreview from "@/components/excel/ResultPreview";

// Импорт логики
import { useExcelMerger } from "@/hooks/useExcelMerger";

/**
 * Страница для объединения Excel файлов
 */
const ExcelMerger = () => {
  const {
    files,
    mergedData,
    availableColumns,
    mergeOptions,
    handleFileUpload,
    handleMergeFiles,
    handleDownloadMerged,
    toggleFileSelection,
    removeFile,
    selectAllFiles,
    updateMergeOptions
  } = useExcelMerger();

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
                <FileUploadButton onFileUpload={handleFileUpload} />
                
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
                <FilesTable 
                  files={files}
                  onToggleFileSelection={toggleFileSelection}
                  onRemoveFile={removeFile}
                  onSelectAllFiles={selectAllFiles}
                />
              ) : (
                <EmptyFilesList />
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <MergeSettings 
                mergeOptions={mergeOptions}
                onUpdateMergeOptions={updateMergeOptions}
                availableColumns={availableColumns}
                filesExist={files.length > 0}
              />
            </TabsContent>
            
            <TabsContent value="result" className="space-y-6">
              <ResultPreview 
                mergedData={mergedData}
                onDownload={handleDownloadMerged}
              />
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
