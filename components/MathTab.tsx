'use client';
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MATH_ACTIVITIES, LANE_CONFIG } from "@/lib/math-categories";
import type { MathMode, MathLane } from "@/lib/math-data";
import { speakText } from "@/lib/speech";
import { QuickLookMode, BuildMeMode, CountMode } from "@/components/math/SubitizeModes";
import { WhichMoreMode, ConservationMode } from "@/components/math/CompareModes";
import { NumberLineMode, OneMoreMode } from "@/components/math/PathModes";
import dynamic from "next/dynamic";

const NumberBondsMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.NumberBondsMode })), { ssr: false });
const HideFindMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.HideFindMode })), { ssr: false });
const BalanceMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.BalanceMode })), { ssr: false });
const AddMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.AddMode })), { ssr: false });
const MissingMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.MissingMode })), { ssr: false });
const TenFrameMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.TenFrameMode })), { ssr: false });

const LANES: MathLane[] = ['SUBITIZE', 'BUILD', 'COMPARE', 'PATH', 'COMPOSE'];

export default function MathTab() {
  const [activeLane, setActiveLane] = useState<MathLane>('SUBITIZE');
  const [subMode, setSubMode] = useState<MathMode>('QUICK_LOOK');

  useEffect(() => {
    speakText("Number time! Let us explore!");
  }, []);

  const handleLaneChange = useCallback((lane: MathLane) => {
    setActiveLane(lane);
    const firstActivity = MATH_ACTIVITIES.find(a => a.lane === lane);
    if (firstActivity) {
      setSubMode(firstActivity.id);
    }
  }, []);

  const handleActivityChange = useCallback((mode: MathMode, description: string) => {
    setSubMode(mode);
    speakText(description);
  }, []);

  const laneActivities = MATH_ACTIVITIES.filter(a => a.lane === activeLane);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Lane navigation */}
      <div className="grid grid-cols-5 gap-1 px-2 pt-3">
        {LANES.map(lane => {
          const cfg = LANE_CONFIG[lane];
          const isActive = lane === activeLane;
          return (
            <button
              key={lane}
              onClick={() => handleLaneChange(lane)}
              className={[
                "py-2.5 rounded-xl font-black text-xs transition-all shadow",
                isActive
                  ? `${cfg.color} text-white scale-105 shadow-md`
                  : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300",
              ].join(" ")}
            >
              <div>{cfg.icon}</div>
              <div>{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* Activity chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2 mt-2">
        {laneActivities.map(activity => {
          const isActive = activity.id === subMode;
          return (
            <button
              key={activity.id}
              onClick={() => handleActivityChange(activity.id, activity.description)}
              className={[
                "rounded-full px-3 py-1.5 font-black shadow flex-shrink-0 flex items-center gap-1 text-xs",
                isActive
                  ? `${LANE_CONFIG[activeLane].color} text-white`
                  : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300",
              ].join(" ")}
            >
              <span>{activity.icon}</span>
              <span>{activity.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="mt-3 px-3 pb-8 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={subMode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {subMode === 'QUICK_LOOK'   && <QuickLookMode />}
            {subMode === 'BUILD_ME'     && <BuildMeMode />}
            {subMode === 'COUNT'        && <CountMode />}
            {subMode === 'WHICH_MORE'   && <WhichMoreMode />}
            {subMode === 'CONSERVATION' && <ConservationMode />}
            {subMode === 'NUMBER_LINE'  && <NumberLineMode />}
            {subMode === 'ONE_MORE'     && <OneMoreMode />}
            {subMode === 'BONDS'        && <NumberBondsMode />}
            {subMode === 'HIDE_FIND'    && <HideFindMode />}
            {subMode === 'BALANCE'      && <BalanceMode />}
            {subMode === 'ADD'          && <AddMode />}
            {subMode === 'MISSING'      && <MissingMode />}
            {subMode === 'TEN_FRAME'    && <TenFrameMode />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
