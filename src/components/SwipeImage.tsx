import { Component, createSignal, onMount } from "solid-js";
import Hammer from "hammerjs";

const THRESHOLD = 200;
export const SwipeImage: Component<{
    src: string;
    onVote: (vote: boolean) => void;
    index: number;
}> = ({ src, onVote, index }) => {
    let imageRef: HTMLImageElement | undefined;
    const [xOffset, setXOffset] = createSignal(0);
    const [yOffset, setYOffset] = createSignal(0);
    onMount(() => {
        const mc = new Hammer(imageRef);
        mc.on("panleft panright panend", function (ev) {
            if (ev.type === "panend") {
                setXOffset(0);
                setYOffset(0);
                if (ev.deltaX > THRESHOLD) {
                    console.log("up")
                    onVote(true)
                }

                if (ev.deltaX < -THRESHOLD) {
                    console.log("down")
                    onVote(false)
                }

                return;
            }

            setXOffset(-ev.deltaX);
            setYOffset(ev.deltaY);
        });
    });
    return (
        <div
            ref={imageRef}
            src={src}
            style={{
                width: "20vw",
                height: "20vw",
                transition: "all 0.01s ease",
                display: "flex",
                "justify-content": "center",
                "align-items": "center",

                right: `${xOffset()}px`,
                top: `${yOffset()}px`,
                position: "absolute",
                zIndex: 5 - index,
                background: "white"
            }}
        >{src}</div>
    );
};
