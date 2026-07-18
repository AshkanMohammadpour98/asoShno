import React from 'react';
import type { SiteSettings } from '@/lib/types';

interface RepairProcessProps {
  settings: SiteSettings;
}

const RepairProcess = ({ settings }: RepairProcessProps) => {
  const steps = settings.home.repairSteps;

  return (
    <section className="py-12 sm:py-20 bg-secondary/50 transition-colors duration-300">
      <div className="container mx-auto px-4 text-right" dir="rtl">
        <div className="mb-10 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">{settings.home.repairTitle}</h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground font-medium leading-relaxed">{settings.home.repairSubtitle}</p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-border lg:block opacity-30"></div>

          <div className="grid grid-cols-1 gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-5 px-4 sm:px-0">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                <div className="relative z-10 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[1.5rem] sm:rounded-[2rem] border border-border bg-card text-3xl shadow-xl shadow-black/5 group-hover:scale-110 transition-transform duration-500 group-hover:border-primary/30">
                  {step.icon}
                </div>
                <div className="mt-5 sm:mt-8">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-foreground leading-tight">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed px-2 font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RepairProcess;
