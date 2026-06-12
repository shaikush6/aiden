'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PREP_CATEGORIES, type PrepCategory, type PrepQuestion } from '@/lib/exam-prep-data';
import { speakText, speakEncouragement } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type AgeGroup = 5 | 6;

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const measured = useRef(false);
  if (!measured.current && typeof window !== 'undefined') {
    measured.current = true;
    setSize({ width: window.innerWidth, height: window.innerHeight });
  }
  return size;
}

function AgeSelector({ age, onSelect }: { age: AgeGroup; onSelect: (a: AgeGroup) => void }) {
  return (
    <div className="flex gap-3 w-full max-w-xs">
      {([5, 6] as AgeGroup[]).map(a => (
        <motion.button
          key={a}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => { onSelect(a); speakText(a === 5 ? "I am five!" : "I am six!"); }}
          className={`flex-1 py-4 rounded-2xl font-black text-xl shadow-lg transition-all
            ${age === a
              ? 'bg-rose-500 text-white scale-105 shadow-rose-300'
              : 'bg-white/90 dark:bg-slate-700 text-rose-500 dark:text-rose-400'}`}
        >
          I&apos;M {a}
        </motion.button>
      ))}
    </div>
  );
}

function CategoryGrid({
  categories,
  age,
  onSelect,
}: {
  categories: PrepCategory[];
  age: AgeGroup;
  onSelect: (cat: PrepCategory) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
      {categories.map(cat => {
        const count = cat.questions.filter(q => q.ageGroup === age).length;
        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => { onSelect(cat); speakText(cat.name); }}
            className="flex flex-col items-center justify-center gap-2 rounded-3xl p-5 shadow-xl min-h-[130px] text-white font-black transition-all"
            style={{ backgroundColor: cat.color }}
          >
            <span className="text-5xl leading-none">{cat.emoji}</span>
            <span className="text-sm text-center leading-tight tracking-wide">{cat.name}</span>
            <span className="text-xs font-bold opacity-80">{count} questions</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function AnswerButton({
  label,
  state,
  onPress,
  disabled,
}: {
  label: string;
  state: 'idle' | 'correct' | 'wrong';
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.93 }}
      whileHover={disabled ? {} : { scale: 1.03 }}
      animate={
        state === 'correct'
          ? { scale: [1, 1.12, 1], backgroundColor: ['#ffffff', '#22c55e', '#22c55e'] }
          : state === 'wrong'
          ? { x: [0, -10, 10, -10, 10, 0] }
          : {}
      }
      onClick={onPress}
      disabled={disabled}
      className={`w-full py-5 px-4 rounded-2xl font-black text-lg shadow-lg transition-colors text-left leading-snug
        ${state === 'correct' ? 'bg-green-400 text-white'
          : state === 'wrong' ? 'bg-red-300 text-white'
          : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100'}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {label}
    </motion.button>
  );
}

function QuestionView({
  question,
  index,
  total,
  onCorrect,
  onWrong,
}: {
  question: PrepQuestion;
  index: number;
  total: number;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleChoice = useCallback((i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === question.correctIndex) {
      setFeedback('correct');
      speakEncouragement(true);
      setTimeout(() => { setFeedback(null); setSelected(null); onCorrect(); }, 1800);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setFeedback(null); setSelected(null); onWrong(); }, 1400);
    }
  }, [selected, question.correctIndex, onCorrect, onWrong]);

  const buttonState = (i: number): 'idle' | 'correct' | 'wrong' => {
    if (selected !== i) return 'idle';
    return feedback ?? 'idle';
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg">
      <div className="flex items-center justify-between">
        <span className="text-rose-500 dark:text-rose-400 font-black text-sm">
          Question {index + 1} of {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i < index ? 'bg-rose-400 w-4' : i === index ? 'bg-rose-600 w-6' : 'bg-rose-100 dark:bg-slate-600 w-4'}`}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-slate-700 rounded-3xl p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none shrink-0">{question.emoji}</span>
          <button
            onClick={() => speakText(question.questionText)}
            className="text-2xl font-black text-gray-800 dark:text-white leading-snug text-left"
          >
            {question.questionText}
          </button>
        </div>
        <button
          onClick={() => speakText(question.questionText)}
          className="mt-3 flex items-center gap-1.5 text-sm font-bold text-rose-500 dark:text-rose-400"
        >
          🔊 Tap to hear
        </button>
      </motion.div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`text-center text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}
          >
            {feedback === 'correct' ? '⭐ GREAT JOB! ⭐' : '💪 TRY AGAIN!'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {question.choices.map((choice, i) => (
          <AnswerButton
            key={i}
            label={choice}
            state={buttonState(i)}
            onPress={() => handleChoice(i)}
            disabled={selected !== null}
          />
        ))}
      </div>
    </div>
  );
}

function ScoreScreen({
  score,
  total,
  categoryName,
  categoryEmoji,
  onBack,
}: {
  score: number;
  total: number;
  categoryName: string;
  categoryEmoji: string;
  onBack: () => void;
}) {
  const { width, height } = useWindowSize();
  const perfect = score === total;

  return (
    <div className="flex flex-col items-center gap-6 py-8 w-full max-w-sm text-center">
      <ReactConfetti
        recycle={false}
        numberOfPieces={perfect ? 300 : 120}
        width={width || 400}
        height={height || 700}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-7xl"
      >
        {categoryEmoji}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-black text-rose-700 dark:text-rose-300"
      >
        {perfect ? 'PERFECT! 🎉' : 'WELL DONE! 🌟'}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/90 dark:bg-slate-700 rounded-3xl px-10 py-6 shadow-xl"
      >
        <p className="text-6xl font-black text-rose-500">{score}</p>
        <p className="text-lg font-bold text-gray-500 dark:text-slate-400">out of {total}</p>
        <p className="text-sm font-bold text-gray-400 dark:text-slate-500 mt-1">{categoryName}</p>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.92 }}
        onClick={onBack}
        className="bg-rose-500 text-white font-black text-lg py-4 px-10 rounded-2xl shadow-lg"
      >
        PLAY MORE! 🎮
      </motion.button>
    </div>
  );
}

export default function ExamPrepTab() {
  const [age, setAge] = useState<AgeGroup>(5);
  const [activeCategory, setActiveCategory] = useState<PrepCategory | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const filteredQuestions = activeCategory
    ? activeCategory.questions.filter(q => q.ageGroup === age)
    : [];

  const handleCategorySelect = (cat: PrepCategory) => {
    setActiveCategory(cat);
    setQuestionIndex(0);
    setScore(0);
    setFinished(false);
  };

  const handleBack = () => {
    setActiveCategory(null);
    setQuestionIndex(0);
    setScore(0);
    setFinished(false);
  };

  const handleCorrect = useCallback(() => {
    const next = score + 1;
    setScore(next);
    if (questionIndex + 1 >= filteredQuestions.length) {
      setFinished(true);
    } else {
      setQuestionIndex(i => i + 1);
    }
  }, [score, questionIndex, filteredQuestions.length]);

  const handleWrong = useCallback(() => {
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 p-4 pb-10">
      {!activeCategory && (
        <>
          <div className="text-center">
            <h2 className="text-3xl font-black text-rose-700 dark:text-rose-300">BRAIN GAMES 🧠</h2>
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400 mt-1">Think like a champion!</p>
          </div>

          <AgeSelector age={age} onSelect={a => { setAge(a); setActiveCategory(null); }} />

          <CategoryGrid categories={PREP_CATEGORIES} age={age} onSelect={handleCategorySelect} />
        </>
      )}

      {activeCategory && !finished && filteredQuestions.length > 0 && (
        <>
          <div className="flex items-center gap-3 w-full max-w-lg">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="bg-white/90 dark:bg-slate-700 rounded-2xl px-4 py-2 font-black text-rose-500 dark:text-rose-400 shadow text-sm"
            >
              ← BACK
            </motion.button>
            <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-700 rounded-2xl px-4 py-2 shadow">
              <span className="text-xl">⭐</span>
              <span className="font-black text-rose-500 text-lg">{score}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory.id}-${questionIndex}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <QuestionView
                question={filteredQuestions[questionIndex]}
                index={questionIndex}
                total={filteredQuestions.length}
                onCorrect={handleCorrect}
                onWrong={handleWrong}
              />
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {activeCategory && finished && (
        <ScoreScreen
          score={score}
          total={filteredQuestions.length}
          categoryName={activeCategory.name}
          categoryEmoji={activeCategory.emoji}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
