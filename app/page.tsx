"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const [currentPlayer, setCurrentPlayer] = useState<1 | -1>(1);
  const [board, setBoard] = useState<number[][]>(Array.from({ length: 18 }, () => Array(18).fill(0)));
  const [currentPath, setCurrentPath] = useState<{ row: number, col: number }[]>([]); // 現在置いてる途中の座標

  // プレイヤーによって管理するブロック残数
  const [playerBlocks, setPlayerBlocks] = useState({
    1: { size4: 1, size5: 1 },   // 水色プレイヤー
    [-1]: { size4: 1, size5: 1 }, // ピンクプレイヤー
  });

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] !== 0) return; // 既に置かれてたら無視
  
    // もし何も置いてない状態なら、起点として置く
    if (currentPath.length === 0) {
      setCurrentPath([{ row, col }]);
      const newBoard = [...board.map(row => [...row])];
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      return;
    }
  
    // すでに置いている場合、currentPath内のいずれかのマスの隣でなければ無視
    const isAdjacentToPath = currentPath.some(p => 
      (Math.abs(p.row - row) === 1 && p.col === col) ||
      (Math.abs(p.col - col) === 1 && p.row === row)
    );
  
    if (!isAdjacentToPath) return;
  
    // すでにcurrentPathに含まれていたら無視（重複防止）
    if (currentPath.some(p => p.row === row && p.col === col)) return;
  
    // 一直線チェック：2マス目以降は方向を決定し、その方向に沿っているか確認
    if (currentPath.length >= 1) {
      const newPath = [...currentPath, { row, col }];
      
      // すべてのマスが同じ行または同じ列にあるかチェック
      const allSameRow = newPath.every(p => p.row === newPath[0].row);
      const allSameCol = newPath.every(p => p.col === newPath[0].col);
      
      if (!allSameRow && !allSameCol) return; // 一直線でない場合は無視
    }
    
    // 新しいマスを追加
    const newPath = [...currentPath, { row, col }];
    setCurrentPath(newPath);

    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
  };

  const handleReset = () => {
    setBoard(Array.from({ length: 18 }, () => Array(18).fill(0)));
    setCurrentPlayer(1);
    setCurrentPath([]);
    setPlayerBlocks({ 1: { size4: 1, size5: 1 }, [-1]: { size4: 1, size5: 1 } });
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* 左サイド - 水色プレイヤー */}
      <div className="flex-1 border-r-2 border-gray-300 flex flex-col items-center justify-center gap-8">
        {currentPlayer === 1 && (
          <div className="text-2xl font-bold text-cyan-400">
            あなたの番です
          </div>
        )}
        
        {/* ブロック表示 */}
        <div className="flex flex-col gap-4">
          {/* 3マスブロック */}
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              <div className="w-5 h-5 bg-cyan-400 border border-cyan-600"></div>
              <div className="w-5 h-5 bg-cyan-400 border border-cyan-600"></div>
              <div className="w-5 h-5 bg-cyan-400 border border-cyan-600"></div>
            </div>
            <span className="text-lg font-bold text-black">∞</span>
          </div>
          
          {/* 4マスブロック */}
          <div className={`flex items-center gap-3 ${playerBlocks[1].size4 === 0 ? 'opacity-30' : ''}`}>
            <div className="flex gap-0.5">
              <div className={`w-5 h-5 border ${playerBlocks[1].size4 > 0 ? 'bg-cyan-400 border-cyan-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[1].size4 > 0 ? 'bg-cyan-400 border-cyan-600' : 'bg-gray-500 border-gray-600'}`}></div>
            </div>
            <span className="text-lg font-bold text-black">残{playerBlocks[1].size4}</span>
          </div>
          
          {/* 5マスブロック */}
          <div className={`flex items-center gap-3 ${playerBlocks[1].size5 === 0 ? 'opacity-30' : ''}`}>
            <div className="flex gap-0.5">
              <div className={`w-5 h-5 border ${playerBlocks[1].size5 > 0 ? 'bg-cyan-400 border-cyan-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[1].size5 > 0 ? 'bg-cyan-400 border-cyan-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[1].size5 > 0 ? 'bg-cyan-400 border-cyan-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[1].size5 > 0 ? 'bg-cyan-400 border-cyan-600' : 'bg-gray-500 border-gray-600'}`}></div>
            </div>
            <span className="text-lg font-bold text-black">残{playerBlocks[1].size5}</span>
          </div>
        </div>
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
        
        {/* タイル配置中なら表示 */}
        <div className="flex justify-center items-center mt-4 mb-6 min-h-[56px]">
          {currentPath.length > 0 ? (
            <div className="flex gap-4 mt-2">
              {currentPath.length > 2 && (
                <button
                  className="px-4 py-1 bg-cyan-600 text-white font-bold rounded hover:bg-cyan-700 transition"
                  // onClick={handleConfirmPath} // 実装されていれば
                >
                  確定
                </button>
              )}
              <button
                // onClick={handleCancelPath} // 実装されていれば
                className="px-4 py-1 bg-gray-500 text-white font-bold rounded hover:bg-gray-600 transition"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="flex gap-4 mt-2" />
          )}
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
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {currentPlayer === -1 && (
          <div className="text-2xl font-bold text-pink-400">
            あなたの番です
          </div>
        )}
        
        {/* ブロック表示 */}
        <div className="flex flex-col gap-4">
          {/* 3マスブロック */}
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              <div className="w-5 h-5 bg-pink-400 border border-pink-600"></div>
              <div className="w-5 h-5 bg-pink-400 border border-pink-600"></div>
              <div className="w-5 h-5 bg-pink-400 border border-pink-600"></div>
            </div>
            <span className="text-lg font-bold text-black">∞</span>
          </div>
          
          {/* 4マスブロック */}
          <div className={`flex items-center gap-3 ${playerBlocks[-1].size4 === 0 ? 'opacity-30' : ''}`}>
            <div className="flex gap-0.5">
              <div className={`w-5 h-5 border ${playerBlocks[-1].size4 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[-1].size4 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[-1].size4 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[-1].size4 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
            </div>
            <span className="text-lg font-bold text-black">残{playerBlocks[-1].size4}</span>
          </div>
          
          {/* 5マスブロック */}
          <div className={`flex items-center gap-3 ${playerBlocks[-1].size5 === 0 ? 'opacity-30' : ''}`}>
            <div className="flex gap-0.5">
              <div className={`w-5 h-5 border ${playerBlocks[-1].size5 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[-1].size5 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[-1].size5 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[-1].size5 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
              <div className={`w-5 h-5 border ${playerBlocks[-1].size5 > 0 ? 'bg-pink-400 border-pink-600' : 'bg-gray-500 border-gray-600'}`}></div>
            </div>
            <span className="text-lg font-bold text-black">残{playerBlocks[-1].size5}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
