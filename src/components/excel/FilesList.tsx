import { FileData } from "@/types/excel";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { FileSpreadsheet, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger 
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

interface FilesListProps {
  files: FileData[];
  onRemoveFile: (id: string) => void;
}

/**
 * Компонент для отображения списка загруженных файлов
 */
const FilesList = ({ files, onRemoveFile }: FilesListProps) => {
  if (files.length === 0) {
    return (
      <Card className="border-dashed border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Нет загруженных файлов</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Загруженные файлы ({files.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2">
                  <FileSpreadsheet className="h-5 w-5 mt-1 text-green-600 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-base truncate max-w-[180px]">{file.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {file.data.length} строк · {file.columns.length} столбцов
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => onRemoveFile(file.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-wrap gap-1 mb-2">
                {file.columns.slice(0, 3).map((column, index) => (
                  <Badge key={index} variant="outline" className="text-xs truncate max-w-[120px]">
                    {column}
                  </Badge>
                ))}
                {file.columns.length > 3 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge variant="secondary" className="text-xs cursor-help">
                        <Info className="h-3 w-3 mr-1" />
                        +{file.columns.length - 3}
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 p-2">
                      <p className="text-sm font-medium mb-2">Все столбцы:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {file.columns.map((column, index) => (
                          <span key={index} className="text-xs truncate">
                            • {column}
                          </span>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FilesList;
