import { Component, createResource, createSignal, Show } from "solid-js"
import Hammer from "hammerjs"
import { BACKEND_URL, getImage, voteImage } from "../api"
import { BUFFER_SIZE, VOTE_THRESHOLD } from "../util"

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
  onExiting: (value: number) => void
  onCancel: () => void
  onDrag: (percentMoved: number, absMoved: number, rawDeltaX: number) => void
  ref: (el: HTMLImageElement) => void
}> = props => {
  const [isExiting, setIsExiting] = createSignal(false)
  const [image, { refetch }] = createResource(getImage)

  const onImageMount = (ref: HTMLImageElement) => {
    const mc = new Hammer(ref)

    mc.on("panstart", () => {
      ref.style.transition = ``
      ref.style.cursor = `grabbing`
    })

    mc.on("panleft panright", ev => {
      ref.style.transform = `translateX(${ev.deltaX}px)`
      const [percentMoved, absMoved] = getMovedValues(ev.deltaX)
      props.onDrag(percentMoved, absMoved, ev.deltaX)
    })

    mc.on("panend", ev => {
      ref.style.transition = `transform 0.1s ease-out`
      const [percentMoved] = getMovedValues(ev.deltaX)

      const imageID = image()?.id
      if (percentMoved > VOTE_THRESHOLD) {
        setIsExiting(true)
        props.onExiting(1)
        ref.style.transform = `translate3d(100%, 0, 0)`
        if (imageID) voteImage(imageID, 1)
      } else if (percentMoved < VOTE_THRESHOLD * -1) {
        setIsExiting(true)
        props.onExiting(-1)
        ref.style.transform = `translate3d(-100%, 0, 0)`
        if (imageID) voteImage(imageID, -1)
      } else {
        ref.style.transform = ``
        props.onCancel()
      }
    })

    props.ref(ref)
  }

  return (
    <Show when={image()}>
      <img
        src={`${BACKEND_URL}/files/${image()?.hash}.jpg`}
        class="h-screen w-full fixed bg-black cursor-grab flex items-center justify-center object-contain"
        style="object-fit: contain"
        classList={{ hidden: props.index > 1 }}
        ref={ref => onImageMount(ref)}
        onTransitionEnd={ev => {
          if (!isExiting()) return

          setIsExiting(false)
          props.onExited()

          setTimeout(() => {
            const el = ev.target as HTMLImageElement
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
