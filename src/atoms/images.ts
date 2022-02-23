import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
    storage: sessionStorage,
})

interface ImageNameUrl {
    name: string
    url: string
}

export const imageUrlsState = atom<ImageNameUrl[]>({
    default: [],
    key: 'images/urls',
    effects_UNSTABLE: [ persistAtom ],
})

