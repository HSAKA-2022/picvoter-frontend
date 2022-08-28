import {
  Component,
  createResource,
  createSignal,
  Show,
} from "solid-js"
import Hammer from "hammerjs"

const THRESHOLD = 200
type Picture = {
  id: string
  url: string
}

let pictureId = 0

async function getPicture(): Promise<Picture> {
  return {
    id: Math.random() + "",
    url: `${pictureId++}`,
  }
  // const response = await fetch(`${BACKEND_URL}/`);
  // const data = await response.json();
  // return data;
}

async function votePicture(id: string, value: boolean): Promise<void> {
  console.log("voting")
  // await fetch(`${BACKEND_URL}/vote`, {
  //     method: "POST",
  //     body: JSON.stringify({
  //         id,
  //         value,
  //     }),
  // });
}

export const SwipeImage: Component = () => {
  const [image] = createResource(getPicture)
  const [voted, setVoted] = createSignal(false)

  const attachImage = (ref: HTMLDivElement) => {
    const mc = new Hammer(ref)

    mc.on("panstart", ev => {
      ref.style.cursor = `grabbing`
    })

    mc.on("panleft panright", ev => {
      ref.style.transition = ``
      ref.style.transform = `translateX(${ev.deltaX}px)`
    })

    mc.on("panend", () => {
      ref.style.transition = `transform 0.1s ease-out`
      ref.style.transform = ``
      ref.style.cursor = ``
    })
  }

  return (
    <>
      <Show when={image() != undefined}>
        <div
          class="w-full h-screen flex justify-center items-center fixed bg-white cursor-grab"
          ref={attachImage}
        >
          {image()?.url}
        </div>
      </Show>
    </>
  )
}
