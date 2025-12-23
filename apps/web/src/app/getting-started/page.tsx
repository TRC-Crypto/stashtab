'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Step {
  id: string;
  title: string;
  description: string;
  code?: string;
  link?: { url: string; text: string };
  completed: boolean;
}

const steps: Step[] = [
  {
    id: '1',
    title: 'Clone the repository',
    description: 'Get the code on your local machine',
    code: 'git clone https://github.com/TRC-Crypto/stashtab.git\ncd stashtab',
    completed: false,
  },
  {
    id: '2',
    title: 'Install dependencies',
    description: 'Install all required packages',
    code: 'pnpm install',
    completed: false,
  },
  {
    id: '3',
    title: 'Set up Privy',
    description: 'Create a Privy account and get your credentials',
    link: {
      url: 'https://dashboard.privy.io',
      text: 'Open Privy Dashboard',
    },
    completed: false,
  },
  {
    id: '4',
    title: 'Run setup wizard',
    description: 'Automatically configure your environment',
    code: 'pnpm setup',
    completed: false,
  },
  {
    id: '5',
    title: 'Start development',
    description: 'Launch all applications locally',
    code: 'pnpm dev',
    completed: false,
  },
  {
    id: '6',
    title: 'Deploy to production',
    description: 'Deploy to Cloudflare in minutes',
    code: 'pnpm deploy:auto',
    completed: false,
  },
];

export default function GettingStartedPage() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const copyCode = (code: string, stepId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const allCompleted = completedSteps.size === steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get Started with Stashtab</h1>
          <p className="text-xl text-gray-600">Deploy your own neobank in under 5 minutes</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Setup Checklist</h2>
            {allCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">All steps completed!</span>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {completedSteps.size}/{steps.length}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step, _index) => {
            const isCompleted = completedSteps.has(step.id);
            return (
              <Card
                key={step.id}
                className={`transition-all ${
                  isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="mt-1"
                        aria-label={`Mark step ${step.id} as ${isCompleted ? 'incomplete' : 'complete'}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">Step {step.id}</span>
                          {isCompleted && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                        <CardDescription className="text-base">{step.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {step.code && (
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code>{step.code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(step.code!, step.id)}
                      >
                        {copiedStep === step.id ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}
                {step.link && (
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => window.open(step.link!.url, '_blank')}
                      className="w-full"
                    >
                      {step.link.text}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Check out our comprehensive documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/docs/DEPLOY.md">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Deployment Guide
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/docs/ARCHITECTURE.md">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Architecture
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/docs/TROUBLESHOOTING.md">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Troubleshooting
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Useful resources for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Privy Dashboard
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Cloudflare Dashboard
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a
                    href="https://github.com/TRC-Crypto/stashtab"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    GitHub Repository
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {allCompleted && (
          <Card className="mt-8 border-green-500 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 Congratulations!</CardTitle>
              <CardDescription className="text-green-700">
                You&apos;ve completed all setup steps. Your neobank is ready to deploy!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" asChild>
                <a href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
