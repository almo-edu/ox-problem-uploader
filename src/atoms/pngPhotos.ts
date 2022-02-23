import { ChangeEvent, useCallback } from "react";
import { atom, useSetRecoilState } from "recoil";
import { Crop } from 'react-image-crop';
import produce from "immer";
import { EXAM_ROUTINES } from "data/exam-routines";
import { PNGUploadChoice, PNGUploadProblemFeature } from "interfaces/png-upload-problem-feature.interface";
import { useGetunit } from "./subject";
import { IPhoto } from "interfaces/photo.interface";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist()

export const examPNGProblemsState = atom<PNGUploadProblemFeature[]>({
    key: 'exam/photos/png',
    default: [],
    effects_UNSTABLE: [persistAtom]
})

// 이미지 읽어와서 문제 생성
export const useReadImages = () => {
    const setPhotos = useSetRecoilState(examPNGProblemsState)
    const readImages = useCallback((pageNo: number) => (event:ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        console.log(event)
        const {target: {files: fileList}} = event;
        if(!fileList)
            return;
        if(fileList.length>1){
            alert('모의고사 시험지 png 파일은 한 장만 업로드 가능합니다.')
            return;
        }

        const file = Array.from(fileList)[0];
        const reader = new FileReader();
        reader.onload = () => {
            const url = reader.result as string;
            const img = new Image();
            img.src=url;
            img.onload = function(){
                const {width, height} = img
                setPhotos(prev => {
                    const problems:PNGUploadProblemFeature[] = EXAM_ROUTINES
                        .filter(({page}) => page === pageNo)
                        .map(({page, index, ...crop_props}) => ({
                            index,
                            useImage: true,
                            photo: {
                                url,
                                crop: {
                                    unit: "%",
                                    ...crop_props
                                },
                                width,
                                height
                            },
                            description: "",
                            correct_rate: 0,
                            choices: [],
                        }))
                    return prev.concat(problems).sort((a, b) => a.index - b.index)
                });
            }
        };
        reader.readAsDataURL(file)


        // files.forEach(async (file, pageNo) => {
        //     const reader = new FileReader();
        //     reader.onload = () => {
        //         const url = reader.result as string;
        //         const img = new Image();
        //         img.src=url;
        //         img.onload = function(){
        //             const {width, height} = img
        //             setPhotos(prev => {
        //                 const problems:PNGUploadProblemFeature[] = EXAM_ROUTINES
        //                     .filter(({page}) => page === pageNo)
        //                     .map(({page, index, ...crop_props}) => ({
        //                         index,
        //                         useImage: true,
        //                         photo: {
        //                             url,
        //                             crop: {
        //                                 unit: "%",
        //                                 ...crop_props
        //                             },
        //                             width,
        //                             height
        //                         },
        //                         description: "",
        //                         correct_rate: 0,
        //                         choices: [],
        //                     }))
        //                 return prev.concat(problems).sort((a, b) => a.index - b.index)
        //             });
        //         }
        //     };
        //     reader.readAsDataURL(file)
        // })
    },[])
    return readImages
}

export const useRemoveProblem = () => {
    const setProblem = useSetRecoilState(examPNGProblemsState)
    const removeProblem = (problem_index: number) => {
        if(!window.confirm('문제를 삭제하시겠습니까?\n삭제된 문제는 복구할 수 없습니다.'))
            return;
        setProblem(
            produce(draft => {
                draft.splice(problem_index, 1)
            })
        )
    }
    return removeProblem
}



export const useSetUseImage = () => {
    const setProblem = useSetRecoilState(examPNGProblemsState)
    const setUseImage = (index: number, useImage: boolean) => {
        setProblem(
            produce(draft => {
                draft[index].useImage = useImage
            })
        )
    }
    return setUseImage
}


export const useSetCrop = () => {
    const setProblem = useSetRecoilState(examPNGProblemsState)
    const crop = (index: number, crop:Crop) => {
        setProblem(
            produce(draft => {
                draft[index].photo.crop=crop;
            })
        )
    }
    return crop
}

interface SetProblemProps {
    description?: string
    correct_rate?: number
}

export const useSetProblem = () => {
    const _setProblem = useSetRecoilState(examPNGProblemsState)
    const setProblem = useCallback( (problem_index: number, newData:SetProblemProps) => {
        _setProblem(
            produce(draft => {
                draft[problem_index] = {...draft[problem_index], ...newData}
            })
        )
    },[_setProblem])

    const getSetters = useCallback((problem_index: number) => {
        const setDescription = ({target:{value}}: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                setProblem(problem_index, {description: value})
        const setCorrectRate = (rate:number) => 
                setProblem(problem_index, {correct_rate: rate})
        return {
            setDescription,
            setCorrectRate,
        }
    },[setProblem])
    return getSetters
}

const KOR = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ"]
export const useResetChoices = () => {
    const setProblem = useSetRecoilState(examPNGProblemsState)
    const resetUnitinfo = (problem_index: number, isKor: boolean) => {
        // 선지 최신화
        const newChoices:PNGUploadChoice[] = new Array(isKor ? 3 : 5)
            .fill(0)
            .map((_, i) => ({
                index: isKor ? KOR[i] : i+1+"",
                question: "",
                answer: true,
                solution: "",
                description: "",
                unit: {
                    unitIndex: 1
                }
            }))

        setProblem(
            produce(draft => {
                draft[problem_index].choices = newChoices;
            })
        )
    }
    return resetUnitinfo
}

export const useSetChoices = () => {
    const _setProblem = useSetRecoilState(examPNGProblemsState)
    const getUnitInfo = useGetunit()
    const _setChoices = useCallback((problem_index: number, choice_index: string, newChoices:Partial<PNGUploadChoice>) => {
        _setProblem(
            produce(draft => {
                const chIdx = draft[problem_index].choices.findIndex(ch => ch.index === choice_index)
                if(chIdx === -1)
                    return;
                const ch = draft[problem_index].choices[chIdx]
                draft[problem_index].choices[chIdx] = {...ch, ...newChoices}
            })
        )
    },[_setProblem])



    const getSetters = useCallback((problem_index: number) => {
        const setQuestion = (choice_index: string) =>
             ({target:{value}}: ChangeEvent<HTMLInputElement>) => 
                _setChoices(problem_index, choice_index, {question: value})
        
        const setAnswer = (choice_index: string) => (answer: boolean) => 
                _setChoices(problem_index, choice_index, {answer})
        
        const setSolution = (choice_index: string) =>
             ({target:{value}}: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                _setChoices(problem_index, choice_index, {solution: value})
        
        
        const setPhoto = (choice_index: string, photo:IPhoto | undefined) =>  {
            _setChoices(problem_index, choice_index, {photo})
        }
        
        const setDescription = (choice_index: string) =>
             ({target:{value}}: ChangeEvent<HTMLInputElement>) => 
                _setChoices(problem_index, choice_index, {description: value})

        const setUnitinfo = (choice_index: string) => (unit_index: number) => {
            const unitInfo = getUnitInfo(unit_index)
            _setChoices(problem_index, choice_index, {unit: unitInfo})
        }

        return {
            setQuestion,
            setAnswer,
            setSolution,
            setPhoto,
            setDescription,
            setUnitinfo
        }
    },[_setChoices])
    return getSetters
}