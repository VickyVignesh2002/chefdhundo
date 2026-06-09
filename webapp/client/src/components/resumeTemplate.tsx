'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChefResumeData {
  name: string;
  mobile: string;
  location: string;
  age?: number | string;
  experience: string;
  jobType: string;
  cuisines: string;
  totalExperienceYears?: number;
  currentPosition: string;
  currentSalary: string;
  expectedSalary: string;
  preferredLocation: string;
  passportNo?: string;
  probationPeriod: boolean;
  businessType: string;
  joiningType: string;
  readyForTraining: string;
  candidateConsent: boolean;
}

interface ResumeTemplateProps {
  data: ChefResumeData;
  onDownloadPDF?: () => void;
  isDownloadingPDF?: boolean;
}

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data, onDownloadPDF, isDownloadingPDF = false }) => {
  const formatExperienceYears = (years?: number) => {
    if (!years) return 'Not specified';
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  const cuisines = data.cuisines
    .split(',')
    .map((cuisine) => cuisine.trim())
    .filter(Boolean);

  const detailItems = [
    ['Experience', formatExperienceYears(data.totalExperienceYears)],
    ['Job Type', data.jobType || 'Not specified'],
    ['Business Type', data.businessType || 'Not specified'],
    ['Preferred Location', data.preferredLocation || 'Not specified'],
    ['Joining', data.joiningType || 'Not specified'],
    ['Training', data.readyForTraining || 'Not specified'],
  ];

  const compensationItems = [
    ['Current Salary', data.currentSalary || 'Not specified'],
    ['Expected Salary', data.expectedSalary || 'Not specified'],
  ];

  return (
    <div id="chef-resume" className="mx-auto max-w-4xl bg-white text-gray-900 shadow-2xl print:shadow-none print:max-w-none">
      <div className="relative overflow-hidden bg-slate-950 px-8 py-9 text-white print:bg-white print:text-gray-900">
        <div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.45),_transparent_55%)] print:hidden" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300 print:text-amber-700">
              ChefDhundo Verified Resume
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {data.name}
            </h1>
            <p className="mt-3 text-xl font-semibold text-amber-200 print:text-amber-700">
              {data.currentPosition || 'Chef'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200 print:text-gray-700">
              <span className="rounded-full border border-white/15 px-3 py-1 print:border-gray-300">
                {data.mobile}
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1 print:border-gray-300">
                {data.location}
              </span>
              {data.totalExperienceYears ? (
                <span className="rounded-full border border-white/15 px-3 py-1 print:border-gray-300">
                  {formatExperienceYears(data.totalExperienceYears)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white shadow-xl print:border-gray-200">
            <Image
              src="/website/icons/cheflogo.webp"
              alt="ChefDhundo logo"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
        <main className="space-y-8 p-8">
          <section>
            <h3 className="mb-3 border-b border-amber-300 pb-2 text-sm font-black uppercase tracking-[0.24em] text-amber-700">
              Professional Summary
            </h3>
            <p className="text-base leading-7 text-gray-700">
              {data.experience || 'Experienced hospitality professional ready for the right opportunity.'}
            </p>
          </section>

          <section>
            <h3 className="mb-4 border-b border-amber-300 pb-2 text-sm font-black uppercase tracking-[0.24em] text-amber-700">
              Culinary Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {(cuisines.length ? cuisines : ['Cuisine details not specified']).map((cuisine) => (
                <Badge key={cuisine} variant="outline" className="border-amber-300 bg-amber-50 px-3 py-1 text-amber-800">
                  {cuisine}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-4 border-b border-amber-300 pb-2 text-sm font-black uppercase tracking-[0.24em] text-amber-700">
              Compensation
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {compensationItems.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-4 border-b border-amber-300 pb-2 text-sm font-black uppercase tracking-[0.24em] text-amber-700">
              Notes
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Candidate Consent</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {data.candidateConsent ? 'Consent provided' : 'Consent not provided'}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Probation</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {data.probationPeriod ? 'Required' : 'Not required'}
                </p>
              </div>
              {data.age ? (
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Age Range</p>
                  <p className="mt-1 font-semibold text-gray-900">{data.age}</p>
                </div>
              ) : null}
            </div>
          </section>
        </main>

        <aside className="space-y-6 border-l border-gray-100 bg-gray-50 p-8 print:bg-white">
          <section>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-gray-500">
              Profile Details
            </h3>
            <div className="space-y-3">
              {detailItems.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 print:ring-gray-200">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
                  <p className="mt-1 font-semibold text-gray-900">{value}</p>
                </div>
              ))}
              {data.passportNo ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 print:ring-gray-200">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Passport No</p>
                  <p className="mt-1 font-mono font-semibold text-gray-900">{data.passportNo}</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl bg-slate-950 p-5 text-white print:border print:border-gray-200 print:bg-white print:text-gray-900">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300 print:text-amber-700">
              Contact
            </p>
            <p className="mt-3 text-lg font-bold">{data.mobile}</p>
            <p className="mt-1 text-sm text-slate-300 print:text-gray-600">{data.location}</p>
          </section>
        </aside>
      </div>

      <footer className="border-t border-gray-200 bg-white p-6 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-700">Generated by ChefDhundo</p>
        <p className="mt-1">Professional chef recruitment profile. References available upon request.</p>

        {onDownloadPDF && (
          <div className="mt-5 print:hidden">
            <Button
              type="button"
              onClick={onDownloadPDF}
              disabled={isDownloadingPDF}
              className="bg-amber-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-amber-700 disabled:bg-amber-400"
            >
              {isDownloadingPDF ? 'Preparing PDF...' : 'Download PDF'}
            </Button>
          </div>
        )}
      </footer>

      <style jsx>{`
        @media print {
          #chef-resume {
            width: 210mm;
            min-height: 297mm;
          }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-gray-900 { color: #111827 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:border { border-width: 1px !important; }
          .print\\:border-gray-200 { border-color: #e5e7eb !important; }
          .print\\:ring-gray-200 { --tw-ring-color: #e5e7eb !important; }
          .print\\:text-amber-700 { color: #b45309 !important; }
          .print\\:text-gray-600 { color: #4b5563 !important; }
        }
      `}</style>
    </div>
  );
};

export default ResumeTemplate;
