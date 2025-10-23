import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Sword, Shield, Heart, Zap } from 'lucide-react';

interface DuelModalProps {
  player: any;
  opponent: any;
  onClose: () => void;
  onComplete: (result: { won: boolean }) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  points: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
    correctAnswer: 1,
    category: "Biology",
    points: 10,
  },
  {
    id: 2,
    question: "What is 15 × 12?",
    options: ["150", "180", "170", "160"],
    correctAnswer: 1,
    category: "Mathematics",
    points: 10,
  },
  {
    id: 3,
    question: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    category: "Chemistry",
    points: 10,
  },
  {
    id: 4,
    question: "What is the formula for kinetic energy?",
    options: ["E = mc²", "KE = ½mv²", "F = ma", "P = mgh"],
    correctAnswer: 1,
    category: "Physics",
    points: 10,
  },
  {
    id: 5,
    question: "How many chromosomes do humans have?",
    options: ["23", "46", "48", "24"],
    correctAnswer: 1,
    category: "Biology",
    points: 10,
  },
  {
    id: 6,
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    category: "Mathematics",
    points: 10,
  },
];

export function DuelModal({ player, opponent, onClose, onComplete }: DuelModalProps) {
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [playerPoints, setPlayerPoints] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [turnPhase, setTurnPhase] = useState<'question' | 'action'>('question');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const loadNewQuestion = () => {
    const randomQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    setCurrentQuestion(randomQuestion);
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
    setShowResult(false);
    setTurnPhase('question');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const timeBonus = Math.max(0, 5 - Math.floor((Date.now() - questionStartTime) / 1000));
      const pointsEarned = currentQuestion.points + timeBonus;
      setPlayerPoints(prev => prev + pointsEarned);
      setTurnPhase('action');
    } else {
      // Wrong answer - opponent attacks
      setTimeout(() => {
        const damage = 15;
        setPlayerHp(prev => Math.max(0, prev - damage));
        setTimeout(() => {
          if (playerHp - damage <= 0) {
            endGame('opponent');
          } else {
            loadNewQuestion();
          }
        }, 1500);
      }, 1500);
    }
  };

  const handleAction = (action: 'attack' | 'defense' | 'heal') => {
    const costs = { attack: 4, defense: 3, heal: 5 };
    const cost = costs[action];

    if (playerPoints < cost) {
      alert(`Not enough points! Need ${cost} points.`);
      return;
    }

    setPlayerPoints(prev => prev - cost);

    if (action === 'attack') {
      const damage = 20 + Math.floor(Math.random() * 10);
      setOpponentHp(prev => Math.max(0, prev - damage));
      setTimeout(() => {
        if (opponentHp - damage <= 0) {
          endGame('player');
        } else {
          // Opponent counter attack
          const counterDamage = 10 + Math.floor(Math.random() * 5);
          setPlayerHp(prev => Math.max(0, prev - counterDamage));
          setTimeout(() => {
            if (playerHp - counterDamage <= 0) {
              endGame('opponent');
            } else {
              loadNewQuestion();
            }
          }, 1000);
        }
      }, 1000);
    } else if (action === 'defense') {
      // Defense reduces next damage by 50%
      setTimeout(() => loadNewQuestion(), 1000);
    } else if (action === 'heal') {
      setPlayerHp(prev => Math.min(100, prev + 25));
      setTimeout(() => loadNewQuestion(), 1000);
    }
  };

  const endGame = (w: 'player' | 'opponent') => {
    setWinner(w);
    setGameOver(true);
  };

  if (gameOver) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-b from-purple-900 to-blue-900 rounded-xl p-8 max-w-md w-full border-4 border-yellow-400">
          <h2 className="text-center text-white mb-4">
            {winner === 'player' ? '🎉 Victory!' : '😢 Defeat'}
          </h2>
          <p className="text-center text-white/80 mb-6">
            {winner === 'player'
              ? `You defeated ${opponent.username}!`
              : `${opponent.username} defeated you!`}
          </p>
          <Button
            onClick={() => onComplete({ won: winner === 'player' })}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl p-6 max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white">Educational Duel</h2>
          <Button onClick={onClose} variant="ghost" className="text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Battle Status */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Player */}
          <div className="bg-blue-900/30 rounded-lg p-4 border-2 border-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-full border-2 border-white"
                style={{ backgroundColor: player.avatarColor }}
              />
              <div className="flex-1">
                <p className="text-white">{player.username} (You)</p>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <div className="flex-1 h-4 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${playerHp}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{playerHp}/100</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-400">Points: {playerPoints}</span>
            </div>
          </div>

          {/* Opponent */}
          <div className="bg-red-900/30 rounded-lg p-4 border-2 border-red-500">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-full border-2 border-white"
                style={{ backgroundColor: opponent.avatarColor }}
              />
              <div className="flex-1">
                <p className="text-white">{opponent.username}</p>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <div className="flex-1 h-4 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${opponentHp}%` }}
                    />
                  </div>
                  <span className="text-white text-sm">{opponentHp}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Phase */}
        {turnPhase === 'question' && currentQuestion && (
          <div className="bg-white/5 rounded-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 bg-purple-600 rounded-full text-white text-sm">
                {currentQuestion.category}
              </span>
              <span className="text-white/70">{currentQuestion.points} points</span>
            </div>

            <h3 className="text-white mb-6">{currentQuestion.question}</h3>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    showResult
                      ? index === currentQuestion.correctAnswer
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

            {showResult && (
              <div className="mt-4 text-center">
                {isCorrect ? (
                  <p className="text-green-400">✓ Correct! Choose your action.</p>
                ) : (
                  <p className="text-red-400">✗ Wrong! Opponent attacks!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Phase */}
        {turnPhase === 'action' && (
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-white text-center mb-6">Choose Your Action</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => handleAction('attack')}
                className="flex flex-col items-center gap-2 h-auto py-6 bg-red-600 hover:bg-red-700"
                disabled={playerPoints < 4}
              >
                <Sword className="w-8 h-8" />
                <span>Attack</span>
                <span className="text-sm opacity-80">4 points</span>
              </Button>
              <Button
                onClick={() => handleAction('defense')}
                className="flex flex-col items-center gap-2 h-auto py-6 bg-blue-600 hover:bg-blue-700"
                disabled={playerPoints < 3}
              >
                <Shield className="w-8 h-8" />
                <span>Defense</span>
                <span className="text-sm opacity-80">3 points</span>
              </Button>
              <Button
                onClick={() => handleAction('heal')}
                className="flex flex-col items-center gap-2 h-auto py-6 bg-green-600 hover:bg-green-700"
                disabled={playerPoints < 5}
              >
                <Heart className="w-8 h-8" />
                <span>Heal</span>
                <span className="text-sm opacity-80">5 points</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
