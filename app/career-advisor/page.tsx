import { Suspense } from 'react';
import RoadmapPageClient from './RoadmapPageClient';

export default function RoadmapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải roadmap...</p>
        </div>
      </div>
    }>
      <RoadmapPageClient />
    </Suspense>
  );
}
