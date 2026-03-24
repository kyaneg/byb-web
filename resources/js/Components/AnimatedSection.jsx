import { motion } from 'framer-motion';

const springConfig = {
    type: "spring",
    stiffness: 400,
    damping: 80,
    mass: 1,
};

const createContainerVariants = (staggerDelay) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            ...springConfig
        }
    }
});

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: springConfig
    }
};

export default function AnimatedSection({
    children,
    className = "",
    as = "section",
    staggerDelay = 0.25
}) {
    const MotionComponent = motion[as] || motion.section;
    const containerVariants = createContainerVariants(staggerDelay);

    return (
        <MotionComponent
            className={className}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
        >
            {children}
        </MotionComponent>
    );
}
