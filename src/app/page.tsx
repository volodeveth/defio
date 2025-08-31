'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import SwapCard from '@/components/swap/SwapCard';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import AlertsCard from '@/components/alerts/AlertsCard';
import ActivityCard from '@/components/activity/ActivityCard';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('swap');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'swap':
        return <SwapCard />;
      case 'earn':
        return (
          <div className="text-center py-12 text-text-tertiary">
            <h3 className="text-xl font-semibold mb-2">Earn Coming Soon</h3>
            <p>Yield farming and staking features will be available in v2</p>
          </div>
        );
      case 'borrow':
        return (
          <div className="text-center py-12 text-text-tertiary">
            <h3 className="text-xl font-semibold mb-2">Borrow Coming Soon</h3>
            <p>Lending and borrowing features will be available in v1</p>
          </div>
        );
      default:
        return <SwapCard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(65,227,255,0.1),transparent_50%)] pointer-events-none" />
      
      <Header />
      
      <main className="relative">
        <div className="container mx-auto px-6 py-8">
          {/* Navigation */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <motion.div
              className="xl:col-span-2 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Portfolio */}
              <PortfolioCard />
              
              {/* Alerts */}
              <AlertsCard />
              
              {/* Recent Activity */}
              <ActivityCard />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-16 border-t border-stroke/30 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div className="text-text-tertiary text-sm">
                  Non-custodial DeFi aggregator for Base network
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <a
                  href="/miniapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-primary transition-colors duration-200"
                >
                  Farcaster Frame
                </a>
                <a
                  href="https://docs.defio.app"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-text-tertiary hover:text-primary transition-colors duration-200"
                >
                  Docs
                </a>
                <a
                  href="https://github.com/defio-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-primary transition-colors duration-200"
                >
                  GitHub
                </a>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-stroke/20 text-center text-xs text-text-tertiary">
              <p>
                ⚠️ <strong>Risk Disclaimer:</strong> DeFi operations carry risk of total loss. 
                This is a non-custodial application - you maintain full control of your assets.
                <br />
                Please read our full{' '}
                <a href="/risk-disclaimer" className="text-primary hover:underline">
                  Risk Disclaimer
                </a>{' '}
                before using.
              </p>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}