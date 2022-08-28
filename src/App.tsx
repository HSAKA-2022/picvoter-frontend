import { Component, createSignal, For } from "solid-js"
import { SwipeImage } from "./components/SwipeImage"
import { BUFFER_SIZE } from "./util"

const [activeIndex, setActiveIndex] = createSignal(0)

const App: Component = () => (
  <For each={[...new Array(BUFFER_SIZE).keys()]}>
    {index => (
      <SwipeImage
        onExited={() => setActiveIndex(prev => (prev + 1) % BUFFER_SIZE)}
        index={(index + BUFFER_SIZE - activeIndex()) % BUFFER_SIZE}
      />
    )}
  </For>
)

export default App
