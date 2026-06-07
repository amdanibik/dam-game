/**
 * GAME DAMAN - Permainan Tradisional Indonesia
 * Game Logic menggunakan Canvas API
 * 
 * Classes:
 * - Piece: Merepresentasikan satu pion di papan
 * - Board: Mengelola state papan permainan
 * - Game: Main game engine
 */

// ============================================
// KONSTANTA
// ============================================
const BOARD_SIZE = 5; // Grid 5x5
const CELL_SIZE = 80; // Ukuran setiap cell dalam pixel
const CANVAS_SIZE = CELL_SIZE * BOARD_SIZE;

const PLAYERS = {
    PLAYER1: 1,
    PLAYER2: 2,
    NONE: 0
};

const COLORS = {
    BOARD_BG: '#a0826d',
    GRID_LINE: 'rgba(255, 255, 255, 0.6)',
    GRID_POINT: 'rgba(255, 255, 255, 0.8)',
    VALID_MOVE: 'rgba(100, 200, 100, 0.4)',
    CAPTURE_MOVE: 'rgba(255, 100, 100, 0.4)',
    SELECTED: 'rgba(255, 215, 0, 0.6)',
    PIECE_P1: '#d3d3d3',
    PIECE_P1_SHADOW: '#808080',
    PIECE_P2: '#a52a2a',
    PIECE_P2_SHADOW: '#701515',
    PIECE_OUTLINE: '#333333'
};

// ============================================
// CLASS PIECE - Merepresentasikan Satu Pion
// ============================================
class Piece {
    constructor(player, row, col) {
        this.player = player; // 1 atau 2
        this.row = row;
        this.col = col;
        this.captured = false;
    }

    /**
     * Clone piece untuk keperluan immutability
     */
    clone() {
        const newPiece = new Piece(this.player, this.row, this.col);
        newPiece.captured = this.captured;
        return newPiece;
    }
}

// ============================================
// CLASS BOARD - Mengelola State Papan
// ============================================
class Board {
    constructor() {
        this.pieces = []; // Array semua pion
        this.initializeBoard();
    }

    /**
     * Inisialisasi board dengan konfigurasi awal
     * Player 1 (abu-abu) di atas
     * Player 2 (coklat) di bawah
     */
    initializeBoard() {
        this.pieces = [];
        // Player 1: Baris 0-1 (10 pion) - isi semua kolom pada dua baris teratas
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.pieces.push(new Piece(PLAYERS.PLAYER1, row, col));
            }
        }

        // Player 2: Baris 3-4 (10 pion) - isi semua kolom pada dua baris terbawah
        for (let row = 3; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.pieces.push(new Piece(PLAYERS.PLAYER2, row, col));
            }
        }
    }

    /**
     * Mendapatkan pion pada posisi tertentu
     */
    getPieceAt(row, col) {
        return this.pieces.find(p => !p.captured && p.row === row && p.col === col);
    }

    /**
     * Memindahkan pion dari satu posisi ke posisi lain
     */
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPieceAt(fromRow, fromCol);
        if (piece) {
            piece.row = toRow;
            piece.col = toCol;
        }
    }

    /**
     * Menghapus pion lawan yang dilompati
     */
    capturePiece(row, col) {
        const piece = this.getPieceAt(row, col);
        if (piece) {
            piece.captured = true;
        }
    }

    /**
     * Menghitung jumlah pion yang masih aktif untuk setiap pemain
     */
    getPieceCount(player) {
        return this.pieces.filter(p => !p.captured && p.player === player).length;
    }

    /**
     * Clone board untuk keperluan game logic
     */
    clone() {
        const newBoard = new Board();
        newBoard.pieces = this.pieces.map(p => p.clone());
        return newBoard;
    }
}

// ============================================
// CLASS GAME - Main Game Engine
// ============================================
class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = PLAYERS.PLAYER1;
        this.selectedPiece = null;
        this.validMoves = [];
        this.captureMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.soundEnabled = true;
        this.animatingPiece = null;
        this.animationProgress = 0;
        this.aiEnabled = true; // Aktifkan AI untuk Pemain 2
        this.aiThinking = false;
        this.aiDepth = 3; // default minimax depth
        this._aiExpectedMs = 1200; // moving average estimate for AI runtime
        this._aiTimerInterval = null;
        this.forcedCapture = false; // when true, player must capture if available
        this.history = []; // stack for undo
    }

    /**
     * FUNGSI CORE: Mendapatkan semua langkah yang valid untuk pion tertentu
     * Tidak termasuk langkah makan (capture moves)
     */
    // Get valid normal (non-capture) moves for a piece on a given board state.
    // boardState is optional; if omitted, use current game board.
    getValidMoves(row, col, boardState = null) {
        const board = boardState || this.board;
        const piece = board.getPieceAt(row, col);
        if (!piece) return [];

        const validMoves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            // Check bounds
            if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                // Posisi harus kosong
                if (!board.getPieceAt(newRow, newCol)) {
                    validMoves.push({ row: newRow, col: newCol, isCapture: false });
                }
            }
        }

        return validMoves;
    }

    /**
     * FUNGSI CORE: Mendapatkan semua langkah makan (capture) untuk pion tertentu
     * Termasuk multi-capture (makan berantai)
     */
    getCaptureMoves(row, col, boardState = null) {
        const board = boardState || this.board;
        const piece = board.getPieceAt(row, col);
        if (!piece) return [];

        const captureMoves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let [dRow, dCol] of directions) {
            const adjacentRow = row + dRow;
            const adjacentCol = col + dCol;
            const landRow = row + dRow * 2;
            const landCol = col + dCol * 2;

            // Check bounds
            if (landRow >= 0 && landRow < BOARD_SIZE && landCol >= 0 && landCol < BOARD_SIZE) {
                const adjacentPiece = board.getPieceAt(adjacentRow, adjacentCol);
                const landingPiece = board.getPieceAt(landRow, landCol);

                // Ada pion lawan yang bisa dilompati dan tempat pendaratan kosong
                if (adjacentPiece && adjacentPiece.player !== piece.player && !landingPiece) {
                    captureMoves.push({
                        row: landRow,
                        col: landCol,
                        capturedRow: adjacentRow,
                        capturedCol: adjacentCol,
                        isCapture: true
                    });
                }
            }
        }

        return captureMoves;
    }

    /**
     * FUNGSI CORE: Mengeksekusi langkah pemain
     */
    performMove(fromRow, fromCol, toRow, toCol) {
        // Cari apakah langkah ini adalah capture atau normal
        const captures = this.getCaptureMoves(fromRow, fromCol);
        const captureMove = captures.find(m => m.row === toRow && m.col === toCol);

        // Jika ada capture yang tersedia untuk pemain lain di papan, pemain harus memilih capture
        const globalHasCapture = this.hasAvailableCaptureMoves(this.currentPlayer);

        if (captureMove) {
            // Simpan state sebelum langkah berhasil
            this.saveHistory();
            // Eksekusi langkah makan
            const testBoard = this.board.clone();
            testBoard.movePiece(fromRow, fromCol, toRow, toCol);
            testBoard.capturePiece(captureMove.capturedRow, captureMove.capturedCol);

            // Check untuk multi-capture (makan berantai) pada board hasil sementara
            const additionalCaptures = this.getCaptureMoves(toRow, toCol, testBoard);
            if (additionalCaptures.length > 0) {
                // Ada kesempatan untuk makan lagi -> jangan ubah giliran
                this.board = testBoard;
                this.selectedPiece = { row: toRow, col: toCol };
                this.captureMoves = additionalCaptures;
                this.validMoves = [];
                this.playSound('capture');
                if (window.updateUI) window.updateUI();
                return { success: true, multiCapture: true };
            } else {
                // Langkah makan selesai -> ubah giliran
                this.board = testBoard;
                this.playSound('capture');
                if (window.updateUI) window.updateUI();
                this.endTurn();
                return { success: true, multiCapture: false };
            }
        }

        // Jika tidak capture, cek apakah langkah normal sesuai
        const valids = this.getValidMoves(fromRow, fromCol);
        const validMove = valids.find(m => m.row === toRow && m.col === toCol);

        // Jika forcedCapture aktif dan ada capture tersedia di papan, larang langkah normal
        if (!captureMove && globalHasCapture && this.forcedCapture) {
            return { success: false, reason: 'must_capture' };
        }

        if (validMove) {
            this.saveHistory();
            this.board.movePiece(fromRow, fromCol, toRow, toCol);
            this.playSound('move');
            if (window.updateUI) window.updateUI();
            this.endTurn();
            return { success: true, multiCapture: false };
        }

        return { success: false };
    }

    saveHistory() {
        const snapshot = {
            board: this.board.clone(),
            currentPlayer: this.currentPlayer,
            selectedPiece: this.selectedPiece ? { ...this.selectedPiece } : null,
            validMoves: this.validMoves.map(m => ({ ...m })),
            captureMoves: this.captureMoves.map(m => ({ ...m })),
            gameOver: this.gameOver,
            winner: this.winner
        };
        this.history.push(snapshot);
        if (this.history.length > 20) {
            this.history.shift();
        }
    }

    undoMove() {
        if (this.history.length === 0 || this.aiThinking) return;
        const snapshot = this.history.pop();
        this.board = snapshot.board;
        this.currentPlayer = snapshot.currentPlayer;
        this.selectedPiece = snapshot.selectedPiece;
        this.validMoves = snapshot.validMoves;
        this.captureMoves = snapshot.captureMoves;
        this.gameOver = snapshot.gameOver;
        this.winner = snapshot.winner;
        if (window.updateUI) window.updateUI();
        if (renderer) renderer.render();
    }

    /**
     * Helper: Mencari move dalam capture moves list
     */
    findMoveInCaptureMoves(fromRow, fromCol, toRow, toCol) {
        // Backwards-compatible helper: cari capture atau normal move
        const captures = this.getCaptureMoves(fromRow, fromCol);
        const cap = captures.find(m => m.row === toRow && m.col === toCol);
        if (cap) return cap;
        const valids = this.getValidMoves(fromRow, fromCol);
        return valids.find(m => m.row === toRow && m.col === toCol) || null;
    }

    /**
     * Mengecek apakah ada langkah makan yang wajib (forced capture)
     */
    hasAvailableCaptureMoves(player) {
        const playerPieces = this.board.pieces.filter(p => !p.captured && p.player === player);
        for (let piece of playerPieces) {
            const captures = this.getCaptureMoves(piece.row, piece.col);
            if (captures.length > 0) return true;
        }
        return false;
    }

    /**
     * Mengecek apakah pemain memiliki langkah yang valid
     */
    hasValidMoves(player) {
        const playerPieces = this.board.pieces.filter(p => !p.captured && p.player === player);
        for (let piece of playerPieces) {
            const validMoves = this.getValidMoves(piece.row, piece.col);
            if (validMoves.length > 0) return true;
        }
        return false;
    }

    /**
     * Cari urutan capture terpanjang dari posisi piece tertentu (menggunakan DFS)
     * Mengembalikan array langkah capture berurutan, setiap langkah berisi {row, col, capturedRow, capturedCol}
     */
    findBestCaptureSequence(startRow, startCol, boardState = null) {
        const board = boardState ? boardState : this.board;

        const dfs = (row, col, b) => {
            const captures = this.getCaptureMoves(row, col, b);
            if (captures.length === 0) return { seq: [], len: 0 };

            let best = { seq: [], len: 0 };
            for (let cap of captures) {
                // Simulate
                const nb = b.clone();
                nb.movePiece(row, col, cap.row, cap.col);
                nb.capturePiece(cap.capturedRow, cap.capturedCol);

                const next = dfs(cap.row, cap.col, nb);
                const totalSeq = [{ row: cap.row, col: cap.col, capturedRow: cap.capturedRow, capturedCol: cap.capturedCol }].concat(next.seq);
                if (totalSeq.length > best.len) {
                    best.len = totalSeq.length;
                    best.seq = totalSeq;
                }
            }
            return best;
        };

        return dfs(startRow, startCol, board);
    }

    /**
     * Temukan langkah terbaik untuk pemain: prioritas capture (urutan terpanjang), jika tidak ada, pilih langkah normal acak
     */
    findBestMoveForPlayer(player) {
        // Use minimax with alpha-beta pruning to choose best move
        const DEPTH = 3; // adjustable depth
        const result = this.minimax(this.board, DEPTH, -Infinity, Infinity, true, player);
        if (result && result.move) return result.move;
        return null;
    }

    // Generate all capture sequences starting from a piece (DFS)
    findAllCaptureSequences(startRow, startCol, boardState = null) {
        const board = boardState || this.board;

        const dfs = (row, col, b) => {
            const captures = this.getCaptureMoves(row, col, b);
            if (captures.length === 0) return [[]];

            const sequences = [];
            for (let cap of captures) {
                const nb = b.clone();
                nb.movePiece(row, col, cap.row, cap.col);
                nb.capturePiece(cap.capturedRow, cap.capturedCol);

                const tails = dfs(cap.row, cap.col, nb);
                for (let tail of tails) {
                    sequences.push([{ row: cap.row, col: cap.col, capturedRow: cap.capturedRow, capturedCol: cap.capturedCol }].concat(tail));
                }
            }
            return sequences;
        };

        // Filter out the empty sequence if no captures
        const allSeq = dfs(startRow, startCol, board).filter(s => s.length > 0);
        return allSeq;
    }

    // Generate all legal moves for a player on a given board state.
    generateMovesForPlayer(boardState, player) {
        const moves = [];
        const pieces = boardState.pieces.filter(p => !p.captured && p.player === player);

        // First collect all capture sequences (forced captures)
        for (let p of pieces) {
            const seqs = this.findAllCaptureSequences(p.row, p.col, boardState);
            for (let seq of seqs) {
                moves.push({ type: 'capture', fromRow: p.row, fromCol: p.col, seq });
            }
        }

        if (moves.length > 0) return moves; // forced capture

        // Otherwise collect normal moves
        for (let p of pieces) {
            const valids = this.getValidMoves(p.row, p.col, boardState);
            for (let v of valids) {
                moves.push({ type: 'move', fromRow: p.row, fromCol: p.col, to: { row: v.row, col: v.col } });
            }
        }

        return moves;
    }

    // Apply a move on a cloned board and return the new board
    applyMoveOnBoard(boardState, move) {
        const nb = boardState.clone();
        if (move.type === 'move') {
            nb.movePiece(move.fromRow, move.fromCol, move.to.row, move.to.col);
        } else if (move.type === 'capture') {
            let curRow = move.fromRow;
            let curCol = move.fromCol;
            for (let step of move.seq) {
                nb.movePiece(curRow, curCol, step.row, step.col);
                nb.capturePiece(step.capturedRow, step.capturedCol);
                curRow = step.row;
                curCol = step.col;
            }
        }
        return nb;
    }

    // Evaluate board from perspective of AI (PLAYER2). Higher is better for AI.
    evaluateBoard(boardState) {
        const scorePiece = 100;
        const scoreMobility = 3;
        const scoreCenter = 2;

        const p1count = boardState.getPieceCount(PLAYERS.PLAYER1);
        const p2count = boardState.getPieceCount(PLAYERS.PLAYER2);

        let score = (p2count - p1count) * scorePiece;

        // Mobility
        const p1Moves = this.generateMovesForPlayer(boardState, PLAYERS.PLAYER1).length;
        const p2Moves = this.generateMovesForPlayer(boardState, PLAYERS.PLAYER2).length;
        score += (p2Moves - p1Moves) * scoreMobility;

        // Center control
        const center = { row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) };
        for (let p of boardState.pieces) {
            if (p.captured) continue;
            const dist = Math.abs(p.row - center.row) + Math.abs(p.col - center.col);
            const centerVal = Math.max(0, (BOARD_SIZE - dist));
            if (p.player === PLAYERS.PLAYER2) score += centerVal * scoreCenter;
            else score -= centerVal * scoreCenter;
        }

        return score;
    }

    // Minimax with alpha-beta. Returns {score, move}
    minimax(boardState, depth, alpha, beta, maximizingPlayer, playerToMove) {
        // Terminal or depth 0
        const winner = (() => {
            if (boardState.getPieceCount(PLAYERS.PLAYER1) === 0) return PLAYERS.PLAYER2;
            if (boardState.getPieceCount(PLAYERS.PLAYER2) === 0) return PLAYERS.PLAYER1;
            return null;
        })();

        if (depth === 0 || winner) {
            return { score: this.evaluateBoard(boardState), move: null };
        }

        const moves = this.generateMovesForPlayer(boardState, playerToMove);
        if (moves.length === 0) {
            // No legal moves -> losing for playerToMove
            const s = this.evaluateBoard(boardState) + (playerToMove === PLAYERS.PLAYER2 ? -500 : 500);
            return { score: s, move: null };
        }

        let bestMove = null;

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let m of moves) {
                const nb = this.applyMoveOnBoard(boardState, m);
                const next = this.minimax(nb, depth - 1, alpha, beta, false, playerToMove === PLAYERS.PLAYER1 ? PLAYERS.PLAYER2 : PLAYERS.PLAYER1);
                if (next.score > maxEval) {
                    maxEval = next.score;
                    bestMove = m;
                }
                alpha = Math.max(alpha, next.score);
                if (beta <= alpha) break;
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (let m of moves) {
                const nb = this.applyMoveOnBoard(boardState, m);
                const next = this.minimax(nb, depth - 1, alpha, beta, true, playerToMove === PLAYERS.PLAYER1 ? PLAYERS.PLAYER2 : PLAYERS.PLAYER1);
                if (next.score < minEval) {
                    minEval = next.score;
                    bestMove = m;
                }
                beta = Math.min(beta, next.score);
                if (beta <= alpha) break;
            }
            return { score: minEval, move: bestMove };
        }
    }

    /**
     * AI: Eksekusi langkah otomatis untuk pemain 2 (atau player yang ditentukan)
     */
    async aiMove() {
        if (!this.aiEnabled || this.aiThinking || this.gameOver) return;
        this.aiThinking = true;

        // Start AI timer UI with estimated duration based on depth and moving average
        const estimated = Math.max(400, this._aiExpectedMs * (this.aiDepth / 3));
        this.startAITimer(estimated);

        // Tambah delay kecil untuk terasa natural
        const delay = ms => new Promise(res => setTimeout(res, ms));

        const player = this.currentPlayer;

        // Cari langkah terbaik
        const best = this.findBestMoveForPlayer(player);
        if (!best) {
            this.aiThinking = false;
            // Tidak ada langkah -> langsung endTurn
            this.endTurn();
            return;
        }

        // Perform first step
        await delay(400);
        if (best.type === 'capture') {
            const { fromRow, fromCol, seq } = best;
            const firstStep = seq[0];
            const res = this.performMove(fromRow, fromCol, firstStep.row, firstStep.col);

            // Jika multi-capture, teruskan secara otomatis
            while (res && res.success && res.multiCapture) {
                // selesaikan satu langkah (board sudah diperbarui). Ambil next capture dari captureMoves
                await delay(300);
                const sel = this.selectedPiece;
                if (!sel) break;
                const nextCap = this.captureMoves[0];
                if (!nextCap) break;
                const r = this.performMove(sel.row, sel.col, nextCap.row, nextCap.col);
                if (!r || !r.success) break;
                if (!r.multiCapture) break;
            }
        } else if (best.type === 'move') {
            const { fromRow, fromCol, to } = best;
            this.performMove(fromRow, fromCol, to.row, to.col);
        }

        // Setelah AI selesai, pastikan giliran berpindah dan update state
        this.aiThinking = false;
        // Stop AI timer UI (this will update expected duration estimate)
        this.stopAITimer();
        if (window.updateUI) window.updateUI();
    }

    startAITimer(durationMs) {
        try {
            const bar = document.getElementById('ai-timer-bar');
            const text = document.getElementById('ai-timer-text');
            const container = document.getElementById('ai-timer');
            if (!bar || !text || !container) return;
            container.classList.remove('hidden');
            const start = performance.now();
            this._aiTimerStart = start;
            const expected = durationMs || this._aiExpectedMs || 1000;
            if (this._aiTimerInterval) clearInterval(this._aiTimerInterval);
            this._aiTimerInterval = setInterval(() => {
                const now = performance.now();
                const elapsed = now - start;
                // progress proportional to elapsed / expected
                const pct = Math.min(0.9999, elapsed / expected);
                bar.style.transform = `scaleX(${pct})`;
                const elapsedSec = (elapsed / 1000).toFixed(1);
                text.textContent = `${elapsedSec}s`;
                // store current start so stopAITimer can compute actual elapsed
                this._aiTimerStart = start;
            }, 80);
        } catch (e) { /* ignore DOM errors */ }
    }

    stopAITimer() {
        try {
            const container = document.getElementById('ai-timer');
            const bar = document.getElementById('ai-timer-bar');
            const text = document.getElementById('ai-timer-text');
            if (this._aiTimerInterval) {
                clearInterval(this._aiTimerInterval);
                this._aiTimerInterval = null;
            }
            // compute actual elapsed and update moving average
            const now = performance.now();
            const start = this._aiTimerStart || now;
            const actual = Math.max(0, now - start);
            // EMA: newExpected = 0.7*old + 0.3*actual
            this._aiExpectedMs = Math.round((this._aiExpectedMs * 0.7) + (actual * 0.3));

            if (container) container.classList.add('hidden');
            if (bar) bar.style.transform = 'scaleX(0)';
            if (text) text.textContent = '';
        } catch (e) {}
    }

    /**
     * FUNGSI CORE: Mengecek kondisi kemenangan
     */
    checkWinner() {
        // Jika semua pion Player 2 habis
        if (this.board.getPieceCount(PLAYERS.PLAYER2) === 0) {
            return PLAYERS.PLAYER1;
        }

        // Jika semua pion Player 1 habis
        if (this.board.getPieceCount(PLAYERS.PLAYER1) === 0) {
            return PLAYERS.PLAYER2;
        }

        // Jika pemain saat ini tidak memiliki langkah valid
        if (!this.hasValidMoves(this.currentPlayer)) {
            return this.currentPlayer === PLAYERS.PLAYER1 ? PLAYERS.PLAYER2 : PLAYERS.PLAYER1;
        }

        return null; // Permainan masih berjalan
    }

    /**
     * Mengakhiri giliran pemain
     */
    endTurn() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.captureMoves = [];

        // Ganti pemain
        this.currentPlayer = this.currentPlayer === PLAYERS.PLAYER1 ? PLAYERS.PLAYER2 : PLAYERS.PLAYER1;

        // Check untuk langkah makan wajib
        if (this.hasAvailableCaptureMoves(this.currentPlayer)) {
            // Pemain harus makan
        }

        // Check kemenangan
        const winner = this.checkWinner();
        if (winner) {
            this.gameOver = true;
            this.winner = winner;
        }
        // Jika giliran AI dan AI aktif, jalankan AI setelah delay singkat
        if (!this.gameOver && this.aiEnabled && this.currentPlayer === PLAYERS.PLAYER2) {
            setTimeout(() => this.aiMove(), 250);
        }
    }

    /**
     * Memilih pion untuk dimainkan
     */
    selectPiece(row, col) {
        const piece = this.board.getPieceAt(row, col);

        if (!piece || piece.player !== this.currentPlayer) {
            this.selectedPiece = null;
            this.validMoves = [];
            this.captureMoves = [];
            return;
        }

        // Jika ada capture yang tersedia di seluruh papan, pemain hanya boleh memilih pion yang bisa menangkap
        const globalHasCapture = this.hasAvailableCaptureMoves(this.currentPlayer);
        const captureMoves = this.getCaptureMoves(row, col);

        // If forced capture rule is ON, restrict selection to capturing pieces only
        if (this.forcedCapture && globalHasCapture && captureMoves.length === 0) {
            this.selectedPiece = null;
            this.validMoves = [];
            this.captureMoves = [];
            this.playSound('invalid');
            return;
        }

        this.selectedPiece = { row, col };
        // If forcedCapture is active and this piece has captures, show only capture moves
        if (this.forcedCapture && captureMoves.length > 0) {
            this.captureMoves = captureMoves;
            this.validMoves = [];
        } else {
            // Show both capture and normal moves so player can decide
            this.captureMoves = captureMoves;
            this.validMoves = this.getValidMoves(row, col);
        }
    }

    /**
     * Restart game
     */
    restart() {
        this.board = new Board();
        this.currentPlayer = PLAYERS.PLAYER1;
        this.selectedPiece = null;
        this.validMoves = [];
        this.captureMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.history = [];
    }

    /**
     * Play sound effect
     */
    playSound(type) {
        if (!this.soundEnabled) return;

        // Menggunakan Web Audio API untuk create sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (type === 'move') {
            // Nada rendah untuk gerakan normal
            this.playTone(audioContext, 400, 0.1, 0.1);
        } else if (type === 'capture') {
            // Dua nada untuk capture
            this.playTone(audioContext, 600, 0.1, 0.1);
            setTimeout(() => {
                this.playTone(audioContext, 800, 0.1, 0.1);
            }, 100);
        } else if (type === 'invalid') {
            // Nada tinggi untuk langkah invalid
            this.playTone(audioContext, 200, 0.1, 0.05);
        }
    }

    /**
     * Helper untuk play tone
     */
    playTone(audioContext, frequency, duration, volume = 0.1) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
}

// ============================================
// CLASS CANVAS RENDERER
// ============================================
class CanvasRenderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;

        // Set canvas size
        this.canvas.width = CANVAS_SIZE;
        this.canvas.height = CANVAS_SIZE;

        // Responsive canvas
        this.updateCanvasSize();
        window.addEventListener('resize', () => this.updateCanvasSize());
    }

    /**
     * Update canvas size untuk responsive
     */
    updateCanvasSize() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 10;
        const scale = Math.min(1, maxWidth / CANVAS_SIZE);
        
        this.canvas.style.width = (CANVAS_SIZE * scale) + 'px';
        this.canvas.style.height = (CANVAS_SIZE * scale) + 'px';
    }

    /**
     * Draw entire game board
     */
    render() {
        // Draw background
        this.drawBackground();

        // Draw grid and points
        this.drawGrid();

        // Draw valid moves
        this.drawValidMoves();

        // Draw capture moves
        this.drawCaptureMoves();

        // Draw selected piece highlight
        if (this.game.selectedPiece) {
            this.drawSelectedHighlight();
        }

        // Draw pieces
        this.drawPieces();
    }

    /**
     * Draw background dengan texture lantai sekolah
     */
    drawBackground() {
        // Background color
        this.ctx.fillStyle = COLORS.BOARD_BG;
        this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Texture/pattern untuk efek lantai
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if ((i + j) % 2 === 1) {
                    this.ctx.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
    }

    /**
     * Draw grid garis dan titik (seperti garis kapur putih)
     */
    drawGrid() {
        const lineWidth = 2.5;
        this.ctx.strokeStyle = COLORS.GRID_LINE;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Horizontal lines dengan sedikit hand-drawn effect
        for (let i = 0; i < BOARD_SIZE; i++) {
            const y = i * CELL_SIZE + CELL_SIZE / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(CELL_SIZE / 2, y);
            this.ctx.lineTo(CANVAS_SIZE - CELL_SIZE / 2, y);
            this.ctx.stroke();
        }

        // Vertical lines
        for (let i = 0; i < BOARD_SIZE; i++) {
            const x = i * CELL_SIZE + CELL_SIZE / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, CELL_SIZE / 2);
            this.ctx.lineTo(x, CANVAS_SIZE - CELL_SIZE / 2);
            this.ctx.stroke();
        }

        // Diagonal lines (untuk koneksi diagonal)
        // Top-left to bottom-right diagonals
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE - 1; j++) {
                const x1 = i * CELL_SIZE + CELL_SIZE / 2;
                const y1 = j * CELL_SIZE + CELL_SIZE / 2;
                const x2 = (i + 1) * CELL_SIZE + CELL_SIZE / 2;
                const y2 = (j + 1) * CELL_SIZE + CELL_SIZE / 2;

                if (x2 < CANVAS_SIZE && y2 < CANVAS_SIZE) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            }
        }

        // Top-right to bottom-left diagonals
        for (let i = 1; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE - 1; j++) {
                const x1 = i * CELL_SIZE + CELL_SIZE / 2;
                const y1 = j * CELL_SIZE + CELL_SIZE / 2;
                const x2 = (i - 1) * CELL_SIZE + CELL_SIZE / 2;
                const y2 = (j + 1) * CELL_SIZE + CELL_SIZE / 2;

                if (x2 >= 0 && y2 < CANVAS_SIZE) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            }
        }

        // Draw grid points (titik interseksi)
        this.ctx.fillStyle = COLORS.GRID_POINT;
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                const x = i * CELL_SIZE + CELL_SIZE / 2;
                const y = j * CELL_SIZE + CELL_SIZE / 2;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    /**
     * Draw valid moves untuk pion yang dipilih
     */
    drawValidMoves() {
        this.ctx.fillStyle = COLORS.VALID_MOVE;
        for (let move of this.game.validMoves) {
            const x = move.col * CELL_SIZE + CELL_SIZE / 2;
            const y = move.row * CELL_SIZE + CELL_SIZE / 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, CELL_SIZE * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Draw capture moves dengan warna berbeda
     */
    drawCaptureMoves() {
        this.ctx.fillStyle = COLORS.CAPTURE_MOVE;
        for (let move of this.game.captureMoves) {
            const x = move.col * CELL_SIZE + CELL_SIZE / 2;
            const y = move.row * CELL_SIZE + CELL_SIZE / 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, CELL_SIZE * 0.35, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw highlight dengan border
            this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    /**
     * Draw highlight untuk pion yang dipilih
     */
    drawSelectedHighlight() {
        const x = this.game.selectedPiece.col * CELL_SIZE + CELL_SIZE / 2;
        const y = this.game.selectedPiece.row * CELL_SIZE + CELL_SIZE / 2;

        this.ctx.strokeStyle = COLORS.SELECTED;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(x, y, CELL_SIZE * 0.45, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /**
     * Draw semua pion di board
     */
    drawPieces() {
        for (let piece of this.game.board.pieces) {
            if (!piece.captured) {
                this.drawPiece(piece);
            }
        }
    }

    /**
     * Draw satu pion dengan shadow effect
     */
    drawPiece(piece) {
        const x = piece.col * CELL_SIZE + CELL_SIZE / 2;
        const y = piece.row * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE * 0.35;

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.beginPath();
        this.ctx.arc(x + 3, y + 4, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Main piece color
        if (piece.player === PLAYERS.PLAYER1) {
            this.ctx.fillStyle = COLORS.PIECE_P1;
            this.ctx.shadowColor = COLORS.PIECE_P1_SHADOW;
        } else {
            this.ctx.fillStyle = COLORS.PIECE_P2;
            this.ctx.shadowColor = COLORS.PIECE_P2_SHADOW;
        }

        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 3;

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Reset shadow
        this.ctx.shadowColor = 'transparent';

        // Outline
        this.ctx.strokeStyle = COLORS.PIECE_OUTLINE;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Highlight reflection
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Get grid position dari mouse event
     */
    getGridPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const scaleY = CANVAS_SIZE / rect.height;

        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Convert ke grid coordinates
        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);

        // Adjust untuk offset (titik di tengah cell)
        const cellX = x % CELL_SIZE;
        const cellY = y % CELL_SIZE;

        const tolerance = CELL_SIZE * 0.25;
        const midX = CELL_SIZE / 2;
        const midY = CELL_SIZE / 2;

        // Check jika click di area titik
        const distToCenter = Math.sqrt(Math.pow(cellX - midX, 2) + Math.pow(cellY - midY, 2));

        if (distToCenter <= tolerance || 
            (cellX > CELL_SIZE * 0.3 && cellX < CELL_SIZE * 0.7 && cellY > CELL_SIZE * 0.3 && cellY < CELL_SIZE * 0.7)) {
            return { row, col, valid: true };
        }

        return { row, col, valid: false };
    }
}

// ============================================
// MAIN GAME INITIALIZATION
// ============================================
let game;
let renderer;

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    game = new Game();
    renderer = new CanvasRenderer(canvas, game);

    // Initial render
    renderer.render();

    // Canvas click event
    canvas.addEventListener('click', handleCanvasClick);

    // Button events
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('modal-restart-btn').addEventListener('click', restartGame);

    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
    // Undo button
    document.getElementById('undo-btn').addEventListener('click', () => {
        game.undoMove();
    });
    document.getElementById('forced-toggle').addEventListener('click', () => {
        game.forcedCapture = !game.forcedCapture;
        const btn = document.getElementById('forced-toggle');
        btn.textContent = `Wajib Makan: ${game.forcedCapture ? 'ON' : 'OFF'}`;
    });
});

/**
 * Handle click pada canvas
 */
function handleCanvasClick(event) {
    if (game.gameOver) return;

    // Jika AI sedang berpikir atau giliran AI, jangan terima input
    if (game.aiThinking || (game.aiEnabled && game.currentPlayer !== PLAYERS.PLAYER1)) return;

    const pos = renderer.getGridPosition(event);
    if (!pos.valid) return;

    const { row, col } = pos;

    // Jika ada pion yang sudah dipilih
    if (game.selectedPiece) {
        // Check jika click pada pion yang sama (deselect)
        if (game.selectedPiece.row === row && game.selectedPiece.col === col) {
            game.selectedPiece = null;
            game.validMoves = [];
            game.captureMoves = [];
            renderer.render();
            return;
        }

        // Check jika click pada valid move
        const moveFound = game.validMoves.find(m => m.row === row && m.col === col);
        const captureFound = game.captureMoves.find(m => m.row === row && m.col === col);

        if (moveFound || captureFound) {
            const result = game.performMove(game.selectedPiece.row, game.selectedPiece.col, row, col);
            if (result.success) {
                if (!result.multiCapture) {
                    // Check winner
                    showWinnerIfExists();
                }
            } else {
                game.playSound('invalid');
            }
        } else {
            // Select pion baru
            game.selectPiece(row, col);
        }
    } else {
        // Select pion pertama
        game.selectPiece(row, col);
    }

    renderer.render();
}

/**
 * Restart game
 */
function restartGame() {
    game.stopAITimer();
    game.restart();
    document.getElementById('winner-modal').classList.add('hidden');
    renderer.render();
    updateUI();
}

/**
 * Toggle sound
 */
function toggleSound() {
    game.soundEnabled = !game.soundEnabled;
    const btn = document.getElementById('sound-toggle');
    btn.textContent = game.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
}

/**
 * Update UI (turn indicator, piece count)
 */
function updateUI() {
    const turnText = game.currentPlayer === PLAYERS.PLAYER1 ? 'Pemain 1' : (game.aiEnabled ? 'Pemain 2 (Komputer)' : 'Pemain 2');
    const thinking = game.aiThinking && game.currentPlayer === PLAYERS.PLAYER2 ? ' — berpikir...' : '';
    document.getElementById('turn-indicator').textContent = `Giliran: ${turnText}${thinking}`;
    
    document.getElementById('player1-pieces').textContent = 
        game.board.getPieceCount(PLAYERS.PLAYER1);
    
    document.getElementById('player2-pieces').textContent = 
        game.board.getPieceCount(PLAYERS.PLAYER2);
    
    const undoButton = document.getElementById('undo-btn');
    if (undoButton) {
        undoButton.disabled = game.history.length === 0 || game.aiThinking;
    }
}

/**
 * Show winner modal jika ada pemenang
 */
function showWinnerIfExists() {
    const winner = game.checkWinner();
    if (winner) {
        game.gameOver = true;
        const modal = document.getElementById('winner-modal');
        const winnerText = document.getElementById('winner-text');
        const winnerMessage = document.getElementById('winner-message');

        winnerText.textContent = `Pemain ${winner === PLAYERS.PLAYER1 ? '1' : '2'} Menang! 🎉`;
        winnerMessage.textContent = winner === PLAYERS.PLAYER1 
            ? 'Pemain 1 (Abu-abu) telah memenangkan permainan. Selamat!'
            : 'Pemain 2 (Coklat) telah memenangkan permainan. Selamat!';

        modal.classList.remove('hidden');
        game.playSound('capture');
    }
}

/**
 * Render loop
 */
function gameLoop() {
    renderer.render();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
