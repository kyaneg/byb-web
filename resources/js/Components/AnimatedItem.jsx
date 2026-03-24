import { motion } from 'framer-motion';

const springConfig = {
    type: "spring",
    stiffness: 400,
    damping: 80,
    mass: 1,
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: springConfig
    }
};

export default function AnimatedItem({ children, className = "", as = "div" }) {
    const MotionComponent = motion[as] || motion.div;

    return (
        <MotionComponent
            className={className}
            variants={itemVariants}
        >
            {children}
        </MotionComponent>
    );
}
