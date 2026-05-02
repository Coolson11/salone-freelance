import React from 'react';

export const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-16 mt-1"></div>
  </div>
);

export const JobCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-full">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
    </div>
    
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
    
    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

export const TalentCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex items-center mb-6">
      <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    
    <div className="flex items-center justify-between mb-6">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
    
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
    
    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-1"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const JobDetailsSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-cols-2 space-y-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-4 mb-8">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-4 pt-8 border-t border-gray-50">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="h-12 bg-gray-200 rounded-xl w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
        </div>
        <div className="bg-gray-900 rounded-3xl p-8 text-white">
          <div className="h-6 bg-gray-800 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-3xl mb-8"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm -mt-24 relative z-10">
            <div className="w-32 h-32 bg-gray-200 rounded-2xl mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="max-w-4xl mx-auto animate-pulse">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
          <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ApplicantSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="h-16 bg-gray-50 rounded-xl w-full"></div>
        <div className="flex gap-3">
          <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ChatListSkeleton = () => (
  <div className="flex-1 overflow-y-auto divide-y divide-gray-50 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="p-4 flex items-start space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-10"></div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);
