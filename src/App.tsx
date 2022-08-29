import { Component, createMemo, createSignal, For } from "solid-js"
import { SwipeImage } from "./components/SwipeImage"
import { BUFFER_SIZE, VOTE_THRESHOLD } from "./util"

const [activeIndex, setActiveIndex] = createSignal(0)
const [buffers, setBuffers] = createSignal<HTMLImageElement[]>([])

const App: Component = () => {
  let upvoteOverlay: HTMLDivElement | null = null
  let downvoteOverlay: HTMLDivElement | null = null

  return (
    <>
      <div class="fixed w-full h-screen z-50 flex pointer-events-none">
        <div
          style={{ transition: "opacity 0.15s ease-in-out" }}
          class="flex-1 h-full bg-red-400 flex items-end justify-start pl-6 pb-6 text-5xl opacity-0"
          ref={r => {
            downvoteOverlay = r
          }}
        >
          👎
        </div>

        <div
          style={{ transition: "opacity 0.15s ease-in-out" }}
          class="flex-1 h-full bg-green-400 flex items-end justify-end pr-6 pb-6 text-5xl opacity-0"
          ref={r => {
            upvoteOverlay = r
          }}
        >
          👍
        </div>
      </div>

      <For each={[...new Array(BUFFER_SIZE).keys()]}>
        {index => {
          const currentIndex = createMemo(
            () => (index + BUFFER_SIZE - activeIndex()) % BUFFER_SIZE
          )

          const backBuffer = createMemo(
            () => buffers()[(activeIndex() + 1) % BUFFER_SIZE]
          )

          return (
            <SwipeImage
              onExited={() => {
                backBuffer().style.transition = ``
                backBuffer().style.transform = ``
                backBuffer().style.opacity = ``

                setActiveIndex(prev => (prev + 1) % BUFFER_SIZE)

                if (!upvoteOverlay || !downvoteOverlay) return
                upvoteOverlay.style.opacity = `0`
                downvoteOverlay.style.opacity = `0`
              }}
              onCancel={() => {
                if (!upvoteOverlay || !downvoteOverlay) return
                upvoteOverlay.style.opacity = `0`
                downvoteOverlay.style.opacity = `0`
              }}
              onExiting={value => {
                backBuffer().style.transition = `opacity,transform 0.15s ease-out`
                backBuffer().style.transform = `scale3d(1, 1, 1)`
                backBuffer().style.opacity = `1`

                if (!upvoteOverlay || !downvoteOverlay) return
                if (value === 1) {
                  upvoteOverlay.style.opacity = `1`
                  downvoteOverlay.style.opacity = `0`
                } else if (value === -1) {
                  downvoteOverlay.style.opacity = `1`
                  upvoteOverlay.style.opacity = `0`
                }
              }}
              onDrag={(percentMoved, absMoved) => {
                const t = 0.7 + 0.25 * absMoved
                const o = 0.9 * absMoved

                backBuffer().style.transform = `scale3d(${t}, ${t}, 1.0)`
                backBuffer().style.opacity = `${o}`

                if (!upvoteOverlay || !downvoteOverlay) return
                if (percentMoved > VOTE_THRESHOLD) {
                  upvoteOverlay.style.opacity = `0.6`
                  downvoteOverlay.style.opacity = `0`
                } else if (percentMoved < VOTE_THRESHOLD * -1) {
                  downvoteOverlay.style.opacity = `0.6`
                  upvoteOverlay.style.opacity = `0`
                } else {
                  upvoteOverlay.style.opacity = `0`
                  downvoteOverlay.style.opacity = `0`
                }
              }}
              index={currentIndex()}
              ref={ref => setBuffers(prev => [...prev, ref])}
            />
          )
        }}
      </For>
    </>
  )
}

export default App
