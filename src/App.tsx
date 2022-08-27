import type {Component} from "solid-js";
import {SwipeImage} from "./components/SwipeImage";
import {createResource} from "solid-js";

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
    await fetch(`${BACKEND_URL}/vote`, {
        method: "POST",
        body: JSON.stringify({
            id,
            value,
        }),
    });
}

async function getPictures(_:unknown, info: { value?: Array<Picture> }) {
    console.log("refetching!")
    console.dir(info)
    const toFetch = 5 - (info?.value?.length ?? 0)
    console.dir(toFetch)
    const fetched = await Promise.all(
        Array(toFetch)
            .fill(0)
            .map(() => getPicture())
    );
    return [
        ...(info?.value ?? []),
        ...fetched.filter((it) => info?.value?.every((pic) => pic.id !== it.id) ?? true),
    ];
}

const [pictures, {mutate: mutatePictures, refetch: refetchPictures}] =
    createResource(getPictures);

async function onNegative(id: string) {
    const [first, ...rest] = pictures() ?? [];
    mutatePictures((info) => {
        return rest
    })
    try {
        await votePicture(id, false);
    } catch (e) {
    }
    refetchPictures({value: rest});
}

async function onPositive(id: string) {
    const [first, ...rest] = pictures() ?? [];
    mutatePictures((info) => {
        const [first, ...rest] = info ?? [];
        return rest
    })
    try {
        await votePicture(id, false);
    } catch (e) { }
    refetchPictures({value: rest});
}

const App: Component = () => {
    return (
        <>
            {pictures()?.map((pic, index) => (
                <SwipeImage
                    src={pic.url}
                    onPositive={() => onPositive(pic.id)}
                    onNegative={() => onNegative(pic.id)}
                    index={index}
                />
            ))}
        </>
    );
};

export default App;
