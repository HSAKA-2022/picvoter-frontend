import {Component, createEffect, createResource, createSignal, onMount, Show} from "solid-js";
import Hammer from "hammerjs";

const THRESHOLD = 200;
const BACKEND_URL = "https://localhost:5000";
type Picture = {
    id: string;
    url: string;
};

let pictureId = 0

async function getPicture(): Promise<Picture> {
    return {
        id: Math.random() + "",
        url: pictureId++,
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


export const SwipeImage: Component<{
    onRemove: () => void;
}> = ({onRemove}) => {
    const [imageRef, setImageRef] = createSignal<HTMLImageElement | undefined>(undefined);
    const [image] = createResource(getPicture);
    const [xOffset, setXOffset] = createSignal(0);
    const [yOffset, setYOffset] = createSignal(0);
    const [hide, setHide] = createSignal(false);

    async function onVote(vote: boolean) {
        setHide(true)
        const img = image()
        if (img == undefined) {
            return
        }
        await votePicture(img.id, vote)
        onRemove()
    }

    createEffect(() => {
        const ref = imageRef();
        if (ref == undefined) {
            return
        }
        const mc = new Hammer(ref);
        mc.on("panleft panright panend", function (ev) {
            if (ev.type === "panend") {
                setXOffset(0);
                setYOffset(0);
                if (ev.deltaX > THRESHOLD) {
                    console.log("up")
                    void onVote(true)
                }

                if (ev.deltaX < -THRESHOLD) {
                    console.log("down")
                    void onVote(false)
                }

                return;
            }

            setXOffset(-ev.deltaX);
            setYOffset(ev.deltaY);
        });
    }, []);
    return (
        <>
            <Show when={image() != undefined}>
                <div
                    ref={setImageRef}
                    src={image()?.url ?? ""}
                    style={{
                        width: "20vw",
                        height: "20vw",
                        transition: "all 0.01s ease",
                        display: "flex",
                        "justify-content": "center",
                        "align-items": "center",
                        cursor: "grab",

                        right: `${xOffset()}px`,
                        top: `${yOffset()}px`,
                        position: "absolute",
                        background: "white"
                    }} >{image()?.url}</div>
            </Show>
        </>
    )
        ;
};
