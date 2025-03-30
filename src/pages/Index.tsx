
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '@/components/Footer';
import NavigationHeader from '@/components/landing/NavigationHeader';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import DemoSection from '@/components/landing/DemoSection';
import CallToAction from '@/components/landing/CallToAction';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>NannyAI - Intelligent Linux Agent Diagnostics</title>
        <meta name="description" content="NannyAI simplifies Linux diagnostics with intelligent agents and a powerful API. Monitor, diagnose, and resolve issues across distributed systems." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <NavigationHeader />
        
        <main className="flex-1">
          <Hero />
          <Features />
          <DemoSection />
          <CallToAction />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
