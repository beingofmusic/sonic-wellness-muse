
import React from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfViewerProps {
  url: string;
  title: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  return (
    <div className="border border-white/10 rounded-lg p-4 bg-card/30 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-music-primary" />
          <span className="font-medium">{title} Resources</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
          className="text-xs flex items-center gap-1"
        >
          <Download className="h-3 w-3" />
          Download PDF
        </Button>
      </div>
      
      <div className="aspect-[4/3] w-full bg-black/50 rounded overflow-hidden">
        <iframe
          src={url}
          title={title}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default PdfViewer;
