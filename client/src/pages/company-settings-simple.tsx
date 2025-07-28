import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function CompanySettingsSimple() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Configurações da Empresa</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Configurações</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta é uma versão simplificada da página de configurações para teste.</p>
        </CardContent>
      </Card>
    </div>
  );
}