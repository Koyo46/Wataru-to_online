import { GameState, Move, GameStateForAI } from '../types/game';

export class WataruToGame {
  private state: GameState;

  constructor(initialState?: GameState) {
    this.state = initialState || this.getInitialState();
  }

  // 現在の状態を取得
  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Alpha Zero用：現在の状態を取得
  getStateForAI(): GameStateForAI {
    return {
      board: JSON.parse(JSON.stringify(this.state.board)), // ディープコピー
      currentPlayer: this.state.currentPlayer,
      availableBlocks: {
        size4: this.state.playerBlocks[this.state.currentPlayer].size4,
        size5: this.state.playerBlocks[this.state.currentPlayer].size5,
      },
      legalMoves: this.getLegalMoves(),
    };
  }

  // 盤面を数値配列に変換（Alpha Zeroの入力用）
  getBoardAsTensor(): number[][][] {
    // [channel, row, col] 形式に変換
    // channel 0: player 1 layer 1
    // channel 1: player 1 layer 2
    // channel 2: player -1 layer 1
    // channel 3: player -1 layer 2
    const tensor = Array(4).fill(0).map(() => 
      Array(18).fill(0).map(() => Array(18).fill(0))
    );
    
    for (let r = 0; r < 18; r++) {
      for (let c = 0; c < 18; c++) {
        const [layer1, layer2] = this.state.board[r][c];
        if (layer1 === 1) tensor[0][r][c] = 1;
        if (layer1 === -1) tensor[2][r][c] = 1;
        if (layer2 === 1) tensor[1][r][c] = 1;
        if (layer2 === -1) tensor[3][r][c] = 1;
      }
    }
    
    return tensor;
  }

  // すべての合法手を取得（後で実装）
  getLegalMoves(): Move[] {
    const moves: Move[] = [];
    // TODO: 合法手の生成ロジックを実装
    // 現在のhandleCellClickロジックを参考に、全パターンを列挙
    return moves;
  }

  // 手を適用
  applyMove(move: Move): boolean {
    if (move.player !== this.state.currentPlayer) {
      return false;
    }

    // ブロックサイズのチェック
    const blockSize = move.path.length;
    if (blockSize === 4) {
      if (this.state.playerBlocks[move.player].size4 <= 0) {
        return false;
      }
      this.state.playerBlocks[move.player].size4--;
    } else if (blockSize === 5) {
      if (this.state.playerBlocks[move.player].size5 <= 0) {
        return false;
      }
      this.state.playerBlocks[move.player].size5--;
    }

    // 盤面に手を適用
    move.path.forEach(({ row, col, layer }) => {
      this.state.board[row][col][layer] = move.player;
    });

    // 履歴に追加
    this.state.moveHistory.push({
      ...move,
      timestamp: Date.now(),
    });

    // ターン交代
    this.state.currentPlayer = (-this.state.currentPlayer) as 1 | -1;

    return true;
  }

  // 勝敗判定
  checkWinner(): 1 | -1 | 0 {
    if (this.checkBridge(1)) return 1;
    if (this.checkBridge(-1)) return -1;
    return 0;
  }

  // 既存のcheckBridgeメソッド（page.tsxから移植）
  private checkBridge(player: 1 | -1): boolean {
    const n = this.state.board.length;
    const visited = Array.from({ length: n }, () => Array(n).fill(false));
    const stack: { row: number; col: number }[] = [];
    
    // マスにプレイヤーの色があるかチェック（レイヤー1またはレイヤー2）
    const hasPlayerColor = (row: number, col: number) => {
      return this.state.board[row][col][0] === player || this.state.board[row][col][1] === player;
    };
  
    // スタート地点を探す
    if (player === 1) {
      // 水色は上の端
      for (let col = 0; col < n; col++) {
        if (hasPlayerColor(0, col)) {
          stack.push({ row: 0, col });
          visited[0][col] = true;
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
  
    // 隣（上下左右）に同じ色があるかを探索する
    const directions = [
      { dr: 1, dc: 0 },
      { dr: -1, dc: 0 },
      { dr: 0, dc: 1 },
      { dr: 0, dc: -1 },
    ];
  
    // 探索開始
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      const { row, col } = current;
  
      // もし反対側まで届いたら勝ち
      if (player === 1 && row === n - 1) return true;
      if (player === -1 && col === n - 1) return true;
  
      // 周り4方向を確認する
      for (const { dr, dc } of directions) {
        const nr: number = row + dr;
        const nc: number = col + dc;
        if (
          nr >= 0 && nr < n && nc >= 0 && nc < n &&
          !visited[nr][nc] &&
          hasPlayerColor(nr, nc)
        ) {
          visited[nr][nc] = true;
          stack.push({ row: nr, col: nc });
        }
      }
    }
  
    return false;
  }

  // ゲーム状態のコピーを作成（シミュレーション用）
  clone(): WataruToGame {
    return new WataruToGame(JSON.parse(JSON.stringify(this.state)));
  }

  // 棋譜の出力（学習データ保存用）
  exportGameRecord(): string {
    return JSON.stringify({
      initialState: this.getInitialState(),
      moves: this.state.moveHistory,
      winner: this.checkWinner(),
    });
  }

  private getInitialState(): GameState {
    return {
      board: Array.from({ length: 18 }, () => 
        Array.from({ length: 18 }, () => [0, 0])
      ),
      currentPlayer: 1,
      playerBlocks: {
        1: { size4: 1, size5: 1 },
        [-1]: { size4: 1, size5: 1 },
      },
      moveHistory: [],
    };
  }
}