import { useEffect, useRef, useCallback } from 'react'

function createStockfishWorker() {
  const code = `
    let engine = null;
    let ready = false;

    try {
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');
      if (typeof Stockfish !== 'undefined') {
        engine = Stockfish();
        engine.onmessage = function(event) {
          self.postMessage(event.data || event);
        };
        ready = true;
      }
    } catch(e) {
      self.postMessage('info string Stockfish load failed: ' + e.message);
    }

    self.onmessage = function(e) {
      if (engine && ready) {
        engine.postMessage(e.data);
      }
    };
  `
  const blob = new Blob([code], { type: 'application/javascript' })
  return new Worker(URL.createObjectURL(blob))
}

export function useStockfish() {
  const workerRef  = useRef(null)
  const resolveRef = useRef(null)
  const timerRef   = useRef(null)

  useEffect(() => {
    const worker = createStockfishWorker()
    workerRef.current = worker

    worker.addEventListener('message', (e) => {
      const line = typeof e.data === 'string' ? e.data : ''
      const match = line.match(/^bestmove\s+(\S+)/)
      if (match && resolveRef.current) {
        clearTimeout(timerRef.current)
        const move = match[1] === '(none)' ? null : match[1]
        resolveRef.current(move)
        resolveRef.current = null
      }
    })

    worker.postMessage('uci')
    worker.postMessage('isready')

    return () => {
      clearTimeout(timerRef.current)
      worker.terminate()
    }
  }, [])

  const getBestMove = useCallback((fen, { skillLevel = 10, moveTime = 1000 } = {}) => {
    return new Promise((resolve) => {
      const w = workerRef.current
      if (!w) { resolve(null); return }

      // Hard timeout — if Stockfish doesn't answer, resolve null → random move fallback
      timerRef.current = setTimeout(() => {
        resolveRef.current = null
        resolve(null)
      }, moveTime + 2500)

      resolveRef.current = resolve

      w.postMessage(`setoption name Skill Level value ${Math.min(20, Math.max(0, skillLevel))}`)
      w.postMessage(`position fen ${fen}`)
      w.postMessage(`go movetime ${moveTime}`)
    })
  }, [])

  return { getBestMove }
}
