
export interface IUnit {
    id: number
    index: number
    title: string
}

export interface IChapter {
    id: number
    title: string
    index: number
    units: IUnit[]
}

export interface ISubject {
    code: string
    name: string
}

export interface ISubjectWithChapters {
    code: string
    name: string
    chapters: IChapter[]
}

export interface IUnitInfo {
    chapter: string
    chapterId: number
    unit: string
    unitId: number
}