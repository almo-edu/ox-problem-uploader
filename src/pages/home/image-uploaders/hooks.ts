import Upload, { RcFile } from "antd/lib/upload";
import { currentSubjectState, imageUrlsState, problemsState, useAddImageUrlMap } from "atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { s3UploadFile } from "api/s3/\bs3uploadFile";
import { UploadFile } from "antd/lib/upload/interface";
import { s3DeleteFile } from "api/s3/\bs3deleteFile";
import { ChoiceUploadFeatures } from "interfaces/upload-features.interface";


export const useUploadFiles = () => {
    const { code, name } = useRecoilValue(currentSubjectState)
    const [imageUrls, setImageUrls] = useRecoilState(imageUrlsState);
    const addImageUrlMap = useAddImageUrlMap()
    const problems = useRecoilValue(problemsState)

    const handleFiles = (file:RcFile, fileList:RcFile[]) => {
        // 파일명에서 확장자 제거
        const fname = file.name.trim().replace(/(.png|.jpg|.jpeg|.gif)$/,'').normalize();
        
        // 사진 관련 문제가 업로드 되었는지 검사
        const problemHasUploaded = problems.findIndex(p => p.filename === fname) > -1
        let allChoices:ChoiceUploadFeatures[] = []
        for (const {choices} of problems) {
            allChoices=allChoices.concat(choices)
        }
        const choiceHasUploaded = allChoices.findIndex(c => c.filename === fname) > -1

        if(!problemHasUploaded && !choiceHasUploaded){
            alert(`${file.name}에 대한 문제/선지가 업로드 되지 않았습니다.`)
            return Upload.LIST_IGNORE;
        }

        // 중복 파일 검사
        const uploadedFiles = fileList.map(f => f.name)
        const isDuplicate = uploadedFiles.indexOf(file.name) !== uploadedFiles.lastIndexOf(file.name)
        if(isDuplicate){
            alert(`${file.name}가 중복으로 업로드 되었습니다.`)
            return Upload.LIST_IGNORE;
        }

        // 로컬스토리지 중복 파일 검사
        const uploadedLocalFiles = imageUrls.map(f => f.name)
        const isDuplicateLocal = uploadedLocalFiles.indexOf(fname) > -1
        if(isDuplicateLocal){
            alert(`${file.name}는 이미 업로드 되어있습니다.`)
            return Upload.LIST_IGNORE;
        }

        return true;
    }

    const customRequest = async ({ file, onError, onSuccess, onProgress }:UploadRequestOption) => {
        if(!code || typeof file === "string" || !(file instanceof File))
            return false;
        try{
            // 업로드한 파일 이름
            const fname = file.name.trim().replace(/(.png|.jpg|.jpeg|.gif)$/,'').normalize();
            let targetProblem = problems.find(p => p.filename === fname);
            if(targetProblem){
                // S3에 저장될 파일 이름
                // name: subject.name
                const s3Filename = targetProblem.isExam ? 
                    `${targetProblem.year}/${targetProblem.month}월_${targetProblem.org}_${targetProblem.source}_${name}_no${targetProblem.number}` 
                    : 
                    `${targetProblem.year}/${targetProblem.org}_${targetProblem.source}_${name}_${targetProblem.number}` 
                const url = await s3UploadFile(file, code, s3Filename)
                addImageUrlMap(fname, url)
            } 
            // 이미지명에 해당하는 문제가 없는 경우 선지에 해당하는 이미지가 있는지 탐색
            else {
                let targetChoice:ChoiceUploadFeatures | undefined;
                targetProblem = problems.find(({choices}) => {
                    targetChoice = choices.find(c => c.filename === fname)
                    return Boolean(targetChoice);
                });

                if(!targetProblem || !targetChoice)
                    throw Error("해당하는 문제/선지가 없습니다.")


                // S3에 저장될 파일 이름
                // name: subject.name
                const s3Filename = targetProblem.isExam ? 
                    `${targetProblem.year}/${targetProblem.month}월_${targetProblem.org}_${targetProblem.source}_${name}_no${targetProblem.number}_${targetChoice.index}` 
                    : 
                    `${targetProblem.year}/${targetProblem.org}_${targetProblem.source}_${name}_${targetProblem.number}_${targetChoice.index}` 
                const url = await s3UploadFile(file, code, s3Filename)
                addImageUrlMap(fname, url)
            }
            
            onSuccess && onSuccess(() => {})
            return true;
        } catch(e:any) {
            onError && onError(e)
            return Upload.LIST_IGNORE;
        }
    }

    const remove = (file:UploadFile) => {
        setImageUrls(prev => {
            const index = prev.findIndex(item => item.name === file.name);
            s3DeleteFile(prev[index].url)
            if(index > -1){
                return prev.slice(0, index).concat(prev.slice(index+1))
            }
            else return prev;
        });
    }

    return {
        handleFiles,
        customRequest,
        remove
    }
}

export const useDeleteImage = () => {
    const [imageUrls, setImageUrls] = useRecoilState(imageUrlsState);
    const problems = useRecoilValue(problemsState)
    const filenames = problems.map(p => p.filename).concat(
        // 선지의 파일명
        problems.map(p => p.choices).flat().filter(f => f).map(c => c.filename+"")
    )

    // 그림파일을 등록했으면서 다른 파일이 그림을 공유하는 경우, 그림을 삭제하면 안 됨
    // 그 외의 경우는 삭제 가능
    // hard Delete : 이미지 공유 여부 관계없이 삭제
    const deleteImage = async (filename: string, hardDelete:boolean) => {
        if(!filename)
            return;
        const isImageNeeded = !hardDelete && (
            imageUrls.findIndex(f => f.name === filename) && 
            filenames.indexOf(filename) !== filenames.lastIndexOf(filename)
        )
            
        if(isImageNeeded)
            return;
            
        // name - url map과 s3 상 파일 모두 제거
        const index = imageUrls.findIndex(item => item.name === filename);
        if(index > -1){
            await s3DeleteFile(imageUrls[index].url)
                .then(() => {
                    // 이미지 Url mapping에서 삭제
                    setImageUrls(prev => (
                        prev.slice(0, index)
                            .concat(prev.slice(index+1))
                    ));
                })
        }
    }

    return deleteImage;
}
