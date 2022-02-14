import { IoImageOutline } from "react-icons/io5"
import { Button, Modal, Upload, ModalProps } from "antd"
import { RcFile } from "antd/lib/upload"
import { useRecoilState, useRecoilValue } from "recoil"
import { imageUrlsState, problemsState, currentSubjectState } from "atoms"
import { Box, Text } from "materials"
import { UploadRequestOption } from "rc-upload/lib/interface";
import { UploadFile } from "antd/lib/upload/interface"
import { s3UploadFile } from "api/s3/\bs3uploadFile"
import { s3DeleteFile } from "api/s3/\bs3deleteFile"

const ButtonStyle = { marginBottom:12 }
const IconStyle = { marginBottom:-6, marginRight:6, fontSize: 23 }


export const ImageUploader = ({...props}: ModalProps) => {
    const { code, name } = useRecoilValue(currentSubjectState)
    const [imageUrls, setImageUrls] = useRecoilState(imageUrlsState);
    const problems = useRecoilValue(problemsState)

    const addImageUrlMap = (name: string, url: string) => {
        setImageUrls(prev => {
            if(prev.findIndex(item => item.name === name) > -1)
                return prev;
            else 
                return [...prev, {name, url}]
            
        })
    }

    const handleFiles = (file:RcFile, fileList:RcFile[]) => {

        // 파일명에서 확장자 제거
        const fname = file.name.trim().replace(/(.png|.jpg|.jpeg|.gif)$/,'').normalize();
        
        // 사진 관련 문제가 업로드 되었는지 검사
        const problemHasUploaded = problems.map(p => p.filename === fname).some(i => i)
        if(!problemHasUploaded){
            alert(`${file.name}에 대한 문제가 업로드 되지 않았습니다.`)
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
            const targetProblem = problems.find(p => p.filename === fname);
            if(!targetProblem)
                throw Error("해당하는 문제가 없습니다.")
            
            // S3에 저장될 파일 이름
            const s3Filename = targetProblem.isExam ? 
                `${targetProblem.year}_${targetProblem.month}월_${targetProblem.org}_${targetProblem.source}_${name}_no${targetProblem.number}` 
                : 
                `${targetProblem.year}_${targetProblem.org}_${targetProblem.source}_${name}_${targetProblem.number}` 
            const url = await s3UploadFile(file, code, s3Filename)
            addImageUrlMap(fname, url)
            onSuccess && onSuccess(() => {})
            return true;
        } catch(e:any) {
            onError && onError(e)
            return false;
        }
    }

    const onRemove = (file:UploadFile) => {
        setImageUrls(prev => {
            const index = prev.findIndex(item => item.name === file.name);
            s3DeleteFile(prev[index].url)
            if(index > -1){
                return prev.slice(0, index).concat(prev.slice(index+1))
            }
            else return prev;
        });

    }
    return (
        <Modal title="이미지 업로드" {...props} >
            <Box flexDirection="column" marginBottom={15}>
                <Text type="P1" bold size={18} content="문제 csv 파일 업로드를 완료한 후 이미지를 업로드해주세요."/>
                <Text type="P2" content="파일명이 같은 파일은 하나만 업로드 됩니다."/>
            </Box>
            <Upload 
                listType="picture"
                accept="image/*"
                multiple
                beforeUpload={handleFiles}
                customRequest={customRequest}
                onRemove={onRemove}
                showUploadList={{
                    removeIcon: null
                }}
            >
                <Button 
                    style={ButtonStyle} 
                    icon={<IoImageOutline style={IconStyle} />}
                >
                    문제 그림 업로드
                </Button>
            </Upload>
        </Modal>
    )
}