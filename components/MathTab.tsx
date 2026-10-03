'use client';
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MATH_ACTIVITIES, LANE_CONFIG } from "@/lib/math-categories";
import type { MathMode, MathLane } from "@/lib/math-data";
import { speakText } from "@/lib/speech";
import { QuickLookMode, BuildMeMode, CountMode } from "@/components/math/SubitizeModes";
import { WhichMoreMode, ConservationMode } from "@/components/math/CompareModes";
import { NumberLineMode, OneMoreMode } from "@/components/math/PathModes";
import dynamic from "next/dynamic";
import NumberLand from "@/components/number-land/NumberLand";

const NumberBondsMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.NumberBondsMode })), { ssr: false });
const HideFindMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.HideFindMode })), { ssr: false });
const BalanceMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.BalanceMode })), { ssr: false });
const AddMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.AddMode })), { ssr: false });
const MissingMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.MissingMode })), { ssr: false });
const TenFrameMode = dynamic(() => import("@/components/math/ComposeModes").then(m => ({ default: m.TenFrameMode })), { ssr: false });

const LANES: MathLane[] = ['SUBITIZE', 'BUILD', 'COMPARE', 'PATH', 'COMPOSE'];

const ALL_MODES: MathMode[] = [
  'QUICK_LOOK', 'BUILD_ME', 'COUNT', 'WHICH_MORE', 'CONSERVATION',
  'NUMBER_LINE', 'ONE_MORE', 'BONDS', 'HIDE_FIND', 'BALANCE',
  'ADD', 'MISSING', 'TEN_FRAME',
];

const CATEGORY_META: Record<MathMode, { emoji: string; label: string; color: string }> = {
  QUICK_LOOK:   { emoji: '⚡', label: 'Quick Look',    color: 'bg-yellow-500' },
  BUILD_ME:     { emoji: '🎯', label: 'Build Me',      color: 'bg-green-500'  },
  COUNT:        { emoji: '🔢', label: 'Count',         color: 'bg-green-600'  },
  WHICH_MORE:   { emoji: '⚖️', label: 'Which More',    color: 'bg-blue-500'   },
  CONSERVATION: { emoji: '🪄', label: 'Still Same?',   color: 'bg-blue-600'   },
  NUMBER_LINE:  { emoji: '🐸', label: 'Number Path',   color: 'bg-purple-500' },
  ONE_MORE:     { emoji: '⚙️', label: 'One More',      color: 'bg-purple-600' },
  BONDS:        { emoji: '🚂', label: 'Number Bonds',  color: 'bg-orange-500' },
  HIDE_FIND:    { emoji: '☕', label: 'Hide & Find',   color: 'bg-orange-600' },
  BALANCE:      { emoji: '⚖️', label: 'Balance',       color: 'bg-rose-500'   },
  ADD:          { emoji: '🚌', label: 'Add',           color: 'bg-rose-600'   },
  MISSING:      { emoji: '❓', label: 'Missing',       color: 'bg-pink-500'   },
  TEN_FRAME:    { emoji: '📦', label: 'Ten Frame',     color: 'bg-indigo-500' },
};

function FreePlay() {
  const [activeLane, setActiveLane] = useState<MathLane>('SUBITIZE');
  const [subMode, setSubMode] = useState<MathMode>('QUICK_LOOK');
  const [selectedCategories, setSelectedCategories] = useState<Set<MathMode>>(new Set());
  const chipRowRef = useRef<HTMLDivElement>(null);

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

  const toggleCategory = useCallback((mode: MathMode) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode); else next.add(mode);
      return next;
    });
  }, []);

  const handleRandom = useCallback(() => {
    const pool = selectedCategories.size > 0
      ? ALL_MODES.filter(m => selectedCategories.has(m))
      : ALL_MODES;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const activity = MATH_ACTIVITIES.find(a => a.id === picked);
    if (!activity) return;
    setSubMode(picked);
    const lane = activity.lane;
    setActiveLane(lane);
    speakText(activity.description);
  }, [selectedCategories]);

  const laneActivities = MATH_ACTIVITIES.filter(a => a.lane === activeLane);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Category filter chips + RANDOM button */}
      <div className="px-2 pt-3">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRandom}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-sm text-white shadow-md bg-gradient-to-r from-violet-500 to-indigo-500"
          >
            🎲 <span>RANDOM</span>
          </motion.button>

          <div
            ref={chipRowRef}
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {ALL_MODES.map(mode => {
              const meta = CATEGORY_META[mode];
              const isActive = selectedCategories.has(mode);
              return (
                <motion.button
                  key={mode}
                  whileTap={{ scale: 0.88 }}
                  animate={{ opacity: isActive ? 1 : 0.65 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => toggleCategory(mode)}
                  className={[
                    "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full font-black text-xs shadow transition-shadow",
                    isActive
                      ? `${meta.color} text-white shadow-md ring-2 ring-white ring-offset-1`
                      : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300",
                  ].join(" ")}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
        {selectedCategories.size > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCategories(new Set())}
            className="mt-1 ml-1 text-[11px] font-black text-violet-500 dark:text-violet-300"
          >
            CLEAR FILTERS ({selectedCategories.size})
          </motion.button>
        )}
      </div>

      {/* Lane navigation */}
      <div className="grid grid-cols-5 gap-1 px-2 pt-2">
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

type Section = 'land' | 'play';

/**
 * The Numbers tab: Block Buddy Land (read number names, wake Block Buddies, do math with words)
 * and Free Play (the original thirteen wordless activities).
 */
export default function MathTab() {
  const [section, setSection] = useState<Section>('land');
  const choices: { id: Section; label: string; icon: string }[] = [
    { id: 'land', label: 'BLOCK BUDDY LAND', icon: '🏘️' },
    { id: 'play', label: 'FREE PLAY', icon: '🎲' },
  ];
  return (
    <div>
      <div className="flex justify-center gap-2 px-3 pt-3">
        {choices.map(c => (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSection(c.id)}
            aria-pressed={section === c.id}
            className={`flex-1 max-w-xs rounded-2xl px-4 py-3 font-black text-sm sm:text-base shadow transition-colors ${
              section === c.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-700 text-orange-600 dark:text-orange-300'
            }`}
          >
            {c.icon} {c.label}
          </motion.button>
        ))}
      </div>
      <div className="mt-3">{section === 'land' ? <NumberLand /> : <FreePlay />}</div>
    </div>
  );
}
