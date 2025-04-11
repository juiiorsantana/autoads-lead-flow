
import { Card } from "@/components/ui/card";

interface Ad {
  id: string;
  titulo: string;
  preco: number;
  imagem: string;
  status: string;
}

export function AdCard({ ad }: { ad: Ad }) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <img
        src={ad.imagem}
        alt={ad.titulo}
        className="w-24 h-24 object-cover rounded"
      />
      <div>
        <h3 className="text-lg font-semibold">{ad.titulo}</h3>
        <p className="text-gray-500">R$ {ad.preco.toLocaleString()}</p>
        <p className="text-sm text-blue-500 capitalize">{ad.status}</p>
      </div>
    </Card>
  );
}
