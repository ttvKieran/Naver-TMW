"use client";

import { useState } from "react";
import { analyzeReceipt } from "./actions";
import Link from "next/link";
import Image from "next/image";

export default function ReceiptAnalyzerPage() {
  const [selectedImage, setSelectedImage] = useState<string>("/receipt.jpg");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(""); // Clear previous analysis
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let imageData: string;

      if (imageFile) {
        // Convert file to base64
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } else {
        // Use default receipt.jpg - convert to base64
        const response = await fetch("/receipt.jpg");
        const blob = await response.blob();
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const result = await analyzeReceipt(imageData);

      if (result.error) {
        setError(result.error);
      } else {
        setAnalysis(result.analysis);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary font-medium inline-flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Examples
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Receipt Analyzer</h1>
          </div>
        </div>
      </header>

      {/* Description */}
      <div className="bg-card/50 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm">👁️</span>
            ClovaX Vision with Image Analysis
          </h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            This example demonstrates ClovaX's vision capabilities (HCX-005
            model) to analyze receipt images. Upload your own receipt or use
            the default example to extract information like items, prices, and
            totals.
          </p>
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
            <p className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">
              Try it:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2"><span className="text-primary">•</span> Use the default receipt image to see the analysis</li>
              <li className="flex items-center gap-2"><span className="text-primary">•</span> Upload your own receipt image (PNG, JPG, WEBP)</li>
              <li className="flex items-center gap-2"><span className="text-primary">•</span> Click "Analyze Receipt" to extract information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-foreground">Receipt Image</h3>

              {/* Image Preview */}
              <div className="relative aspect-[3/4] bg-background rounded-2xl overflow-hidden mb-6 border border-border/50">
                {selectedImage && (
                  <Image
                    src={selectedImage}
                    alt="Receipt"
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {/* Upload Button */}
              <div className="space-y-4">
                <label className="block">
                  <span className="sr-only">Choose receipt image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-bold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20
                      cursor-pointer"
                  />
                </label>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : "Analyze Receipt"}
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results Section */}
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm h-full flex flex-col">
              <h3 className="text-xl font-bold mb-4 text-foreground">Analysis Results</h3>

              <div className="flex-1 bg-background/50 rounded-2xl border border-border/50 p-4 overflow-auto min-h-[300px]">
                {!analysis && !error && !isLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8">
                    <span className="text-4xl mb-4 opacity-20">📊</span>
                    <p>Click "Analyze Receipt" to see the results here.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-primary">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                      <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                      <p className="font-medium">Analyzing receipt...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 text-red-600 rounded-xl p-4 border border-red-500/20">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1">Error</div>
                    <div className="text-sm font-medium">{error}</div>
                  </div>
                )}

                {analysis && (
                  <div className="prose prose-sm max-w-none prose-invert">
                    <div className="whitespace-pre-wrap text-foreground font-mono text-sm">{analysis}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
