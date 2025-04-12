
interface AdVideoProps {
  videoUrl: string | null;
}

export function AdVideo({ videoUrl }: AdVideoProps) {
  if (!videoUrl) return null;
  
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-medium mb-3">Vídeo do veículo</h3>
      <div className="aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={(videoUrl || '').replace('watch?v=', 'embed/')}
          className="w-full h-full"
          allowFullScreen
          title="Video do anúncio"
        />
      </div>
    </div>
  );
}
