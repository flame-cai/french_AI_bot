//src/components/MeaningMatcher.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { useAuth } from './AuthContext'; 

const MeaningMatcher = ({ selectedWeek }) => {
  const [gameState, setGameState] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [wordQueue, setWordQueue] = useState([]);
  const { token } = useAuth();
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('selectedWeekMM:', selectedWeek);
    initializeGame();
  }, [selectedWeek]);

  useEffect(() => {
    // Focus on the input field after the result is updated
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [result]);
  
  const initializeGame = async () => {
    try {
      const response = await axios.get('https://asia-south1-ppt-tts.cloudfunctions.net/fr-lang-backend/initialize', {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
          'week' : `${selectedWeek}`
        },
      });
      setGameState(response.data);
      setResult(null);
      setInput('');
      setConsecutiveCorrect(0);
      setWordQueue([]);
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  };

  const updateWordQueue = (newWord) => {
    setWordQueue((prevQueue) => {
      const updatedQueue = [...prevQueue, newWord];
      if (updatedQueue.length > 5) {
        updatedQueue.shift(); // Remove the oldest word if the queue exceeds 5
      }
      return updatedQueue;
    });
  };

  const checkMeaning = async () => {
    try {
      console.log(gameState)
      const response = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/fr-lang-backend/check_meaning', { input_text: input, week: selectedWeek, word: gameState.word, meaning: gameState.meaning, consecutive_correct: consecutiveCorrect, score: gameState.score }, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        },
      });
      setResult(response.data);

      if (response.data.result === 'correct') {
        let newScore = gameState.score + 10;
        let newConsecutiveCorrect = consecutiveCorrect + 1;

        if (newConsecutiveCorrect % 3 === 0) {
          newScore += 5;
        }

        setGameState(prevState => ({ ...prevState, score: newScore }));
        setConsecutiveCorrect(newConsecutiveCorrect);
      } else {
        setGameState(prevState => ({ ...prevState, score: gameState.score - 5 }));
        setConsecutiveCorrect(0);
      }
    } catch (error) {
      console.error("Error checking meaning:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !result) {
      checkMeaning();
    }
  };

  const getNewWord = async () => {
    try {
      updateWordQueue(gameState.word);
      const response = await axios.post('https://asia-south1-ppt-tts.cloudfunctions.net/fr-lang-backend/new_word',{week: selectedWeek, score: gameState.score, queue: wordQueue}, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the headers
        },
      });
      setGameState(response.data);
      setResult(null);
      setInput('');
      inputRef.current.focus();
    } catch (error) {
      console.error("Error getting new word:", error);
    }
  };

  if (!gameState) return <div>Loading...</div>;

  return (
    <div class="chat-container">
      <h1>Grammar Games</h1><hr/>
      <p className='score'><b>Score:</b> {gameState.score}</p><hr/>
      {/* <p>Enter the meaning of the word <strong>{gameState.word}</strong> in French:</p> */}
      {/* <p dangerouslySetInnerHTML={{ __html: gameState.word }}>{gameState.word}</p> */}
      <p dangerouslySetInnerHTML={{ __html: gameState.word }}/>
      {/* <p>{gameState.word}</p> */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={result !== null}
        ref={inputRef}
      /><br/>
      {result && (
        <div>
          <br/>
          <p class={result.result === 'correct' ? "alert alert-success" : "alert alert-danger"}>{result.result === 'correct' ? ' Correct! 10 points will be added.' : 'Incorrect! 5 points will be deducted.'}</p>
          {result.result !== 'correct' && (
            <p class="alert alert-info">The correct meaning is "{result.correct_meaning}".</p>
          )}
          {consecutiveCorrect % 3 === 0 && consecutiveCorrect !== 0 && (
            <div>
              <p class="alert alert-success">Bonus! 5 points for 3 consecutive correct answers!</p>
              <Confetti />
            </div>
          )}
          <button 
            onClick={getNewWord} 
            className="btn btn-small btn-secondary"
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
};

export default MeaningMatcher;
