import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

// Encapsulated Motion components to ensure strict typing of props like className and onClick
// which might be inferred as missing in some strict TypeScript environments with framer-motion.

export const MotionDiv = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, onClick, ...props }, ref) => (
  <motion.div ref={ref} className={className} onClick={onClick} {...props} />
));

export const MotionSpan = React.forwardRef<
  HTMLSpanElement,
  HTMLMotionProps<"span">
>(({ className, onClick, ...props }, ref) => (
  <motion.span ref={ref} className={className} onClick={onClick} {...props} />
));

export const MotionButton = React.forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<"button">
>(({ className, onClick, ...props }, ref) => (
  <motion.button ref={ref} className={className} onClick={onClick} {...props} />
));

export const MotionInput = React.forwardRef<
  HTMLInputElement,
  HTMLMotionProps<"input">
>(({ className, onClick, ...props }, ref) => (
  <motion.input ref={ref} className={className} onClick={onClick} {...props} />
));
