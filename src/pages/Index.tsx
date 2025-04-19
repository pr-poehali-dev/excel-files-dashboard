import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileSpreadsheet } from "lucide-react";

const Index = () => {
  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Инструменты для работы с данными</CardTitle>
          <CardDescription>
            Выберите инструмент для начала работы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Link to="/excel-merger">
              <Button className="w-full flex items-center justify-start gap-2 h-14" variant="outline">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div className="flex flex-col items-start">
                  <span>Объединение Excel файлов</span>
                  <span className="text-xs text-muted-foreground">Соединение нескольких таблиц в одну</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;