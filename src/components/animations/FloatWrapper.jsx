import { motion } from 'framer-motion'

export default function FloatWrapper({
  children,
  amplitude = 12,
  duration = 4,
  delay = 0,
  rotate = false,
  className = '',
  style = {},
}) {
  return (
    <motion.div
      className={className}
      style={style}
      animate={{
        y: [0, -amplitude, 0],
        rotate: rotate ? [0, 1.5, -0.5, 0] : 0,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
        times: rotate ? [0, 0.33, 0.66, 1] : [0, 0.5, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
