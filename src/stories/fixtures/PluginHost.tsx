import React, { useEffect, useRef } from "react";
import type { Task } from "../../types";
import { mountPluginApp } from "./plugin-host";

export interface PluginHostProps {
  tasks: Task[];
  width: number;
  height: number;
}

/** A story-friendly wrapper around mountPluginApp. */
export const PluginHost: React.FC<PluginHostProps> = ({
  tasks,
  width,
  height,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      throw new Error("PluginHost: stage element missing");
    }
    const mounted = mountPluginApp(stage, { tasks, width, height });
    // Unmounting a root while React renders this one is not allowed
    return () => {
      setTimeout(mounted.unmount, 0);
    };
  }, [tasks, width, height]);
  return <div ref={stageRef} data-testid="plugin-stage" />;
};
