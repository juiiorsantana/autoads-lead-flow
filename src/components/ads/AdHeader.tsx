
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Share2 } from "lucide-react";

interface AdHeaderProps {
  seller: any;
  ad: any;
  onShareClick: () => void;
}

export function AdHeader({ seller, ad, onShareClick }: AdHeaderProps) {
  return (
    <div className="p-4 flex items-center border-b">
      <Avatar className="h-12 w-12">
        <AvatarImage src={seller?.avatar_url} />
        <AvatarFallback>{seller?.full_name?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <div className="ml-3 flex-1">
        <p className="font-medium text-sm">{seller?.full_name || "Usuário"}</p>
        <div className="flex items-center text-xs text-gray-500">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{ad.localizacao || "Brasil"}</span>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="rounded-full h-9 w-9 p-0"
        onClick={onShareClick}
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
