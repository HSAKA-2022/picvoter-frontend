import type {Component} from "solid-js";
import {SwipeImage} from "./components/SwipeImage";
import {createResource} from "solid-js";


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
    //console.dir(info)
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

function fillBuffer(update: number, info: { value?: Array<number> }) {
    const existing = (info?.value ?? [])?.filter((it) => it !== update)
    const degenerate = 5 - (existing.length ?? 0)
    const highest = existing.reduce((acc, it) => Math.max(acc, it), 0) ?? 0
    debugger
    return [
        ...(existing ?? []),
        ...[... new Array(degenerate)].map((_, index) => highest + index + 1),
    ]

}
const [buffer, { mutate: mutateBuffer ,refetch: refill}] =
    createResource(fillBuffer);


async function onVote(id:string, vote: boolean) {

    try {
        await votePicture(id, vote)
    } catch (e) {
        console.log("error woops")
    }

    mutatePictures((info) => {
        info?.shift()
        console.log("info",info)
        const newPictures = refetchPictures()
        console.log("newPicture", newPictures)

        return info?.slice(1) 
    })

}

function removePicture(id: number) {
    console.log("removing", id)
    const withRemoved = buffer().filter((it) => it !== id)
    mutateBuffer(withRemoved)
    console.dir(buffer())
    refill(id)
}


const App: Component = () => {
    return (
        <div style={{
            width: "100vw",
            height: "100vw",
        }}>
            {buffer()?.reverse()?.map((id) => (
                <SwipeImage
                    src={pic.url}
                    onRemove={() => removePicture(id)}
                    key={id}
                />
            ))}
        </div>
    );
};

export default App;
