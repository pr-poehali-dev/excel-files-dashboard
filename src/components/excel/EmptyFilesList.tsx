import { FileSpreadsheet } from "lucide-react";

/**
 * Компонент для отображения пустого состояния списка файлов
 */
const EmptyFilesList = () => {
  return (
    <div className="border border-dashed rounded-md p-8 text-center">
      <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Нет загруженных файлов</h3>
      <p className="text-muted-foreground">
        Загрузите Excel файлы для начала работы
      </p>
    </div>
  );
};

export default EmptyFilesList;
