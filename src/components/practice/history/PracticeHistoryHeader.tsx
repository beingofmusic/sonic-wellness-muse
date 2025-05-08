
import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PracticeHistoryHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-1">Practice History</h1>
        <p className="text-white/70">Track your musical journey and progress over time</p>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
        <Link to="/practice/builder">
          <Button className="flex items-center gap-2 shadow-glow-sm">
            <Clock className="h-4 w-4" />
            New Practice
          </Button>
        </Link>
        
        <Link to="/calendar">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PracticeHistoryHeader;
