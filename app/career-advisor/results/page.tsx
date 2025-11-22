"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCareerAdvice } from "./actions";


interface CareerMatch {
  career: string;
  matchScore: number;
  reasons: string[];
  challenges: string[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [predictions, setPredictions] = useState<CareerMatch[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const storedProfile = sessionStorage.getItem('profileData');
    const storedPredictions = sessionStorage.getItem('predictions');

    if (!storedProfile || !storedPredictions) {
      router.push('/career-advisor');
      return;
    }

    const profile = JSON.parse(storedProfile);
    const preds = JSON.parse(storedPredictions);

    setProfileData(profile);
    setPredictions(preds);

    generateCareerAdvice(profile, preds).then(result => {
      if (result.success && result.advice) {
        setAiAdvice(result.advice);
      } else {
        setError(result.error || 'Không thể tạo lời khuyên');
      }
      setIsLoading(false);
    });
  }, [router]);

  const handleSelectCareer = (career: string) => {
    sessionStorage.setItem('selectedCareer', career);
    router.push(`/career-advisor/roadmap?career=${encodeURIComponent(career)}`);
  };

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Kết Quả Phân Tích Nghề Nghiệp
          </h1>
          <p className="text-muted-foreground">
            Xin chào <span className="font-bold text-primary">{profileData.name}</span>!
            Đây là các nghề nghiệp phù hợp nhất với bạn.
          </p>
        </div>

        {/* Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {predictions.slice(0, 3).map((prediction, idx) => (
            <div
              key={prediction.career}
              className={`bg-card rounded-3xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer border relative overflow-hidden group ${idx === 0 ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
                }`}
              onClick={() => handleSelectCareer(prediction.career)}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  PHÙ HỢP NHẤT
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-4 mt-2 group-hover:text-primary transition-colors">
                {prediction.career}
              </h3>

              {/* Match Score */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">Độ phù hợp</span>
                  <span className="font-bold text-primary">
                    {(prediction.matchScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${prediction.matchScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Tại sao phù hợp?</h4>
                <ul className="space-y-2">
                  {prediction.reasons.slice(0, 3).map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="line-clamp-2">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Xem lộ trình chi tiết</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Advice */}
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              Lời Khuyên Từ AI
            </h2>
            
            {isLoading ? (
              <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Đang tạo lời khuyên chi tiết...
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <div className="whitespace-pre-wrap leading-relaxed bg-muted/30 p-6 rounded-2xl border border-border">
                  {aiAdvice}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
