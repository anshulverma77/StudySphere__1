import { GraduationCap } from 'lucide-react';
import { Link } from '@/lib/router';

export function Footer() {
  return (
    <footer className="relative mesh-bg-dark text-gray-400 mt-auto overflow-hidden">
      <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px] animate-float-slow" />
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full bg-cyan-500/8 blur-[60px] animate-float-medium" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white font-display">
              Study<span className="text-gradient-blue">Sphere</span>
            </span>
          </div>
          <p className="text-sm text-center md:text-right text-gray-500">
            Learn Together. Ask Doubts. Help Others.
          </p>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800/50 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} StudySphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
