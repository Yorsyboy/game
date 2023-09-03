import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import your Firebase configuration here
import { getDatabase, ref, push, set, get } from 'firebase/database';

function Board() {
  const WINNING_POSITION = 2; // Change to the winning position for your game

  const [boardState, setBoardState] = useState(new Array(16).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [diceValue, setDiceValue] = useState(0);
  const [computerDiceValue, setComputerDiceValue] = useState(0);
  const [playerPositions, setPlayerPositions] = useState({
    red: -1,
    blue: -1,
  });
  const [hasPlayerMoved, setHasPlayerMoved] = useState(false);
  const [gameResults, setGameResults] = useState([]);

  const rollDice = () => {
    const randomValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(randomValue);

    if (currentPlayer === 'red') {
      if (randomValue !== 6 || hasPlayerMoved) {
        setTimeout(() => {
          setCurrentPlayer('blue');
          setHasPlayerMoved(false);
        }, 1000);
      }
    } else if (currentPlayer === 'blue') {
      setTimeout(() => {
        makeComputerMove();
      }, 1000);
    }
  };

  const movePlayer = (player) => {
    if (!hasPlayerMoved && (player === 'red' && diceValue === 6) || (player === 'blue' && computerDiceValue === 6)) {
      const newPosition = playerPositions[player] + 1;
      if (newPosition <= WINNING_POSITION) {
        const newBoardState = [...boardState];
        newBoardState[newPosition] = player;
        newBoardState[playerPositions[player]] = null;
        setBoardState(newBoardState);
        setPlayerPositions({ ...playerPositions, [player]: newPosition });
        setHasPlayerMoved(true);

        if (newPosition === WINNING_POSITION) {
          storeGameResult(player.toUpperCase());
          alert(`${player.toUpperCase()} is the winner!`);
          resetGame();
        }
      }
    }
  };

  const makeComputerMove = () => {
    setTimeout(() => {
      const randomValue = Math.floor(Math.random() * 6) + 1;
      setComputerDiceValue(randomValue);

      if (randomValue === 6) {
        movePlayer('blue');
      } else {
        setTimeout(() => {
          setCurrentPlayer('red');
          setComputerDiceValue(0);
          setDiceValue(0);
        }, 1000);
      }
    }, 1000);
  };

  const resetGame = () => {
    setBoardState(new Array(16).fill(null));
    setCurrentPlayer('red');
    setDiceValue(0);
    setComputerDiceValue(0);
    setPlayerPositions({
      red: -1,
      blue: -1,
    });
    setHasPlayerMoved(false);
  };

  const storeGameResult = (winner) => {
    const gameResultsRef = ref(db, 'gameResults');
    const newResultRef = push(gameResultsRef);

    newResultRef
      .then(() => {
        const timestamp = new Date().getTime();
        return set(newResultRef, {
          winner,
          timestamp,
        });
      })
      .catch((error) => {
        console.error('Error storing game result:', error);
      });
  };

  const fetchGameResults = () => {
    const gameResultsRef = ref(db, 'gameResults');

    get(gameResultsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const results = [];
          snapshot.forEach((childSnapshot) => {
            results.push(childSnapshot.val());
          });
          setGameResults(results);
        } else {
          console.log('No game results available.');
        }
      })
      .catch((error) => {
        console.error('Error fetching game results:', error);
      });
  };

  useEffect(() => {
    if (currentPlayer === 'blue') {
      makeComputerMove();
    }
  }, [currentPlayer]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">
        Current Player: {currentPlayer === 'red' ? 'Player 1' : 'Computer'}
      </h1>
      <div className="bg-green-500 p-4">
        <div className="flex flex-wrap w-56">
          {boardState.map((cell, index) => (
            <div
              key={index}
              className={`w-14 h-14 border border-white flex items-center justify-center ${cell === 'red'
                ? 'bg-red-500'
                : cell === 'blue'
                ? 'bg-blue-500'
                : ''}`}
              onClick={() => movePlayer(currentPlayer)}
            >
              {/* Render player pieces within cells */}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={rollDice}
        >
          Roll Dice
        </button>
        <p className="mt-2">
          Dice Value: {currentPlayer === 'blue' ? computerDiceValue : diceValue}
        </p>
        <button
          className="bg-green-500 text-white font-bold py-2 px-4 rounded mt-2"
          onClick={fetchGameResults}
        >
          Fetch Results
        </button>
        <div className="mt-4">
          <h2 className="text-2xl">Game Results</h2>
          <ul>
            {gameResults.map((result, index) => (
              <li key={index}>{`${result.winner} - ${new Date(result.timestamp).toLocaleString()}`}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Board;
