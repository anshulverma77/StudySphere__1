import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRoute, navigate } from '@/lib/router';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { CommunityPage } from '@/pages/CommunityPage';
import { AskQuestionPage } from '@/pages/AskQuestionPage';
import { MyQuestionsPage } from '@/pages/MyQuestionsPage';
import { QuestionDetailPage } from '@/pages/QuestionDetailPage';
import { LiveStudyPage } from '@/pages/LiveStudyPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PremiumPage } from '@/pages/PremiumPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { useEffect } from 'react';
import type { Route } from '@/lib/router';

const protectedRoutes: Route[] = ['ask', 'my-questions', 'profile'];

function AppContent() {
  const { route, param } = useRoute();
  const { user, loading } = useAuth();

  // Redirect from protected routes if not authenticated
  useEffect(() => {
    if (!loading && !user && protectedRoutes.includes(route)) {
      navigate('login');
    }
  }, [route, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading StudySphere...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (route) {
      case 'home':
        return <HomePage />;
      case 'community':
        return <CommunityPage />;
      case 'ask':
        return <AskQuestionPage />;
      case 'my-questions':
        return <MyQuestionsPage />;
      case 'question':
        return param ? <QuestionDetailPage questionId={param} /> : <CommunityPage />;
      case 'live':
        return <LiveStudyPage />;
      case 'profile':
        return <ProfilePage />;
      case 'premium':
        return <PremiumPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      default:
        return <HomePage />;
    }
  };

  // Don't show navbar on auth pages
  const isAuthPage = route === 'login' || route === 'signup';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
