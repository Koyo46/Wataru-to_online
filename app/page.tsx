"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [currentPlayer, setCurrentPlayer] = useState<1 | -1>(1);
  const [board, setBoard] = useState<number[][]>(Array.from({ length: 18 }, () => Array(18).fill(0)));

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] !== 0) return;

    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer((-currentPlayer) as 1 | -1);
  };

  const handleReset = () => {
    setBoard(Array.from({ length: 18 }, () => Array(18).fill(0)));
    setCurrentPlayer(1);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* 左サイド - 水色プレイヤー */}
      <div className="flex-1 border-r-2 border-gray-300 flex items-center justify-center">
        {currentPlayer === 1 && (
          <div className="text-2xl font-bold text-cyan-400">
            あなたの番です
          </div>
        )}
      </div>
      
      {/* メイン画面（中央） */}
      <div className="flex-1 flex flex-col items-center border-r-2 border-gray-300 py-8">
        {/* タイトル */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-cyan-400">ワタルート</span>
            <span className="text-pink-400">道場</span>
          </h1>
        </div>
        
        {/* 18x18の盤面 */}
        <div className="grid grid-cols-18 gap-0 border-t-4 border-b-4 border-l-4 border-r-4 border-t-cyan-400 border-b-cyan-400 border-l-pink-400 border-r-pink-400">
          {Array.from({ length: 18 * 18 }).map((_, index) => {
            const row = Math.floor(index / 18);
            const col = index % 18;
            const cellValue = board[row][col];
            
            let bgColor = "bg-black";
            if (cellValue === 1) {
              bgColor = "bg-cyan-400";
            } else if (cellValue === -1) {
              bgColor = "bg-pink-400";
            }
            
            return (
              <div
                key={index}
                onClick={() => handleCellClick(row, col)}
                className={`w-6 h-6 ${bgColor} border border-gray-600 cursor-pointer hover:opacity-80 transition-all`}
              ></div>
            );
          })}
        </div>
        
        {/* リセットボタン */}
        <button
          onClick={handleReset}
          className="mt-6 px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
        >
          リセット
        </button>
      </div>
      
      {/* 右サイド - ピンクプレイヤー */}
      <div className="flex-1 flex items-center justify-center">
        {currentPlayer === -1 && (
          <div className="text-2xl font-bold text-pink-400">
            あなたの番です
          </div>
        )}
      </div>
    </div>
  );
}
