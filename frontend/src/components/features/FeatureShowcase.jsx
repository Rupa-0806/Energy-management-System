import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Zap,
  BarChart3,
  Bell,
  Shield,
  Globe,
  Cpu,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const features = [
  {
    id: 1,
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Monitor energy consumption with live updates and interactive charts. Get instant insights into your usage patterns.',
    color: 'from-blue-500 to-cyan-500',
    benefits: ['Live data streaming', 'Interactive charts', 'Custom date ranges'],
  },
  {
    id: 2,
    icon: Zap,
    title: 'Smart Automation',
    description:
      'AI-powered automation that learns your patterns and optimizes energy usage automatically for maximum efficiency.',
    color: 'from-amber-500 to-orange-500',
    benefits: ['AI scheduling', 'Peak avoidance', 'Cost optimization'],
  },
  {
    id: 3,
    icon: Bell,
    title: 'Intelligent Alerts',
    description:
      'Get notified about unusual consumption, maintenance needs, and optimization opportunities in real-time.',
    color: 'from-rose-500 to-pink-500',
    benefits: ['Instant notifications', 'Customizable thresholds', 'Multi-channel alerts'],
  },
  {
    id: 4,
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-grade security with end-to-end encryption, SSO integration, and comprehensive audit logging.',
    color: 'from-green-500 to-emerald-500',
    benefits: ['End-to-end encryption', 'SSO support', 'Audit logs'],
  },
  {
    id: 5,
    icon: Globe,
    title: 'Multi-Location Support',
    description:
      'Manage energy across all your facilities from a single dashboard with location-based insights.',
    color: 'from-purple-500 to-violet-500',
    benefits: ['Unified dashboard', 'Location comparison', 'Regional settings'],
  },
  {
    id: 6,
    icon: Cpu,
    title: 'IoT Integration',
    description:
      'Seamless integration with thousands of smart devices and building management systems.',
    color: 'from-indigo-500 to-blue-500',
    benefits: ['500+ integrations', 'Auto-discovery', 'Plug & play setup'],
  },
];

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={cn(
          'relative bg-white dark:bg-slate-800 rounded-2xl p-6 h-full',
          'border border-gray-100 dark:border-slate-700',
          'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300',
          'overflow-hidden'
        )}
      >
        {/* Gradient background on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
            feature.color
          )}
        />

        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
            'bg-gradient-to-br shadow-lg',
            feature.color
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
          {feature.description}
        </p>

        {/* Benefits */}
        <ul className="space-y-2">
          {feature.benefits.map((benefit, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
              {benefit}
            </motion.li>
          ))}
        </ul>

        {/* Learn more link */}
        <motion.a
          href="#"
          className="inline-flex items-center gap-1 mt-4 text-sm text-primary-600 dark:text-primary-400 font-medium group/link"
          whileHover={{ x: 5 }}
        >
          Learn more
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </motion.a>
      </div>
    </motion.div>
  );
}

export default function FeatureShowcase() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-200/30 dark:bg-secondary-900/20 rounded-full blur-3xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          style={{ opacity }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Powerful Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Everything You Need to{' '}
            <span className="text-gradient">Manage Energy</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Our comprehensive platform provides all the tools you need to monitor, analyze,
            and optimize your energy consumption across all devices.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to experience all these features?
          </p>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-shadow"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
