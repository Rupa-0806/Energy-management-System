import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';
import { TrendingUp, Users, Building2, Award, Zap, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';
import publicStatsApi from '../../services/api/publicStatsApi';

// Default stats shown while loading or on error
const defaultStats = {
  activeUsers: 50000,
  totalLocations: 10000,
  energySavedPercent: 35,
  uptimePercent: 99.9,
};

// Custom hook for fetching public stats
function usePublicStats(refreshInterval = 30000) {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await publicStatsApi.getStats();
      setStats({
        activeUsers: data.activeUsers || defaultStats.activeUsers,
        totalLocations: data.totalLocations || defaultStats.totalLocations,
        energySavedPercent: data.energySavedPercent || defaultStats.energySavedPercent,
        uptimePercent: data.uptimePercent || defaultStats.uptimePercent,
        totalDevices: data.totalDevices,
        onlineDevices: data.onlineDevices,
      });
      setError(null);
    } catch (err) {
      console.warn('Failed to fetch public stats, using defaults:', err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats periodically for real-time updates
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  return { stats, loading, error, refetch: fetchStats };
}

// Build stats config from fetched data
function buildStatsConfig(stats) {
  return [
    {
      id: 1,
      icon: Users,
      value: stats.activeUsers,
      suffix: '+',
      label: 'Active Users',
      description: 'Businesses trust our platform',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      icon: Building2,
      value: stats.totalLocations,
      suffix: '+',
      label: 'Locations',
      description: 'Managed worldwide',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 3,
      icon: TrendingUp,
      value: stats.energySavedPercent,
      suffix: '%',
      label: 'Energy Saved',
      description: 'Average reduction',
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 4,
      icon: Award,
      value: stats.uptimePercent,
      suffix: '%',
      label: 'Uptime',
      description: 'System reliability',
      color: 'from-purple-500 to-violet-500',
    },
  ];
}

function AnimatedCounter({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, { 
    mass: 1, 
    stiffness: 50, 
    damping: 20 
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayValue(decimals > 0 ? latest.toFixed(decimals) : Math.round(latest));
    });
  }, [spring, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100 
      }}
      className="relative group"
    >
      <div
        className={cn(
          'relative p-6 lg:p-8 rounded-2xl overflow-hidden',
          'bg-white dark:bg-slate-800/50',
          'border border-gray-100 dark:border-slate-700/50',
          'hover:border-primary-200 dark:hover:border-primary-700/50',
          'transition-all duration-300',
          'hover:shadow-xl hover:-translate-y-1'
        )}
      >
        {/* Gradient overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500',
            stat.color
          )}
        />

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
            'bg-gradient-to-br shadow-lg',
            stat.color
          )}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        {/* Value */}
        <div className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
          <AnimatedCounter 
            value={stat.value} 
            suffix={stat.suffix}
            decimals={stat.value % 1 !== 0 ? 1 : 0}
          />
        </div>

        {/* Label */}
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
          {stat.label}
        </div>

        {/* Description */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {stat.description}
        </div>

        {/* Decorative element */}
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: '60%' } : {}}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
          className={cn(
            'absolute bottom-0 left-0 h-1 rounded-full bg-gradient-to-r',
            stat.color
          )}
        />
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  
  // Fetch real-time stats
  const { stats, loading } = usePublicStats(30000);
  
  // Memoize stats config to prevent unnecessary re-renders
  const statsConfig = useMemo(() => buildStatsConfig(stats), [stats]);

  return (
    <section
      ref={containerRef}
      className="py-20 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Floating decorations */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 right-[20%] w-32 h-32 bg-primary-300/20 dark:bg-primary-600/10 rounded-full blur-2xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-20 left-[15%] w-40 h-40 bg-secondary-300/20 dark:bg-secondary-600/10 rounded-full blur-2xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Live indicator */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm"
            >
              <Activity className="w-3 h-3 animate-pulse" />
              Live Stats
            </motion.div>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of organizations that have transformed their energy management
            with our platform.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>

        {/* Logos Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            TRUSTED BY LEADING COMPANIES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['Tesla', 'Google', 'Microsoft', 'Amazon', 'Apple'].map((company, i) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                className="text-2xl font-bold text-gray-400 dark:text-gray-600"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
