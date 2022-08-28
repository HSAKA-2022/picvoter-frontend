import { Component, createResource, createSignal, Show } from "solid-js"
import Hammer from "hammerjs"
import { BACKEND_URL, getImage, voteImage } from "../api"
import { BUFFER_SIZE } from "../util"

const getMovedValues = (deltaX: number) => {
  const screenWidth = document.documentElement.clientWidth
  let percentMoved = (deltaX / screenWidth) * 2
  let absMoved = Math.abs(percentMoved)
  absMoved = absMoved > 1.0 ? 1.0 : Math.floor(absMoved * 100) / 100

  return [percentMoved, absMoved]
}

export const SwipeImage: Component<{
  index: number
  onExited: () => void
  onDrag: (deltaX: number) => void
}> = props => {
  const [color] = createSignal(Math.random() * 255)
  const [isExiting, setIsExiting] = createSignal(false)
  const [image, { refetch }] = createResource(getImage)

  const onImageMount = (ref: HTMLDivElement) => {
    const mc = new Hammer(ref)

    mc.on("panstart", () => {
      ref.style.transition = ``
      ref.style.cursor = `grabbing`
    })

    mc.on("panleft panright", ev => {
      ref.style.transform = `translateX(${ev.deltaX}px)`
    })

    mc.on("panend", ev => {
      ref.style.transition = `transform 0.1s ease-out`
      const [percentMoved] = getMovedValues(ev.deltaX)

      const imageID = image()?.id
      if (percentMoved > 0.8) {
        setIsExiting(true)
        ref.style.transform = `translateX(${document.documentElement.clientWidth}px)`
        if (imageID) voteImage(imageID, 1)
      } else if (percentMoved < -0.8) {
        setIsExiting(true)
        ref.style.transform = `translateX(-${document.documentElement.clientWidth}px)`
        if (imageID) voteImage(imageID, -1)
      } else {
        ref.style.transform = ``
      }
    })
  }

  return (
    <Show when={image()}>
      <img
        src={`${BACKEND_URL}/${image()?.url}.jpg`}
        class="h-screen w-full fixed bg-white cursor-grab flex items-center justify-center"
        ref={ref => onImageMount(ref)}
        onTransitionEnd={ev => {
          if (!isExiting()) return

          setIsExiting(false)
          props.onExited()

          setTimeout(() => {
            const el = ev.target as HTMLDivElement
            el.style.transition = ``
            el.style.transform = ``
            refetch()
          }, 0)
        }}
        style={{
          "z-index": BUFFER_SIZE - props.index,
          "pointer-events": props.index !== 0 ? "none" : "auto",
        }}
      />
    </Show>
  )
}
