import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Trophy, Award, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface GymModalProps {
  player: any;
  onClose: () => void;
  onComplete: (rewards: { badge?: string; fashionItem?: string }) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  points: number;
}

const GYM_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What organelle is responsible for photosynthesis?",
    options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
    correctAnswer: 1,
    category: "Biology",
    points: 15,
  },
  {
    id: 2,
    question: "Solve: ∫(2x + 3)dx",
    options: ["x² + 3x + C", "2x² + 3x + C", "x² + 3 + C", "2x + C"],
    correctAnswer: 0,
    category: "Mathematics",
    points: 20,
  },
  {
    id: 3,
    question: "What is the pH of a neutral solution?",
    options: ["0", "7", "14", "1"],
    correctAnswer: 1,
    category: "Chemistry",
    points: 15,
  },
  {
    id: 4,
    question: "What is Newton's Second Law of Motion?",
    options: ["E = mc²", "F = ma", "F = G(m₁m₂)/r²", "v = u + at"],
    correctAnswer: 1,
    category: "Physics",
    points: 15,
  },
  {
    id: 5,
    question: "What is the process by which cells divide?",
    options: ["Photosynthesis", "Respiration", "Mitosis", "Digestion"],
    correctAnswer: 2,
    category: "Biology",
    points: 15,
  },
  {
    id: 6,
    question: "What is the derivative of x³?",
    options: ["3x²", "x²", "3x", "x³"],
    correctAnswer: 0,
    category: "Mathematics",
    points: 20,
  },
  {
    id: 7,
    question: "What is the molecular formula for water?",
    options: ["H₂O₂", "HO", "H₂O", "H₃O"],
    correctAnswer: 2,
    category: "Chemistry",
    points: 10,
  },
  {
    id: 8,
    question: "What is the speed of light in vacuum?",
    options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁹ m/s", "3 × 10⁷ m/s"],
    correctAnswer: 0,
    category: "Physics",
    points: 15,
  },
];

export function GymModal({ player, onClose, onComplete }: GymModalProps) {
  const [mode, setMode] = useState<'menu' | 'challenge' | 'leaderboard'>('menu');
  const [currentScore, setCurrentScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [totalQuestions] = useState(5);

  useEffect(() => {
    if (mode === 'challenge' && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && mode === 'challenge' && !showResult) {
      // Time's up - wrong answer
      handleAnswerSelect(-1);
    }
  }, [timeLeft, mode, showResult]);

  useEffect(() => {
    if (mode === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [mode]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/gym/leaderboard`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const startChallenge = () => {
    setMode('challenge');
    setCurrentScore(0);
    setCurrentQuestion(0);
    setTimeLeft(30);
    setShowResult(false);
    setSelectedAnswer(null);
    setChallengeComplete(false);
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    const question = GYM_QUESTIONS[currentQuestion];
    const correct = answerIndex === question.correctAnswer;
    setShowResult(true);

    if (correct) {
      const timeBonus = Math.floor(timeLeft / 3);
      const pointsEarned = question.points + timeBonus;
      setCurrentScore(prev => prev + pointsEarned);
    }

    // Move to next question after delay
    setTimeout(async () => {
      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(30);
      } else {
        // Challenge complete
        setChallengeComplete(true);
        
        // Submit score to leaderboard
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-5d90d85a/gym/submit`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                playerId: player.id,
                username: player.username,
                score: currentScore + (correct ? question.points + Math.floor(timeLeft / 3) : 0),
              }),
            }
          );
        } catch (error) {
          console.error('Failed to submit score:', error);
        }
      }
    }, 2000);
  };

  const renderMenu = () => (
    <div className="space-y-4">
      <div className="bg-purple-900/30 border-2 border-purple-500 rounded-lg p-6">
        <h3 className="text-white mb-4">🏆 24-Hour Gym Challenge</h3>
        <p className="text-white/80 mb-4">
          Compete against other players in a 24-hour educational CTF challenge! Answer questions from
          Biology, Mathematics, Chemistry, and Physics to earn points.
        </p>
        <ul className="text-white/70 space-y-2 mb-4">
          <li>• Answer {totalQuestions} questions</li>
          <li>• Faster answers earn bonus points</li>
          <li>• Top players get exclusive badges and fashion items</li>
          <li>• Leaderboard resets every 24 hours</li>
        </ul>
        <Button
          onClick={startChallenge}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Start Challenge
        </Button>
      </div>

      <Button
        onClick={() => setMode('leaderboard')}
        variant="outline"
        className="w-full border-white/30 text-white hover:bg-white/10"
      >
        <Award className="w-4 h-4 mr-2" />
        View Leaderboard
      </Button>
    </div>
  );

  const renderChallenge = () => {
    if (challengeComplete) {
      const finalScore = currentScore;
      const isTopScore = finalScore >= 200; // Example threshold

      return (
        <div className="text-center space-y-6">
          <h2 className="text-white">Challenge Complete!</h2>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-white" />
            <p className="text-white mb-2">Final Score</p>
            <p className="text-white">{finalScore} points</p>
          </div>

          {isTopScore && (
            <div className="bg-purple-900/30 border-2 border-purple-500 rounded-lg p-6">
              <Award className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
              <p className="text-white mb-2">🎉 New Reward Unlocked!</p>
              <p className="text-yellow-400">Elite Scholar Badge</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => setMode('leaderboard')}
              variant="outline"
              className="flex-1 border-white/30 text-white"
            >
              View Leaderboard
            </Button>
            <Button
              onClick={() => {
                if (isTopScore) {
                  onComplete({ badge: 'Elite Scholar Badge' });
                } else {
                  onClose();
                }
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Continue
            </Button>
          </div>
        </div>
      );
    }

    const question = GYM_QUESTIONS[currentQuestion];

    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex justify-between items-center">
          <span className="text-white/70">Question {currentQuestion + 1}/{totalQuestions}</span>
          <div className="flex items-center gap-2 bg-blue-900/30 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className={`${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
          <span className="text-yellow-400">Score: {currentScore}</span>
        </div>

        {/* Question */}
        <div className="bg-white/5 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="px-3 py-1 bg-purple-600 rounded-full text-white text-sm">
              {question.category}
            </span>
            <span className="text-white/70">{question.points} points</span>
          </div>

          <h3 className="text-white mb-6">{question.question}</h3>

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  showResult
                    ? index === question.correctAnswer
                      ? 'bg-green-600 border-green-400 text-white'
                      : index === selectedAnswer
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-white/5 border-white/20 text-white/50'
                    : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white">24-Hour Leaderboard</h3>
        <Button
          onClick={() => setMode('menu')}
          variant="ghost"
          className="text-white"
        >
          Back
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboard.length === 0 ? (
          <p className="text-white/50 text-center py-8">No scores yet. Be the first!</p>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-800 border-2 border-yellow-400'
                  : index === 1
                  ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-600 to-orange-800'
                  : 'bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-white text-xl w-8">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <span className="text-white">{entry.username}</span>
              </div>
              <span className="text-white">{entry.score} pts</span>
            </div>
          ))
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4">
          <p className="text-white/80 text-center text-sm">
            Top 3 players will receive exclusive badges and fashion items when the 24-hour period ends!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-purple-900 to-slate-900 rounded-xl p-6 max-w-2xl w-full border-2 border-purple-500 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-white">Gym Challenge</h2>
          </div>
          <Button onClick={onClose} variant="ghost" className="text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {mode === 'menu' && renderMenu()}
        {mode === 'challenge' && renderChallenge()}
        {mode === 'leaderboard' && renderLeaderboard()}
      </div>
    </div>
  );
}
