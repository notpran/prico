import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Loading component for better UX
function DashboardSkeleton() {
  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-700 rounded animate-pulse w-64"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-gray-700 rounded-lg bg-gray-800 animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-2 w-32"></div>
            <div className="h-4 bg-gray-700 rounded mb-4 w-48"></div>
            <div className="h-3 bg-gray-700 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function DashboardContent() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user.firstName || user.username || 'User'}! 👋
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
          <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
            <span>👥</span> Your Communities
          </h2>
          <p className="text-gray-400 mb-4">Connect with friends and collaborators</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">No communities yet.</p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              Join a community →
            </button>
          </div>
        </div>
        
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
          <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
            <span>🚀</span> Your Projects
          </h2>
          <p className="text-gray-400 mb-4">Manage your coding projects</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">No projects yet.</p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              Create a project →
            </button>
          </div>
        </div>
        
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
          <h2 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
            <span>🔔</span> Notifications
          </h2>
          <p className="text-gray-400 mb-4">Stay updated on your activities</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">All caught up!</p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              View all →
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-center">
            <div className="text-2xl mb-2">💻</div>
            <div className="text-sm font-medium">New Project</div>
          </button>
          <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Join Community</div>
          </button>
          <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-center">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm font-medium">Start Chat</div>
          </button>
          <button className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-center">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-sm font-medium">Explore</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}