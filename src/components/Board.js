import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { getDatabase, ref, push, get, set } from 'firebase/database';

function Board() {
  const [boardState, setBoardState] = useState(Array(16).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [diceValue, setDiceValue] = useState(0);
  const [computerDiceValue, setComputerDiceValue] = useState(0);
  const [playerPositions, setPlayerPositions] = useState({
    red: -1,
    blue: -1,
  });
  const [hasPlayerMoved, setHasPlayerMoved] = useState(false); // Track if player moved after rolling 6
  const [gameResults, setGameResults] = useState([]);

  const WINNING_POSITION = boardState.length - 1; // Define the winning position

  const rollDice = () => {
    const randomValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(randomValue);

    if (currentPlayer === 'red') {
      if (randomValue !== 6 || hasPlayerMoved) {
        // Only switch to the computer's turn if the player didn't roll a 6 or has already moved
        setTimeout(() => {
          setCurrentPlayer('blue');
          setHasPlayerMoved(false); // Reset the flag when switching to the computer's turn
          makeComputerMove();
        }, 1000);
      }
    }
  };

  const movePlayer = (player) => {
    if (!hasPlayerMoved && diceValue === 6) {
      // If the player hasn't moved after rolling a 6, they can move one step
      const newPosition = playerPositions[player] + 1;
      if (newPosition <= WINNING_POSITION) {
        const newBoardState = [...boardState];
        newBoardState[newPosition] = player;
        newBoardState[playerPositions[player]] = null;
        setBoardState(newBoardState);
        setPlayerPositions({ ...playerPositions, [player]: newPosition });
        setHasPlayerMoved(true); // Set the flag to indicate that the player has moved

        // Check for a winner
        if (newPosition === WINNING_POSITION) {
          // Declare the current player as the winner
          alert(`${player.toUpperCase()} is the winner!`);
          // Reset the game
          resetGame();
          return;
        }
      }
    }
  };

  const makeComputerMove = () => {
    setTimeout(() => {
      const randomValue = Math.floor(Math.random() * 6) + 1;
      setComputerDiceValue(randomValue);

      if (randomValue === 6) {
        // If the computer rolled a 6, they should make a move
        movePlayer('blue');
      }

      setTimeout(() => {
        setCurrentPlayer('red');
        setComputerDiceValue(0); // Reset computer's dice value after 5 seconds
        setDiceValue(0); // Reset player's dice value to 0
      }, 1000);
    }, 1000);
  };

  const resetGame = () => {
    setBoardState(Array(16).fill(null));
    setCurrentPlayer('red');
    setDiceValue(0);
    setComputerDiceValue(0);
    setPlayerPositions({
      red: -1,
      blue: -1,
    });
    setHasPlayerMoved(false); // Reset the flag when resetting the game
  };

  const storeGameResult = (winner) => {
    const gameResultsRef = ref(db, 'gameResults');
    const newResultRef = push(gameResultsRef);

    newResultRef
      .then(() => {
        // Set the winner and timestamp in the database
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
          setGameResults(results); // Set game results in state
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
                  : 'bg-green-500'
                }`}
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
