export const BACKEND_URL = "https://pic-backend.burg.games"

export type Image = {
  id: string
  url: string
}

export const getImage = async (): Promise<Image> => {
  const response = await fetch(`${BACKEND_URL}`)
  const data = await response.json()
  return data
}

export const voteImage = async (id: string, value: number): Promise<void> => {
  await fetch(`${BACKEND_URL}/vote`, {
    method: "POST",
    body: JSON.stringify({ id, value }),
  })
}
