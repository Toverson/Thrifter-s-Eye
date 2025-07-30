import React, { useState } from 'react';
import { UserService } from '../services/UserService';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

export default function TermsAgreementScreen({ onAgreementComplete }) {
  const { theme } = useTheme();
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const canProceed = agreedToPrivacy && agreedToTerms;

  const handleContinue = async () => {
    if (!canProceed) {
      alert('Please read and agree to both the Privacy Policy and Terms & Conditions to continue.');
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        alert('Authentication error. Please try again.');
        return;
      }

      // Record the user's agreement
      const success = await UserService.recordTermsAgreement(user.uid);
      
      if (success) {
        console.log('✅ TermsAgreement: User agreed to terms, proceeding to app');
        navigate('/');
      } else {
        alert('Failed to save your agreement. Please try again.');
      }
    } catch (error) {
      console.error('❌ TermsAgreement: Error processing agreement:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.colors.backgroundSecondary} flex items-center justify-center px-4`}>
      <div className={`max-w-2xl w-full ${theme.colors.surface} rounded-xl shadow-2xl p-8 ${theme.colors.border} border`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📋</div>
          <h1 className={`text-3xl font-bold ${theme.colors.text} mb-2`}>
            Welcome to Thrifter's Eye
          </h1>
          <p className={`${theme.colors.textSecondary} text-lg`}>
            Before we get started, please review and accept our policies
          </p>
        </div>

        {/* Legal Documents */}
        <div className="space-y-6 mb-8">
          
          {/* Privacy Policy */}
          <div className={`${theme.colors.backgroundTertiary} rounded-lg p-6 ${theme.colors.border} border`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  id="privacy-checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="privacy-checkbox" className={`block ${theme.colors.text} font-medium mb-2 cursor-pointer`}>
                  Privacy Policy Agreement
                </label>
                <p className={`${theme.colors.textSecondary} text-sm mb-3`}>
                  I have read and agree to the Privacy Policy, which explains how Thrifter's Eye collects, uses, and protects my personal information.
                </p>
                <a
                  href="https://toverson.github.io/Thrifter-s-Eye/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors"
                >
                  📄 Read Privacy Policy
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className={`${theme.colors.backgroundTertiary} rounded-lg p-6 ${theme.colors.border} border`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="terms-checkbox" className={`block ${theme.colors.text} font-medium mb-2 cursor-pointer`}>
                  Terms & Conditions Agreement
                </label>
                <p className={`${theme.colors.textSecondary} text-sm mb-3`}>
                  I have read and agree to the Terms & Conditions, which outline the rules and guidelines for using Thrifter's Eye.
                </p>
                <a
                  href="https://toverson.github.io/Thrifter-s-Eye/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors"
                >
                  📜 Read Terms & Conditions
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!canProceed || loading}
            className={`w-full py-4 px-8 rounded-lg font-bold text-lg transition-colors ${
              canProceed && !loading
                ? `${theme.colors.primary} ${theme.colors.primaryText} hover:opacity-90`
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              '✅ I Agree - Continue to Thrifter\'s Eye'
            )}
          </button>
          
          {!canProceed && (
            <p className={`${theme.colors.textMuted} text-sm mt-3`}>
              Please check both boxes above to continue
            </p>
          )}
        </div>

        {/* Legal Notice */}
        <div className={`mt-6 pt-6 border-t ${theme.colors.border} text-center`}>
          <p className={`${theme.colors.textMuted} text-xs leading-relaxed`}>
            By continuing, you acknowledge that you have read, understood, and agree to be bound by our Privacy Policy and Terms & Conditions. 
            These agreements are effective immediately and govern your use of Thrifter's Eye.
          </p>
        </div>
      </div>
    </div>
  );
}