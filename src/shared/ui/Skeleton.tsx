import { cn } from '@/shared/lib/utils';
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

/**
 * Base Skeleton Component
 */
export function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  return (
    <div 
      className={cn(
        'skeleton',
        variant === 'text' && 'skeleton-text',
        variant === 'circle' && 'skeleton-circle',
        className
      )} 
      {...props}
    />
  );
}

/**
 * Result Card Skeleton
 */
export function ResultCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
      </div>
      <div className="flex justify-center gap-2 py-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="circle" className="w-9 h-9" />
        ))}
      </div>
      <div className="pt-4 border-t border-gray-50 flex justify-between">
        <Skeleton variant="text" className="w-20 h-4" />
        <Skeleton variant="text" className="w-12 h-4" />
      </div>
    </div>
  );
}

/**
 * Ticket Card Skeleton
 */
export function TicketCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-5 pl-6 shadow-sm relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-100" />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-28 h-4" />
            <Skeleton variant="text" className="w-20 h-3" />
          </div>
        </div>
        <Skeleton variant="rect" className="w-16 h-6 rounded-full" />
      </div>
      <div className="flex gap-1.5 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="circle" className="w-8 h-8" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex gap-4">
          <div className="space-y-1">
            <Skeleton variant="text" className="w-8 h-2" />
            <Skeleton variant="text" className="w-10 h-3" />
          </div>
          <Skeleton variant="rect" className="w-6 h-6 rounded-lg" />
        </div>
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
    </div>
  );
}

/**
 * Movement Row Skeleton
 */
export function MovementRowSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="space-y-1.5">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="text" className="w-20 h-3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-14 h-5" />
    </div>
  );
}
