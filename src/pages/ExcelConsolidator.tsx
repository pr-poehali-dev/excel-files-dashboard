import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TableProperties } from "lucide-react";
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
    settings,
    consolidatedData,
    handleFileUpload,
    removeFile,
    clearAllFiles,
    handleConsolidate,
    handleDownload,
    updateSettings,
    toggleFileSelection
  } = useExcelConsolidator();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          &larr; Назад на главную
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TableProperties className="text-blue-600 h-6 w-6" />
            Сведение Excel файлов
          </CardTitle>
          <CardDescription>
            Загрузите файлы Excel для создания сводных таблиц и отчетов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <FileUploadArea onFilesUpload={handleFileUpload} />
              <FilesList 
                files={files} 
                onToggleFileSelection={toggleFileSelection}
                onRemoveFile={removeFile}
                onClearAllFiles={clearAllFiles}
              />
            </div>
            
            <div className="space-y-6">
              <ConsolidationSettings 
                settings={settings} 
                onUpdateSettings={updateSettings} 
                disabled={files.length === 0}
              />
              
              <Button 
                className="w-full"
                size="lg"
                onClick={handleConsolidate}
                disabled={files.filter(f => f.selected).length === 0}
              >
                Свести данные
              </Button>
            </div>
          </div>
          
          {consolidatedData && (
            <div className="mt-8">
              <ConsolidatedPreview 
                data={consolidatedData}
                onDownload={handleDownload}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t p-4 text-sm text-muted-foreground">
          <p>Поддерживаемые форматы: .xlsx, .xls</p>
          <p>Для корректного сведения файлы должны иметь совместимую структуру данных.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExcelConsolidator;
