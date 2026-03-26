import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Fade In animation container
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  ...props
}) {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale In animation container
 */
export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children animation container
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  ...props
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger item for use with StaggerContainer
 */
export function StaggerItem({
  children,
  className,
  direction = 'up',
  ...props
}) {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...directions[direction] },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide In animation container
 */
export function SlideIn({
  children,
  className,
  direction = 'left',
  delay = 0,
  duration = 0.6,
  ...props
}) {
  const directions = {
    left: { x: '-100%' },
    right: { x: '100%' },
    up: { y: '100%' },
    down: { y: '-100%' },
  };

  return (
    <motion.div
      initial={{ ...directions[direction], opacity: 0 }}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover Scale animation wrapper
 */
export function HoverScale({
  children,
  className,
  scale = 1.05,
  ...props
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated counter component
 */
export function AnimatedNumber({
  value,
  className,
  duration = 2,
  formatFn = (n) => n.toLocaleString(),
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {formatFn(value)}
      </motion.span>
    </motion.span>
  );
}

/**
 * Reveal text animation
 */
export function RevealText({
  children,
  className,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      {...props}
    >
      <motion.div
        initial={{ y: '100%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Floating animation
 */
export function Float({
  children,
  className,
  duration = 3,
  distance = 10,
  ...props
}) {
  return (
    <motion.div
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pulse animation
 */
export function Pulse({
  children,
  className,
  scale = 1.05,
  duration = 2,
  ...props
}) {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default {
  FadeIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  SlideIn,
  HoverScale,
  AnimatedNumber,
  RevealText,
  Float,
  Pulse,
};
