import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoopTrainer, useLoopTrainerSessions, useLoopTrainerStats } from "@/hooks/useLoopTrainer";
import LoopTrainerSection from "@/components/practice/loopTrainer/LoopTrainerSection";
import { formatDistanceToNow } from "date-fns";
import { 
  Youtube, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  Music, 
  Search,
  Trash2,
  Play,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const LoopTrainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { createSession, deleteSession } = useLoopTrainer();
  const { data: sessionsData, isLoading: sessionsLoading } = useLoopTrainerSessions({ 
    searchTerm: searchTerm || undefined,
    limit: 50 
  });
  const { data: stats, isLoading: statsLoading } = useLoopTrainerStats();

  const sessions = sessionsData?.sessions || [];

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession(sessionId);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeedBadgeColor = (speed: number): string => {
    if (speed < 0.75) return "bg-blue-500/20 text-blue-300";
    if (speed <= 1.25) return "bg-green-500/20 text-green-300";
    return "bg-orange-500/20 text-orange-300";
  };

  const getSpeedLabel = (speed: number): string => {
    if (speed < 0.75) return "Slow";
    if (speed <= 1.25) return "Normal";
    return "Fast";
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1">Loop Trainer</h1>
            <p className="text-white/70">
              Practice specific sections of YouTube videos with precise loop control
            </p>
          </div>
          
          <Link to="/practice">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
              Back to Practice
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="trainer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trainer" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              Trainer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Loop Trainer Tab */}
          <TabsContent value="trainer" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-500" />
                  YouTube Loop Trainer
                </CardTitle>
                <CardDescription>
                  Import any YouTube video and practice specific sections with speed and pitch control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoopTrainerSection onSaveSession={createSession} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search by video title or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 bg-white/10 rounded mb-4 w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-2 bg-white/10 rounded w-1/2"></div>
                        <div className="h-2 bg-white/10 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <Card className="bg-white/5 border-white/10 text-center p-8">
                  <div className="flex flex-col items-center gap-4">
                    <Youtube className="h-12 w-12 text-white/30" />
                    <div>
                      <h3 className="text-lg font-medium mb-2">No Loop Sessions Yet</h3>
                      <p className="text-white/70 mb-4">
                        {searchTerm 
                          ? "No sessions match your search." 
                          : "Start by creating your first loop trainer session."}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => {
                          const trainerTab = document.querySelector('[value="trainer"]') as HTMLElement;
                          trainerTab?.click();
                        }}>
                          Start Practicing
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-sm line-clamp-2 flex-1 mr-2">
                            {session.video_title || "Untitled Video"}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-xs text-white/70">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(session.end_time_sec - session.start_time_sec)}
                            </div>
                            <div className="flex items-center gap-1">
                              <RotateCcw className="h-3 w-3" />
                              {session.loop_count}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={getSpeedBadgeColor(session.playback_speed)}>
                              {session.playback_speed.toFixed(2)}x
                            </Badge>
                            {session.pitch_shift !== 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Music className="h-3 w-3 mr-1" />
                                {session.pitch_shift > 0 ? '+' : ''}{session.pitch_shift}
                              </Badge>
                            )}
                          </div>

                          {session.session_notes && (
                            <p className="text-xs text-white/60 line-clamp-2">
                              {session.session_notes}
                            </p>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <span className="text-xs text-white/50">
                              {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(session.youtube_url, '_blank')}
                              className="h-6 text-xs"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                    <div className="h-8 bg-white/10 rounded"></div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/70">Total Sessions</p>
                          <p className="text-2xl font-bold">{stats.totalSessions}</p>
                        </div>
                        <Youtube className="h-8 w-8 text-music-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/70">Practice Time</p>
                          <p className="text-2xl font-bold">{formatDuration(stats.totalPracticeTime)}</p>
                        </div>
                        <Clock className="h-8 w-8 text-music-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/70">Total Loops</p>
                          <p className="text-2xl font-bold">{stats.totalLoops}</p>
                        </div>
                        <RotateCcw className="h-8 w-8 text-music-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/70">Avg Session</p>
                          <p className="text-2xl font-bold">{formatDuration(stats.averageSessionLength)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-music-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Most Practiced Videos */}
                {stats.mostPracticedVideos.length > 0 && (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Most Practiced Videos</CardTitle>
                      <CardDescription>Videos you've spent the most time practicing</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.mostPracticedVideos.map((video, index) => (
                          <div key={video.youtube_url} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-music-primary/20 text-music-primary text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm line-clamp-1">{video.video_title}</p>
                                <p className="text-xs text-white/70">{video.session_count} sessions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatDuration(video.total_time)}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(video.youtube_url, '_blank')}
                                className="h-6 text-xs text-white/70 hover:text-white"
                              >
                                Open Video
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Favorite Speed Range */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Practice Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-music-primary"></div>
                        <span className="text-sm">Favorite Speed Range:</span>
                        <Badge className="bg-music-primary/20 text-music-primary">
                          {stats.favoriteSpeedRange}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-white/5 border-white/10 text-center p-8">
                <div className="flex flex-col items-center gap-4">
                  <BarChart3 className="h-12 w-12 text-white/30" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">No Stats Available</h3>
                    <p className="text-white/70 mb-4">
                      Complete some loop trainer sessions to see your practice statistics.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LoopTrainer;