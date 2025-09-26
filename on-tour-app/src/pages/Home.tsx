import React from 'react';
import { TopNav } from '../components/home/TopNav';
import { Hero } from '../components/home/Hero';
import { DashboardTeaser } from '../components/home/DashboardTeaser';
import { KPIGrid } from '../components/home/KPIGrid';
import { SiteFooter } from '../components/home/SiteFooter';

export const Home: React.FC = () => {
  return (
    <div className="hero-gradient min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 flex flex-col">
  <section className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-stretch gap-12 px-6 pt-16 md:pt-24 pb-4">
          <div className="flex-1 min-w-[320px]">
            <Hero className="h-full flex items-start" />
          </div>
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <DashboardTeaser className="mt-4 lg:mt-0" />
          </div>
        </section>
        <KPIGrid />
      </main>
      <SiteFooter />
    </div>
  );
};
