"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const [currentPlayer, setCurrentPlayer] = useState<1 | -1>(1);
  // board[row][col] = [layer1, layer2] (0: 空, 1: 水色, -1: ピンク)
  const [board, setBoard] = useState<number[][][]>(
    Array.from({ length: 18 }, () => 
      Array.from({ length: 18 }, () => [0, 0])
    )
  );
  const [currentPath, setCurrentPath] = useState<{ row: number, col: number, layer: number }[]>([]); // 現在置いてる途中の座標

  // プレイヤーによって管理するブロック残数
  const [playerBlocks, setPlayerBlocks] = useState({
    1: { size4: 1, size5: 1 },   // 水色プレイヤー
    [-1]: { size4: 1, size5: 1 }, // ピンクプレイヤー
  });

  const handleCellClick = (row: number, col: number) => {
    const layers = board[row][col];
    const layer1 = layers[0];
    const layer2 = layers[1];
    
    // レイヤー2が既に埋まっている場合は置けない
    if (layer2 !== 0) return;
    
    // 起点の場合
    if (currentPath.length === 0) {
      let targetLayer = -1;
      
      // レイヤー1が空なら、レイヤー1に置く
      if (layer1 === 0) {
        targetLayer = 0;
      } 
      // レイヤー1に自分の色があり、レイヤー2が空なら、レイヤー2に置ける（橋の起点）
      else if (layer1 === currentPlayer) {
        targetLayer = 1;
      }
      // それ以外は置けない
      else {
        return;
      }
      
      setCurrentPath([{ row, col, layer: targetLayer }]);
      const newBoard = board.map(r => r.map(c => [...c]));
      newBoard[row][col][targetLayer] = currentPlayer;
      setBoard(newBoard);
      return;
    }
    
    // 2マス目以降の処理
    const firstLayer = currentPath[0].layer;
    let targetLayer = -1;
    
    if (firstLayer === 0) {
      // レイヤー1モード：レイヤー1が空でなければならない
      if (layer1 === 0) {
        targetLayer = 0;
      } else {
        return; // レイヤー1に何かある場合は置けない
      }
    } else {
      // レイヤー2モード（橋渡し）
      if (layer1 === currentPlayer) {
        // レイヤー1に自分の色がある場合：レイヤー2に置く（既存マス）
        targetLayer = 1;
      } else if (layer1 === 0) {
        // レイヤー1が空の場合：レイヤー2に置く（新規マス）
        targetLayer = 1;
      } else {
        // レイヤー1に相手の色がある場合は置けない
        return;
      }
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
      const newPath = [...currentPath, { row, col, layer: targetLayer }];
      
      // すべてのマスが同じ行または同じ列にあるかチェック
      const allSameRow = newPath.every(p => p.row === newPath[0].row);
      const allSameCol = newPath.every(p => p.col === newPath[0].col);
      
      if (!allSameRow && !allSameCol) return; // 一直線でない場合は無視
    }
    
    //6マス目は無視
    if (currentPath.length === 5) return;
    
    // 新しいマスを追加
    const newPath = [...currentPath, { row, col, layer: targetLayer }];
    setCurrentPath(newPath);

    const newBoard = board.map(r => r.map(c => [...c]));
    newBoard[row][col][targetLayer] = currentPlayer;
    setBoard(newBoard);
  };

 

  const handleCancel = () => {
    // currentPathに置いたマスをボードから削除
    const newBoard = board.map(r => r.map(c => [...c]));
    currentPath.forEach(({ row, col, layer }) => {
      newBoard[row][col][layer] = 0;
    });
    setBoard(newBoard);
    setCurrentPath([]);
  };

  const handleReset = () => {
    setBoard(Array.from({ length: 18 }, () => 
      Array.from({ length: 18 }, () => [0, 0])
    ));
    setCurrentPlayer(1);
    setCurrentPath([]);
    setPlayerBlocks({ 1: { size4: 1, size5: 1 }, [-1]: { size4: 1, size5: 1 } });
  };

  function checkBridge(board: number[][][], player: 1 | -1) {
    const n = board.length; // 盤面のサイズ（例: 18）
    const visited = Array.from({ length: n }, () => Array(n).fill(false));
    const stack: { row: number; col: number }[] = [];
    
    // マスにプレイヤーの色があるかチェック（レイヤー1またはレイヤー2）
    const hasPlayerColor = (row: number, col: number) => {
      return board[row][col][0] === player || board[row][col][1] === player;
    };
  
    // 🌱 スタート地点を探す
    if (player === 1) {
      // 水色は上の端
      for (let col = 0; col < n; col++) {
        if (hasPlayerColor(0, col)) {
          stack.push({ row: 0, col }); // スタート候補として追加
          visited[0][col] = true; // 一度見た場所として記録
        }
      }
    } else {
      // ピンクは左の端
      for (let row = 0; row < n; row++) {
        if (hasPlayerColor(row, 0)) {
          stack.push({ row, col: 0 });
          visited[row][0] = true;
        }
      }
    }
  
    // 🔁 隣（上下左右）に同じ色があるかを探索する
    const directions = [
      { dr: 1, dc: 0 }, // 下
      { dr: -1, dc: 0 }, // 上
      { dr: 0, dc: 1 }, // 右
      { dr: 0, dc: -1 }, // 左
    ];
  
    // 🚶 探索開始！
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      const { row, col } = current;
  
      // 🎯 もし反対側まで届いたら勝ち！
      if (player === 1 && row === n - 1) return true; // 水色：下まで
      if (player === -1 && col === n - 1) return true; // ピンク：右まで
  
      // 🔍 周り4方向を確認する
      for (const { dr, dc } of directions) {
        const nr: number = row + dr;
        const nc: number = col + dc;
        if (
          nr >= 0 && nr < n && nc >= 0 && nc < n && // 盤面外チェック
          !visited[nr][nc] && // まだ見ていない
          hasPlayerColor(nr, nc) // 自分の色
        ) {
          visited[nr][nc] = true; // 見た記録を残す
          stack.push({ row: nr, col: nc }); // 次の探索候補として追加
        }
      }
    }
  
    // 🚫 最後まで見ても反対側に届かなかった
    return false;
  }

  const handleConfirm = () => {
    if (currentPath.length < 3) return; // 3マス未満は確定できない
    
    // レイヤー2モード（橋渡し）の場合、始点と終点が両方とも既存マスでなければならない
    const firstCell = currentPath[0];
    const lastCell = currentPath[currentPath.length - 1];
    
    if (firstCell.layer === 1) {
      // 始点がレイヤー2の場合
      const firstCellLayers = board[firstCell.row][firstCell.col];
      const lastCellLayers = board[lastCell.row][lastCell.col];
      
      // 終点もレイヤー2で、かつレイヤー1に自分の色がなければならない
      if (lastCell.layer !== 1 || lastCellLayers[0] !== currentPlayer) {
        return alert("橋渡しの終点は既存のマスでなければなりません");
      }
    }
    
    // 4マス・5マスの場合、それぞれのブロック在庫が0なら確定不可
    if (currentPath.length === 4 && playerBlocks[currentPlayer].size4 === 0) return alert("4マスブロックはもうありません");
    if (currentPath.length === 5 && playerBlocks[currentPlayer].size5 === 0) return alert("5マスブロックはもうありません");
    // ブロックを減らす
    if (currentPath.length === 4) {
      // 4マスブロックを使用
      setPlayerBlocks(prev => ({ 
        ...prev, 
        [currentPlayer]: { 
          ...prev[currentPlayer], 
          size4: prev[currentPlayer].size4 - 1 
        } 
      }));
    } else if (currentPath.length === 5) {
      // 5マスブロックを使用
      setPlayerBlocks(prev => ({ 
        ...prev, 
        [currentPlayer]: { 
          ...prev[currentPlayer], 
          size5: prev[currentPlayer].size5 - 1 
        } 
      }));
    }
    if (checkBridge(board, currentPlayer)) {
      alert("あなたの勝ちです！");
    }
    // currentPathをクリアしてターンを移動
    setCurrentPath([]);
    setCurrentPlayer((-currentPlayer) as 1 | -1);
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
                  onClick={handleConfirm}
                  className="px-4 py-1 bg-cyan-600 text-white font-bold rounded hover:bg-cyan-700 transition"
                >
                  確定
                </button>
              )}
              <button
                onClick={handleCancel}
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
            const layers = board[row][col];
            const layer1 = layers[0];
            const layer2 = layers[1];
            
            // レイヤー2が優先表示（上に重なっている）
            let bgColor = "bg-black";
            if (layer2 !== 0) {
              // レイヤー2がある場合は明るい色で表示
              bgColor = layer2 === 1 ? "bg-cyan-200" : "bg-pink-200";
            } else if (layer1 !== 0) {
              // レイヤー1のみの場合は通常の色
              bgColor = layer1 === 1 ? "bg-cyan-400" : "bg-pink-400";
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
