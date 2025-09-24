"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo } from "react";

export default function HomeClient() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Don't redirect if user just signed out
    const hasSignedOut = searchParams.get('signed_out') === 'true';
    
    if (isLoaded && isSignedIn && !hasSignedOut) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router, searchParams]);

  // Memoize the feature cards to prevent unnecessary re-renders
  const featureCards = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl">
      <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
        <h2 className="text-xl font-semibold mb-3 text-white">💬 Chat</h2>
        <p className="text-gray-300">Connect with communities and friends in real-time</p>
      </div>
      <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
        <h2 className="text-xl font-semibold mb-3 text-white">💻 Code</h2>
        <p className="text-gray-300">Collaborate on projects with integrated development tools</p>
      </div>
      <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
        <h2 className="text-xl font-semibold mb-3 text-white">🚀 Share</h2>
        <p className="text-gray-300">Publish, fork, and contribute to open source projects</p>
      </div>
    </div>
  ), []);

  // Show loading state while authentication is loading
  if (!isLoaded) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900">
      <div className="text-center max-w-6xl mx-auto">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
          Welcome to Prico
        </h1>
        <p className="text-2xl mb-12 text-gray-300 max-w-2xl mx-auto">
          The ultimate platform combining Discord, VSCode, and GitHub for seamless collaboration
        </p>
        
        {featureCards}
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/sign-in" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="px-8 py-4 border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
