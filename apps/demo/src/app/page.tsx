'use client';

import { ArrowRight, Zap, Shield, TrendingUp, Code, Play } from 'lucide-react';
import Link from 'next/link';

export default function DemoHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#09090b] to-[#18181b]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Stashtab Demo
          </h1>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Experience the power of open-source DeFi neobanking. Try features, explore the API, and
            see how easy it is to build.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/demo"
              className="bg-[#00d974] text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#00c466] transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Try Interactive Demo
            </Link>
            <Link
              href="https://github.com/TRC-Crypto/stashtab"
              target="_blank"
              className="bg-zinc-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              <Code className="w-5 h-5" />
              View on GitHub
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Setup"
            description="Sign up with email or social login. No seed phrases required."
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Auto Yield"
            description="Deposits automatically earn yield via Aave v3. Watch it grow in real-time."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Smart Accounts"
            description="Each user gets a Safe smart account. You control your keys."
          />
        </div>

        {/* Architecture Diagram */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <div className="space-y-6">
              <ArchitectureStep
                step="1"
                title="User Interface"
                description="Web, mobile, and admin apps built with Next.js and React Native"
              />
              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
              </div>
              <ArchitectureStep
                step="2"
                title="Cloudflare Workers API"
                description="Serverless API with D1 database and KV cache. Global edge network."
              />
              <div className="flex justify-center">
                <ArrowRight className="w-6 h-6 text-zinc-600 rotate-90" />
              </div>
              <ArchitectureStep
                step="3"
                title="Blockchain Layer (Base)"
                description="Safe smart wallets, Aave v3 for yield, USDC stablecoin"
              />
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powered By</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Base', 'Aave', 'Safe', 'Privy', 'Cloudflare', 'Next.js', 'React Native'].map(
              (tech) => (
                <div
                  key={tech}
                  className="bg-zinc-900 px-6 py-3 rounded-lg border border-zinc-800 text-zinc-300"
                >
                  {tech}
                </div>
              )
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-zinc-400 mb-8">
            Fork the repo and deploy your own neobank in minutes.
          </p>
          <Link
            href="https://github.com/TRC-Crypto/stashtab"
            target="_blank"
            className="inline-block bg-[#00d974] text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#00c466] transition-colors"
          >
            Get Started on GitHub
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-[#00d974] transition-colors">
      <div className="text-[#00d974] mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function ArchitectureStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
      <div className="flex items-start gap-4">
        <div className="bg-[#00d974] text-black w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {step}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-zinc-400">{description}</p>
        </div>
      </div>
    </div>
  );
}
