'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MapPin } from 'lucide-react';
import ResumeTemplate from '@/components/resumeTemplate';


// TypeScript interface for the resume data
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

export default function ChefResumePage() {

  const router = useRouter();
  const [resumeData, setResumeData] = useState<ChefResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    // Get data from localStorage
    const storedData = localStorage.getItem('chefResumeData');

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
                setResumeData(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ ChefResumePage: Error parsing stored data:', error);
        setError('Failed to load resume data');
        setIsLoading(false);
      }
    } else {
            setError('No resume data found');
      setIsLoading(false);
    }
  }, []);

  const handleBack = () => {
    router.push('/findchefs');
  };

  const handleContact = () => {
    if (!resumeData) return;

    if (resumeData.mobile) {
      window.open(`tel:${resumeData.mobile}`, '_blank');
    }
  };

  const handleDownloadChefDhundoResume = async () => {
    if (!resumeData) return;

    try {
      setIsDownloadingPDF(true);
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = 18;

      const ensureSpace = (needed: number) => {
        if (y + needed <= pageHeight - margin) return;
        pdf.addPage();
        y = margin;
      };

      const sectionTitle = (title: string) => {
        ensureSpace(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(180, 83, 9);
        pdf.text(title.toUpperCase(), margin, y);
        y += 3;
        pdf.setDrawColor(245, 158, 11);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 7;
      };

      const line = (label: string, value?: string | number | boolean | null) => {
        ensureSpace(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(75, 85, 99);
        pdf.text(`${label}:`, margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(17, 24, 39);
        const valueText = value === undefined || value === null || value === '' ? 'Not specified' : String(value);
        pdf.text(valueText, margin + 42, y);
        y += 7;
      };

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, 44, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text(resumeData.name || 'Chef Resume', margin, y);
      y += 9;
      pdf.setFontSize(13);
      pdf.setTextColor(252, 211, 77);
      pdf.text(resumeData.currentPosition || 'Chef', margin, y);
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(226, 232, 240);
      pdf.text(`${resumeData.mobile || 'Phone not provided'}  |  ${resumeData.location || 'Location not specified'}`, margin, y);

      y = 56;
      sectionTitle('Professional Summary');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      const summary = pdf.splitTextToSize(
        resumeData.experience || 'Experienced hospitality professional ready for the right opportunity.',
        contentWidth
      );
      ensureSpace(summary.length * 6);
      pdf.text(summary, margin, y);
      y += summary.length * 6 + 4;

      sectionTitle('Profile Details');
      line('Experience', resumeData.totalExperienceYears ? `${resumeData.totalExperienceYears} years` : 'Not specified');
      line('Job Type', resumeData.jobType);
      line('Business Type', resumeData.businessType);
      line('Preferred Location', resumeData.preferredLocation);
      line('Joining', resumeData.joiningType);
      line('Training', resumeData.readyForTraining);
      line('Age Range', resumeData.age ?? null);
      line('Passport No', resumeData.passportNo || null);

      sectionTitle('Culinary Expertise');
      const cuisineLines = pdf.splitTextToSize(
        resumeData.cuisines || 'Cuisine details not specified',
        contentWidth
      );
      ensureSpace(cuisineLines.length * 6);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(17, 24, 39);
      pdf.text(cuisineLines, margin, y);
      y += cuisineLines.length * 6 + 4;

      sectionTitle('Compensation');
      line('Current Salary', resumeData.currentSalary);
      line('Expected Salary', resumeData.expectedSalary);

      sectionTitle('Consent');
      line('Candidate Consent', resumeData.candidateConsent ? 'Consent provided' : 'Consent not provided');
      line('Probation', resumeData.probationPeriod ? 'Required' : 'Not required');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Generated by ChefDhundo - Professional chef recruitment profile.', margin, pageHeight - 10);

      const fileName = `${resumeData.name || 'chef'}-chefdhundo-resume`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      pdf.save(`${fileName || 'chefdhundo-resume'}.pdf`);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'No resume data available'}</p>
          <Button onClick={handleBack} className="bg-amber-600 hover:bg-amber-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chef Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chef Search
            </Button>

            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {resumeData.name} - Resume
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Contact Actions */}
              {resumeData.mobile && (
                <Button
                  onClick={handleContact}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick Info Bar */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{resumeData.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-gray-900">
                    {resumeData.totalExperienceYears ? `${resumeData.totalExperienceYears} years` : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Job Type</p>
                  <p className="font-medium text-gray-900">{resumeData.jobType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium text-gray-900">{resumeData.currentPosition}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Template */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <ResumeTemplate
              data={resumeData}
              onDownloadPDF={handleDownloadChefDhundoResume}
              isDownloadingPDF={isDownloadingPDF}
            />
          </div>

          {/* Action Footer */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Interested in this candidate?
                </h3>
                <p className="text-gray-600">
                  Use the contact information above to reach out directly
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="px-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>

                {resumeData.mobile && (
                  <Button
                    onClick={handleContact}
                    className="bg-amber-600 hover:bg-amber-700 px-6"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Candidate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
