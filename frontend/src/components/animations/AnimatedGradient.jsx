import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Animated gradient background component
 */
export function AnimatedGradient({
  children,
  className,
  colors = ['#0ea5e9', '#8b5cf6', '#ec4899', '#0ea5e9'],
  duration = 10,
  ...props
}) {
  return (
    <div className={cn('relative overflow-hidden', className)} {...props}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r"
        style={{
          backgroundSize: '400% 400%',
          background: `linear-gradient(-45deg, ${colors.join(', ')})`,
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Animated mesh gradient background
 */
export function MeshGradient({
  children,
  className,
  ...props
}) {
  return (
    <div className={cn('relative overflow-hidden pointer-events-none', className)} {...props}>
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-yellow-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Animated glow effect
 */
export function GlowEffect({
  children,
  className,
  color = 'primary',
  ...props
}) {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-green-400 to-green-600',
    warning: 'from-yellow-400 to-yellow-600',
    danger: 'from-red-400 to-red-600',
    purple: 'from-purple-400 to-purple-600',
  };

  return (
    <div className={cn('relative group', className)} {...props}>
      <motion.div
        className={cn(
          'absolute -inset-0.5 bg-gradient-to-r rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200',
          colorClasses[color]
        )}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export default AnimatedGradient;
