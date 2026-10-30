/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SimulationStats, Scenario, DRRMQuizQuestion } from '../types/game';
import { DRRM_QUIZ_QUESTIONS } from '../data/quizzes';
import { soundManager } from '../audio/soundManager';
import { 
  Award, 
  RotateCcw, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  ArrowRight,
  Home
} from 'lucide-react';

interface DebriefModalProps {
  stats: SimulationStats;
  scenario: Scenario;
  onRetry: () => void;
  onNextScenario: () => void;
  onReturnToTitle: () => void;
}

export const DebriefModal: React.FC<DebriefModalProps> = ({
  stats,
  scenario,
  onRetry,
  onNextScenario,
  onReturnToTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'SCIENCE' | 'QUIZ'>('METRICS');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Pick 3 quiz questions related to this hazard and general DRRM
  const selectedQuestions: DRRMQuizQuestion[] = DRRM_QUIZ_QUESTIONS.slice(0, 3);

  // Calculate grade based on casualties avoided and structures saved
  const casualtyRate = stats.casualties / stats.totalPopulation;
  const structureLossRate = stats.collapsedStructures / Math.max(1, stats.totalStructures);

  let grade = 'B';
  let gradeColor = 'text-sky-400';
  let gradeBadgeBg = 'bg-sky-500/10 border-sky-500/30';

  if (casualtyRate < 0.05 && structureLossRate < 0.15) {
    grade = 'S';
    gradeColor = 'text-amber-400';
    gradeBadgeBg = 'bg-amber-500/10 border-amber-500/30';
  } else if (casualtyRate < 0.12 && structureLossRate < 0.3) {
    grade = 'A';
    gradeColor = 'text-emerald-400';
    gradeBadgeBg = 'bg-emerald-500/10 border-emerald-500/30';
  } else if (casualtyRate < 0.25) {
    grade = 'B';
    gradeColor = 'text-sky-400';
    gradeBadgeBg = 'bg-sky-500/10 border-sky-500/30';
  } else if (casualtyRate < 0.45) {
    grade = 'C';
    gradeColor = 'text-orange-400';
    gradeBadgeBg = 'bg-orange-500/10 border-orange-500/30';
  } else {
    grade = 'F';
    gradeColor = 'text-rose-500';
    gradeBadgeBg = 'bg-rose-500/10 border-rose-500/30';
  }

  // Trigger celebration confetti if Grade A or S
  useEffect(() => {
    if (grade === 'S' || grade === 'A') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [grade]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    soundManager.playClick();
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleGradeQuiz = () => {
    soundManager.playVictoryFanfare();
    setQuizSubmitted(true);
  };

  let quizScore = 0;
  if (quizSubmitted) {
    selectedQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) quizScore++;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header Strip */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-display font-black text-3xl shadow-inner ${gradeColor} ${gradeBadgeBg}`}>
              {grade}
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Post-Disaster Mitigation Debrief
              </div>
              <h2 className="text-xl font-bold font-display text-white">
                {scenario.title} — Mission Evaluation
              </h2>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('METRICS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'METRICS' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              DRRM Metrics
            </button>
            <button
              onClick={() => setActiveTab('SCIENCE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'SCIENCE' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Earth Science Debrief
            </button>
            <button
              onClick={() => setActiveTab('QUIZ')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'QUIZ' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Classroom Quiz {quizSubmitted ? `(${quizScore}/${selectedQuestions.length})` : ''}
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm space-y-6">
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
              {/* Sendai Framework Highlight Box */}
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                      Sendai Framework Cost-Benefit Ratio (BCR)
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      Every $1 spent on mitigation saved <span className="text-emerald-400 tabular-nums">${stats.benefitCostRatio.toFixed(1)}</span> in avoided destruction!
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-400 shrink-0">
                  <div>Mitigation: ${stats.mitigationSpentDollars.toLocaleString()}</div>
                  <div className="text-emerald-400 font-bold">Avoided: ${stats.avoidedLossDollars.toLocaleString()}</div>
                </div>
              </div>

              {/* 4 KPI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-mono">Survivors Protected</div>
                  <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
                    {stats.survivors.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                    {((stats.survivors / stats.totalPopulation) * 100).toFixed(1)}% Survival
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-mono">Casualties Incurred</div>
                  <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${stats.casualties > 50 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {stats.casualties.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {((stats.casualties / stats.totalPopulation) * 100).toFixed(1)}% Vulnerable
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-mono">Structures Intact</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                    {stats.intactStructures} / {stats.totalStructures}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {stats.collapsedStructures} Collapsed
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-mono">Evacuation Velocity</div>
                  <div className="text-xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
                    {stats.evacuationRate} /sec
                  </div>
                  <div className="text-[11px] text-sky-400/80 font-mono mt-0.5">
                    {stats.shelteredCount} Sheltered
                  </div>
                </div>
              </div>

              {/* Assessment Narrative */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white text-sm font-display">
                  Instructor Assessment:
                </div>
                <p>
                  {grade === 'S' || grade === 'A'
                    ? 'Superb engineering and policy alignment! Your balanced deployment of structural defenses (energy dissipation/damping) combined with non-structural early warnings preserved critical municipal infrastructure and life.'
                    : grade === 'B'
                    ? 'Solid resilience planning. While you saved the majority of residents, some structural sectors experienced excessive damage. Check whether liquefaction risk zones or defensible firebreaks needed reinforcement.'
                    : 'Catastrophic failures occurred during this hazard strike. Review the Sendai Framework priorities: hazard exposure was too high in unreinforced sectors, and evacuation lead times were insufficient.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'SCIENCE' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-sky-400 uppercase font-semibold">
                  Core Earth Science Principle
                </div>
                <div className="text-sm font-bold text-white mt-1 font-display">
                  {scenario.keyScienceInsight}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Curriculum Learning Takeaways
                </div>
                {scenario.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center text-xs font-mono shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs text-slate-200 leading-relaxed">
                      {obj}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'QUIZ' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="text-xs text-slate-400">
                  Answer these Grade 11 science questions to test your DRRM mastery:
                </div>
                {quizSubmitted && (
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    Score: {quizScore} / {selectedQuestions.length} ({Math.round((quizScore / selectedQuestions.length) * 100)}%)
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {selectedQuestions.map((q, qIdx) => {
                  const userAnswer = quizAnswers[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-mono text-sky-400 font-bold">
                          Q{qIdx + 1}.
                        </span>
                        <div className="text-xs font-bold text-white">
                          {q.question}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          const isCorrect = optIdx === q.correctIndex;
                          let optStyle = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700';

                          if (quizSubmitted) {
                            if (isCorrect) {
                              optStyle = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              optStyle = 'border-rose-500/80 bg-rose-950/40 text-rose-300';
                            }
                          } else if (isSelected) {
                            optStyle = 'border-sky-500 bg-sky-950/60 text-white font-medium';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                          <span className="font-semibold text-sky-400">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!quizSubmitted && (
                <div className="pt-2">
                  <button
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(quizAnswers).length < selectedQuestions.length}
                    className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-lg active:scale-95"
                  >
                    Submit Quiz Answers
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToTitle();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Title Screen</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onRetry();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Iterate Mitigation Strategy</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onNextScenario();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <span>Next Scenario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
