import React from 'react';
import { BookOpen, Languages, Award, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { PixelCTAButton } from '../components/PixelCTAButton';

const CourseSelector = ({ onSelectCourse }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-8 px-4 animate-fade-in">
      <div className="text-center max-w-2xl flex flex-col gap-3 mb-10">
        <span className="text-[10px] font-black text-espana-red uppercase tracking-widest bg-red-50 border border-red-100 px-3 py-1 rounded-full w-max mx-auto">
          Choose Your Track
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-espana-charcoal tracking-tight">
          Select Your Spanish Course
        </h1>
        <p className="text-sm font-semibold text-brand-500 leading-relaxed max-w-lg mx-auto">
          Pick the curriculum that matches your current goals. You can switch between them at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        
        {/* Card 1: Complete Spanish A1 (Learn) */}
        <div className="glass-card bg-white/70 rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group relative">
          {/* Accent border highlight on hover */}
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
          
          <div className="p-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center shadow-md text-espana-red shrink-0">
                <BookOpen size={28} className="text-espana-red shrink-0" />
              </div>
              <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase tracking-wider">
                A1 Learn Track
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-brand-900 leading-tight">
                Complete Spanish A1
              </h2>
              <p className="text-xs text-brand-400 font-extrabold uppercase tracking-widest">
                22 Chapters • 140 Lessons
              </p>
              <p className="text-xs font-semibold text-brand-500 mt-2 leading-relaxed">
                Start from absolute zero. Learn greetings, family, routine verbs, and basic everyday vocabulary with interactive dialogue exercises.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 pt-4 border-t border-brand-200/50">
              <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest">What you will learn:</h4>
              <ul className="flex flex-col gap-2">
                {[
                  "Greetings & introductions",
                  "Talking about nationalities & origin",
                  "Describing physical appearance",
                  "Expressing likes, routines & hobbies"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-brand-700 font-bold">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-7 bg-brand-50/50 border-t border-brand-200/50 flex items-center justify-between">
            <span className="text-xs font-black text-brand-600 uppercase tracking-wider">Perfect for beginners</span>
            <PixelCTAButton
              onClick={() => onSelectCourse('beginner')}
              className="px-5 py-3 text-white rounded-2xl text-xs font-black glass-red-button flex items-center gap-1.5 active:scale-95 transition-all shadow-md group-hover:shadow-lg"
            >
              <span>Learn A1</span>
              <ArrowRight size={14} />
            </PixelCTAButton>
          </div>
        </div>

        {/* Card 2: Test Your A1 Skills */}
        <div className="glass-card bg-white/70 rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group relative">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-500 to-yellow-500"></div>

          <div className="p-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-center shadow-md text-amber-500 shrink-0">
                <Award size={28} className="text-amber-500 shrink-0" />
              </div>
              <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                A1 Test Track
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-brand-900 leading-tight">
                Test Your A1 Skills
              </h2>
              <p className="text-xs text-brand-400 font-extrabold uppercase tracking-widest">
                22 Chapters • 22 Checkpoints
              </p>
              <p className="text-xs font-semibold text-brand-500 mt-2 leading-relaxed">
                Test your knowledge of Complete Spanish Beginner A1. Complete checkpoint challenges for all chapters to prove your fluency.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 pt-4 border-t border-brand-200/50">
              <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest">What is included:</h4>
              <ul className="flex flex-col gap-2">
                {[
                  "22 Comprehensive Checkpoints",
                  "Review basic expressions",
                  "Validate your syntax & spelling",
                  "Earn milestone certificates"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-brand-700 font-bold">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-7 bg-brand-50/50 border-t border-brand-200/50 flex items-center justify-between">
            <span className="text-xs font-black text-brand-600 uppercase tracking-wider">Ready to review?</span>
            <PixelCTAButton
              onClick={() => onSelectCourse('test_skills')}
              className="px-5 py-3 text-white rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-600 flex items-center gap-1.5 active:scale-95 transition-all shadow-md group-hover:shadow-lg"
            >
              <span>Test A1</span>
              <ArrowRight size={14} />
            </PixelCTAButton>
          </div>
        </div>

        {/* Card 3: Spanish for Dummies (Intermediate) */}
        <div className="glass-card bg-white/70 rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group relative">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-600"></div>

          <div className="p-7 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center shadow-md text-accent-indigo shrink-0">
                <Languages size={28} className="text-accent-indigo shrink-0" />
              </div>
              <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Intermediate Track
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black text-brand-900 leading-tight">
                Spanish For Dummies
              </h2>
              <p className="text-xs text-brand-400 font-extrabold uppercase tracking-widest">
                18 Chapters • 44 Lessons
              </p>
              <p className="text-xs font-semibold text-brand-500 mt-2 leading-relaxed">
                Take your Spanish to the next level. Master command structures, pronouns, gerund forms, present subjunctive, and future tense.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 pt-4 border-t border-brand-200/50">
              <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest">What you will learn:</h4>
              <ul className="flex flex-col gap-2">
                {[
                  "Gerunds & present progressive",
                  "Subjunctive triggers & moods",
                  "Double object pronoun structures",
                  "Imperfect vs Preterit past tenses"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-brand-700 font-bold">
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-7 bg-brand-50/50 border-t border-brand-200/50 flex items-center justify-between">
            <span className="text-xs font-black text-brand-600 uppercase tracking-wider">Expand your grammar</span>
            <PixelCTAButton
              onClick={() => onSelectCourse('dummies')}
              className="px-5 py-3 text-white rounded-2xl text-xs font-black bg-accent-indigo hover:bg-indigo-600 flex items-center gap-1.5 active:scale-95 transition-all shadow-md group-hover:shadow-lg"
            >
              <span>Learn Book</span>
              <ArrowRight size={14} />
            </PixelCTAButton>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseSelector;
