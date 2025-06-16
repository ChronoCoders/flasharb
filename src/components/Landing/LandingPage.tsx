import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Activity,
  Target,
  Layers
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import WalletButton from '../UI/WalletButton';

const LandingPage: React.FC = () => {
  const { wallet, setCurrentView } = useStore();
  const [animatedStats, setAnimatedStats] = useState({
    totalVolume: 0,
    successRate: 0,
    avgProfit: 0,
    activeUsers: 0
  });

  // Animate stats on mount
  useEffect(() => {
    const targets = {
      totalVolume: 2847392,
      successRate: 94.7,
      avgProfit: 127.45,
      activeUsers: 1247
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        totalVolume: Math.floor(targets.totalVolume * easeOut),
        successRate: Math.floor(targets.successRate * easeOut * 10) / 10,
        avgProfit: Math.floor(targets.avgProfit * easeOut * 100) / 100,
        activeUsers: Math.floor(targets.activeUsers * easeOut)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (wallet.connected) {
      setCurrentView('dashboard');
    }
  }, [wallet.connected, setCurrentView]);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Execution',
      description: 'Execute arbitrage trades in milliseconds with our optimized flash loan engine'
    },
    {
      icon: Shield,
      title: 'MEV Protection',
      description: 'Advanced protection against front-running and sandwich attacks'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Opportunities',
      description: 'Live scanning across 15+ DEXs for profitable arbitrage opportunities'
    },
    {
      icon: Target,
      title: 'Smart Risk Management',
      description: 'Automated risk controls and position sizing for optimal returns'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive performance tracking and profit optimization'
    },
    {
      icon: Layers,
      title: 'Multi-Chain Support',
      description: 'Trade across Ethereum, BSC, Polygon, and Arbitrum networks'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'DeFi Trader',
      content: 'FlashArb has revolutionized my trading strategy. The automated arbitrage detection is incredibly accurate.',
      rating: 5,
      profit: '+$12,847'
    },
    {
      name: 'Sarah Williams',
      role: 'Crypto Fund Manager',
      content: 'The risk management features give me confidence to run larger positions. Excellent platform.',
      rating: 5,
      profit: '+$34,291'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Algorithmic Trader',
      content: 'Best arbitrage bot I\'ve used. The execution speed and MEV protection are game-changers.',
      rating: 5,
      profit: '+$8,756'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-white">FlashArb</h1>
                  <p className="text-blue-200 text-lg">Flash Loan Arbitrage Bot</p>
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Maximize Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}DeFi Profits
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The most advanced flash loan arbitrage platform. Automatically detect and execute 
              profitable trades across multiple DEXs with institutional-grade risk management.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <WalletButton variant="landing" size="large" />
              <button className="px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/5">
                Watch Demo
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  ${animatedStats.totalVolume.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wide">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                  {animatedStats.successRate}%
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wide">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                  ${animatedStats.avgProfit}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wide">Avg Profit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                  {animatedStats.activeUsers.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wide">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Why Choose FlashArb?
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by DeFi experts for serious traders. Our platform combines cutting-edge technology 
              with institutional-grade security and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Opportunities Preview */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Live Arbitrage Opportunities
            </h3>
            <p className="text-xl text-gray-300">
              Real-time opportunities detected across multiple DEXs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { pair: 'ETH/USDC', profit: '$127.45', apy: '23.4%', exchanges: ['Uniswap', 'SushiSwap'] },
              { pair: 'WBTC/ETH', profit: '$89.32', apy: '18.7%', exchanges: ['1inch', 'Balancer'] },
              { pair: 'USDT/DAI', profit: '$45.67', apy: '15.2%', exchanges: ['Curve', 'Uniswap'] }
            ].map((opp, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">{opp.pair}</span>
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Live</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential Profit</span>
                    <span className="text-green-400 font-semibold">{opp.profit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">APY</span>
                    <span className="text-blue-400 font-semibold">{opp.apy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exchanges</span>
                    <span className="text-white text-sm">{opp.exchanges.join(' → ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Trusted by Top Traders
            </h3>
            <p className="text-xl text-gray-300">
              Join thousands of successful traders maximizing their DeFi profits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                  <div className="text-green-400 font-bold text-lg">
                    {testimonial.profit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Connect your wallet and start executing profitable arbitrage trades in minutes.
          </p>
          <div className="flex justify-center">
            <WalletButton variant="landing" size="large" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-400 text-sm">
              © 2025 FlashArb. Built for the DeFi revolution.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;