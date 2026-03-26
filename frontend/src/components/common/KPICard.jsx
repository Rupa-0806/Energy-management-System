import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function KPICard({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue, 
  icon: Icon, 
  className = '',
  delay = 0,
  animated = true 
}) {
  const isPositive = trend !== 'down';

  const CardWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
    whileHover: { y: -4, transition: { duration: 0.2 } },
  } : {};

  return (
    <CardWrapper
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-slate-700',
        'hover:shadow-xl hover:shadow-primary-500/5 transition-shadow duration-300',
        'relative overflow-hidden group',
        className
      )}
      {...animationProps}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          </div>
          {Icon && (
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 text-primary-500" />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-1">{unit}</span>}
          </p>
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium',
                isPositive
                  ? 'bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400'
                  : 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400'
              )}
            >
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {trendValue}%
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">vs last period</span>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
