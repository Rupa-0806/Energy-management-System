import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  BarChart3,
  Shield,
  Cpu,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Play,
  ChevronDown,
  Activity,
} from 'lucide-react';
import { useLenis } from '../hooks/useLenis';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  Float,
  ScaleIn,
} from '../components/animations/AnimatedContainer';
import { MeshGradient, GlowEffect } from '../components/animations/AnimatedGradient';
import { cn } from '../utils/cn';
import useAuth from '../hooks/useAuth';
import Footer from '../components/layouts/Footer';
import publicStatsApi from '../services/api/publicStatsApi';

// Custom hook for homepage stats
function useHomePageStats() {
  const [stats, setStats] = useState({
    companies: 500,
    costReduction: 30,
    energySaved: 1,
    uptime: 99.9,
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await publicStatsApi.getStats();
        setStats({
          companies: data.totalCompanies || 500,
          costReduction: Math.round(data.energySavedPercent || 30),
          energySaved: data.energySavedMillions || 1,
          uptime: data.uptimePercent || 99.9,
        });
        setIsLive(true);
      } catch (err) {
        console.warn('Using default stats');
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, isLive };
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <HoverScale>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </HoverScale>
  );
}

// Stats card component
function StatCard({ value, label, suffix = '', prefix = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent mb-2">
        <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
      </div>
      <p className="text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  );
}

// Device showcase component
function DeviceShowcase() {
  const devices = [
    { icon: Monitor, label: 'Desktop', size: 'w-16 h-16' },
    { icon: Tablet, label: 'Tablet', size: 'w-12 h-12' },
    { icon: Smartphone, label: 'Mobile', size: 'w-10 h-10' },
  ];

  return (
    <div className="flex items-end justify-center gap-4">
      {devices.map((device, index) => (
        <motion.div
          key={device.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 }}
          className="flex flex-col items-center"
        >
          <Float duration={3 + index} distance={5}>
            <div className={cn(
              'bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30',
              device.size
            )}>
              <device.icon className="w-1/2 h-1/2" />
            </div>
          </Float>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {device.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// Testimonial card
function TestimonialCard({ quote, author, role, company, avatar }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {avatar}
        </div>
        <div>
          <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{quote}"</p>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{author}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {role} at {company}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Fetch real-time stats
  const { stats, isLive } = useHomePageStats();

  // Initialize Lenis smooth scrolling
  useLenis();

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Real-time Monitoring',
      description:
        'Monitor energy consumption across all devices in real-time with live updates and instant alerts.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description:
        'Gain deep insights with comprehensive reports, trends analysis, and predictive forecasting.',
    },
    {
      icon: Shield,
      title: 'Smart Alerts',
      description:
        'Receive intelligent notifications for anomalies, thresholds, and optimization opportunities.',
    },
    {
      icon: Cpu,
      title: 'Device Management',
      description:
        'Centrally manage and control all connected devices with remote configuration capabilities.',
    },
    {
      icon: TrendingDown,
      title: 'Cost Optimization',
      description:
        'Identify energy waste and implement strategies to reduce costs by up to 30%.',
    },
    {
      icon: Globe,
      title: 'Multi-site Support',
      description:
        'Manage energy across multiple locations from a single dashboard with unified reporting.',
    },
  ];

  const testimonials = [
    {
      quote:
        'This platform reduced our energy costs by 25% in the first quarter. The real-time insights are invaluable.',
      author: 'Sarah Chen',
      role: 'Operations Director',
      company: 'TechCorp Inc.',
      avatar: 'SC',
    },
    {
      quote:
        'The best energy management solution we have used. The interface is intuitive and the analytics are powerful.',
      author: 'Michael Rodriguez',
      role: 'Facility Manager',
      company: 'Global Industries',
      avatar: 'MR',
    },
    {
      quote:
        'Outstanding customer support and continuous improvements. Highly recommend for any enterprise.',
      author: 'Emily Watson',
      role: 'Sustainability Lead',
      company: 'EcoFirst Solutions',
      avatar: 'EW',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                EnergyMS
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('stats')}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Results
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Testimonials
              </button>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-shadow"
                >
                  Go to Dashboard
                </motion.button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    Sign In
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-shadow"
                  >
                    Get Started
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <MeshGradient className="absolute inset-0 opacity-30 dark:opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn delay={0.2}>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                  Trusted by 500+ companies worldwide
                </span>
              </FadeIn>

              <FadeIn delay={0.3}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                  Smart Energy{' '}
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    Management
                  </span>{' '}
                  for Modern Enterprises
                </h1>
              </FadeIn>

              <FadeIn delay={0.4}>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Monitor, analyze, and optimize your energy consumption in real-time.
                  Reduce costs, improve efficiency, and achieve your sustainability goals
                  with our comprehensive energy management platform.
                </p>
              </FadeIn>

              <FadeIn delay={0.5}>
                <div className="flex flex-wrap gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                    className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsVideoPlaying(true)}
                    className="px-8 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl font-medium border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </motion.button>
                </div>
              </FadeIn>

              <FadeIn delay={0.6}>
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-900"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rated 4.9/5 from 1000+ reviews
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="relative">
              <ScaleIn delay={0.4}>
                <GlowEffect color="primary">
                  <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
                    {/* Mock Dashboard Preview */}
                    <div className="p-4 bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {[
                          { label: 'Energy', value: '2.8 MWh', color: 'primary' },
                          { label: 'Cost', value: '$1,425', color: 'success' },
                          { label: 'Devices', value: '24', color: 'warning' },
                          { label: 'Alerts', value: '3', color: 'danger' },
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4"
                          >
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.label}
                            </p>
                            <p className={cn(
                              'text-xl font-bold',
                              item.color === 'primary' && 'text-primary-600 dark:text-primary-400',
                              item.color === 'success' && 'text-green-600 dark:text-green-400',
                              item.color === 'warning' && 'text-yellow-600 dark:text-yellow-400',
                              item.color === 'danger' && 'text-red-600 dark:text-red-400'
                            )}>
                              {item.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                      {/* Mini chart visualization */}
                      <div className="h-32 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 70, 50, 75, 60, 85, 55, 90].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                            className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </GlowEffect>
              </ScaleIn>

              {/* Floating elements */}
              <Float duration={4} distance={15}>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <TrendingDown className="w-10 h-10" />
                </div>
              </Float>
              <Float duration={5} distance={10}>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <BarChart3 className="w-8 h-8" />
                </div>
              </Float>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.button
              onClick={() => scrollToSection('features')}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center text-gray-400 hover:text-primary-500 transition-colors"
            >
              <span className="text-sm mb-2">Scroll to explore</span>
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
                Features
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything you need to manage energy
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our comprehensive platform provides all the tools you need to monitor,
                analyze, and optimize your energy consumption.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
                Results
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted by industry leaders
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                See the impact our platform has made for businesses worldwide.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={stats.companies} suffix="+" label="Companies" />
            <StatCard value={stats.costReduction} suffix="%" label="Avg. Cost Reduction" />
            <StatCard value={stats.energySaved} prefix="$" suffix="M+" label="Energy Saved" />
            <StatCard value={stats.uptime} suffix="%" label="Uptime" />
          </div>
          
          {/* Live indicator */}
          {isLive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
                <Activity className="w-3 h-3 animate-pulse" />
                Live data from {stats.companies}+ active companies
              </div>
            </motion.div>
          )}

          {/* Cross-platform showcase */}
          <FadeIn delay={0.3}>
            <div className="mt-20 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Works on all your devices
              </h3>
              <DeviceShowcase />
              <p className="text-gray-600 dark:text-gray-400 mt-8 max-w-xl mx-auto">
                Access your energy dashboard from any device - desktop, tablet, or mobile.
                Our responsive design ensures a seamless experience everywhere.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What our customers say
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.15}>
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <TestimonialCard {...testimonial} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to optimize your energy consumption?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of companies that have already transformed their energy
              management with our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                className="px-8 py-3 bg-white text-primary-600 rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-transparent text-white rounded-xl font-medium border-2 border-white/30 hover:bg-white/10 transition-all"
              >
                Schedule Demo
              </motion.button>
            </div>
          </FadeIn>

          {/* Trust badges */}
          <FadeIn delay={0.3}>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
              {[
                { icon: CheckCircle2, text: 'No credit card required' },
                { icon: CheckCircle2, text: '14-day free trial' },
                { icon: CheckCircle2, text: 'Cancel anytime' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/80">
                  <item.icon className="w-5 h-5" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden max-w-4xl w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-700">
                <p className="text-gray-600 dark:text-gray-400">
                  Demo video placeholder
                </p>
              </div>
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
