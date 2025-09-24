"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 py-3 px-4",
              card: "bg-gray-800 border border-gray-700 shadow-2xl rounded-xl p-8",
              headerTitle: "text-white text-2xl font-bold mb-2",
              headerSubtitle: "text-gray-400 mb-6",
              socialButtonsBlockButton: "bg-gray-700 border border-gray-600 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 py-3 px-4 mb-3",
              socialButtonsBlockButtonText: "text-white font-medium",
              formFieldInput: "bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 py-3 px-4",
              formFieldLabel: "text-gray-300 font-medium mb-2 block",
              dividerLine: "bg-gray-600 h-px",
              dividerText: "text-gray-400 text-sm",
              footerActionLink: "text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium",
              identityPreviewText: "text-gray-300",
              identityPreviewEditButton: "text-blue-400 hover:text-blue-300 transition-colors duration-200",
              formFieldAction: "text-blue-400 hover:text-blue-300 transition-colors duration-200",
              otpCodeFieldInput: "bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-blue-500",
              formResendCodeLink: "text-blue-400 hover:text-blue-300 transition-colors duration-200"
            },
            variables: {
              colorPrimary: "#2563eb",
              colorBackground: "#1f2937",
              colorInputBackground: "#374151",
              colorInputText: "#ffffff",
              borderRadius: "0.75rem"
            }
          }}
        />
      </div>
    </div>
  );
}