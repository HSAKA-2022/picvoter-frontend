const BACKEND_URL = "https://localhost:5000"

export type Image = {
  id: string
  url: string
}

let pictureId = 0
export const getImage = async (): Promise<Image> => {
  return {
    id: Math.random() + "",
    url: `${pictureId++}`,
  }

  // const response = await fetch(`${BACKEND_URL}/`);
  // const data = await response.json();
  // return data;
}

export const voteImage = async (id: string, value: boolean): Promise<void> => {
  await fetch(`${BACKEND_URL}/vote`, {
    method: "POST",
    body: JSON.stringify({ id, value }),
  })
}
