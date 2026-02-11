import { useState, useRef } from "react";
import { Camera, Upload, Loader2, Leaf, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScanResult {
  product: string;
  category: string;
  emission_kg: number;
  breakdown: string;
  eco_tip: string;
}

const ProductScanner = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const analyze = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-product", {
        body: { imageBase64: preview },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as ScanResult);
      toast.success(`Scanned: ${data.product}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const categoryColors: Record<string, string> = {
    food: "bg-eco-lime/20 text-eco-lime",
    electronics: "bg-eco-teal/20 text-eco-teal",
    clothing: "bg-eco-amber/20 text-eco-amber",
    packaging: "bg-eco-danger/20 text-eco-danger",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <div className="glass-card rounded-xl p-6 eco-shadow space-y-4">
      <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
        <Camera className="h-5 w-5 text-primary" />
        Product Scanner
      </h3>
      <p className="text-sm text-muted-foreground">
        Upload a photo of food or a product to estimate its carbon footprint.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {!preview ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground text-center">
            Click or drag & drop an image
          </span>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={clear}
            className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1 hover:bg-foreground/90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {preview && !result && (
        <Button
          onClick={analyze}
          disabled={loading}
          className="w-full gradient-eco text-primary-foreground font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Package className="h-4 w-4 mr-2" />
              Estimate Carbon Footprint
            </>
          )}
        </Button>
      )}

      {result && (
        <div className="space-y-3 animate-count-up">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-semibold text-foreground">
              {result.product}
            </h4>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                categoryColors[result.category] || categoryColors.other
              }`}
            >
              {result.category}
            </span>
          </div>

          <div className="text-center py-3 bg-secondary/50 rounded-lg">
            <p className="text-3xl font-heading font-bold text-foreground">
              {result.emission_kg}{" "}
              <span className="text-base font-normal">kg CO₂</span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground">{result.breakdown}</p>

          <div className="flex items-start gap-2 bg-primary/10 rounded-lg p-3">
            <Leaf className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">{result.eco_tip}</p>
          </div>

          <Button variant="outline" onClick={clear} className="w-full">
            Scan Another Product
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductScanner;
