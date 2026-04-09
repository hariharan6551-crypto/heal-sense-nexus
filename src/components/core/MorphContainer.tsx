import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface MorphContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  id: string;
}

export default function MorphContainer({ children, id, ...props }: MorphContainerProps) {
  return (
    <motion.div layoutId={id} {...props}>
      {children}
    </motion.div>
  );
}
