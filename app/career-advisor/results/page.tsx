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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Kết Quả Phân Tích Nghề Nghiệp
          </h1>
          <p className="text-gray-600">
            Xin chào <span className="font-semibold text-indigo-600">{profileData.name}</span>!
            Đây là các nghề nghiệp phù hợp nhất với bạn.
          </p>
        </div>

        {/* Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {predictions.slice(0, 3).map((prediction, idx) => (
            <div
              key={prediction.career}
              className={`bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer border relative overflow-hidden group ${idx === 0 ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'
                }`}
              onClick={() => handleSelectCareer(prediction.career)}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  PHÙ HỢP NHẤT
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-2 group-hover:text-indigo-600 transition-colors">
                {prediction.career}
              </h3>

              {/* Match Score */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Độ phù hợp</span>
                  <span className="font-bold text-indigo-600">
                    {(prediction.matchScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${prediction.matchScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Reasons */}
              <div className="mb-4">
                <p className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Lý do phù hợp
                </p>
                <ul className="text-sm text-gray-600 space-y-2 pl-2">
                  {prediction.reasons.slice(0, 2).map((reason, i) => (
                    <li key={i} className="leading-relaxed text-xs">• {reason}</li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              {prediction.challenges.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-orange-700 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Lưu ý
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 pl-2">
                    {prediction.challenges.slice(0, 1).map((challenge, i) => (
                      <li key={i} className="leading-relaxed text-xs">• {challenge}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="w-full bg-white text-indigo-600 border border-indigo-200 py-3 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all text-sm font-bold shadow-sm group-hover:shadow-md">
                Xem Roadmap Chi Tiết →
              </button>
            </div>
          ))}
        </div>

        {/* AI Advice from ClovaX */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-60 -mr-16 -mt-16"></div>

          <div className="flex items-center gap-4 mb-8 relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-white text-2xl">💡</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Tư Vấn Từ AI Advisor
              </h2>
              <p className="text-sm text-indigo-600 font-medium">Powered by Naver ClovaX</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
              <span className="text-gray-600 font-medium animate-pulse">Đang phân tích với ClovaX AI...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
              <p className="text-red-700 font-medium">{error}</p>
              <p className="text-sm text-red-600 mt-2">
                Bạn vẫn có thể xem dự đoán và roadmap bên trên.
              </p>
            </div>
          ) : (
            <div className="prose prose-indigo max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                {aiAdvice}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/career-advisor')}
            className="flex-1 bg-white text-gray-700 border border-gray-200 py-4 px-6 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            ← Quay lại
          </button>
          <button
            onClick={() => handleSelectCareer(predictions[0].career)}
            className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
          >
            Xem Roadmap cho {predictions[0].career} →
          </button>
        </div>
      </div>
    </div>
  );
}
