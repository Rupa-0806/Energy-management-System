import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function Card({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  icon: Icon,
  animated = true,
  delay = 0,
  hover = true,
}) {
  const CardWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay },
  } : {};

  return (
    <CardWrapper
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6',
        'border border-gray-100 dark:border-slate-700',
        hover && 'hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300',
        'relative overflow-hidden',
        className
      )}
      {...animationProps}
    >
      {/* Header */}
      {(title || subtitle || Icon) && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-500" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {children}
    </CardWrapper>
  );
}
