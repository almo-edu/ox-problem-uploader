import { Divider, Input, Select, Switch, Tag } from "antd";
import { useGetUnitListofCurrentSubject } from "atoms";
import { examPNGProblemsState, useSetChoices } from "atoms/pngPhotos";
import { Box, Text } from "materials";
import { Fragment } from "react";
import { useRecoilValue } from "recoil";

interface ChoicesEditorProps {
    index: number;
}
const { Option } = Select;

export const ChoicesEditor = ({ index: problem_index }: ChoicesEditorProps) => {
    const { choices, photo, useImage } =
        useRecoilValue(examPNGProblemsState)[problem_index];
    const getSetter = useSetChoices();
    const {
        setQuestion,
        setAnswer,
        setSolution,
        // setPhoto,
        setDescription,
        setUnitinfo,
    } = getSetter(problem_index);

    const units = useGetUnitListofCurrentSubject();

    // @TODO: 전체 Remove
    // const [tempPhoto, setTempPhoto] = useState<IPhoto>(photo)
    // modal을 open하면 현재 선택된 이미지를 전체 이미지로 설정, 그 안에서 crop하도록
    // useEffect(() => {
    //     getCroppedImg(photo)
    //         .then((res) =>
    //              setTempPhoto({
    //                 ...res,
    //                 crop: {
    //                     unit: "%",
    //                     x:0,
    //                     y:0,
    //                     width: 100,
    //                     height: 100
    //                 }
    //             })
    //         )
    // },[photo])

    // modal에서 crop onChange하는 경우
    // const onCropChange = (_:Crop, crop: Crop) => {
    //     setTempPhoto(prev => ({...prev, crop}))
    // }

    // for 세부 이미지
    // const [targetChoiceIndex, setTargetChoiceIndex] = useState<string | null>(null)
    // const [photoModalVisible, setPhotoModalVisible] = useState<boolean>(false)

    // @TODO: REMOVE
    // const openPhotoModal = (choice_index: string) => () => {
    //     // target 선지 설정
    //     setTargetChoiceIndex(choice_index)
    //     setPhotoModalVisible(true)
    // }
    // const cancelPhotoModal = () => {
    //     // target 선지 초기화
    //     setTargetChoiceIndex(null)
    //     setPhotoModalVisible(false)
    // }

    // const okPhotoModal = () => {
    //     if(!targetChoiceIndex)
    //         return;
    //     // 전역 변수에  반영
    //     setPhoto(targetChoiceIndex, tempPhoto)
    //     setTargetChoiceIndex(null)
    //     setPhotoModalVisible(false)
    // }

    // const removePhoto = () => {
    //     if(!targetChoiceIndex)
    //         return;
    //     // 전역 변수에  반영
    //     setPhoto(targetChoiceIndex, undefined)
    //     setTargetChoiceIndex(null)
    //     setPhotoModalVisible(false)
    // }

    return (
        <Box flexDirection="column">
            {choices.map(
                (
                    { index, question, answer, solution, description, photo },
                    i
                ) => (
                    <Fragment key={i}>
                        <Box flexDirection="column" key={"choice" + i}>
                            {/* 단원 선택 */}
                            <Box alignItems="center">
                                <Tag color="geekblue" children={index + "."} />
                                <Text
                                    type="P1"
                                    content="소단원"
                                    marginHorizontal={6}
                                    marginBottom={4}
                                />
                                <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children + "").includes(input)
                                    }
                                    onChange={setUnitinfo(index)}
                                    placeholder="단원을 선택해주세요."
                                    style={{ width: 200 }}
                                >
                                    {units.map((unit) => (
                                        <Option
                                            value={unit.index}
                                            children={unit.title}
                                            key={unit.id}
                                        />
                                    ))}
                                </Select>
                            </Box>

                            {/* 선지 설명 */}
                            <Box marginTop={12} alignItems="center">
                                <Input.TextArea
                                    placeholder="자료 설명"
                                    value={description}
                                    onChange={setDescription(index)}
                                />
                                {/* @TODO: Remove */}
                                {/* <Button 
                            style={{marginLeft: 10}} 
                            onClick={openPhotoModal(index)} 
                            type={photo ? "default" : "primary"}
                            disabled={!useImage}
                        >
                            선지 상세 이미지 {photo ? "수정" : "추가"}
                        </Button> */}
                            </Box>

                            {/* 문제(선지 내용) */}
                            <Box alignItems="center" marginTop={12}>
                                <Input
                                    placeholder="선지 내용"
                                    value={question}
                                    onChange={setQuestion(index)}
                                />
                                <Text
                                    type="P2"
                                    align="right"
                                    content="정답:"
                                    style={{ width: 42 }}
                                    marginHorizontal={12}
                                />
                                <Switch
                                    checkedChildren="O"
                                    unCheckedChildren="X"
                                    checked={answer}
                                    onChange={setAnswer(index)}
                                />
                            </Box>

                            <Box marginTop={12}>
                                <Input.TextArea
                                    placeholder="정답 해설"
                                    autoSize={{ minRows: 2, maxRows: 2 }}
                                    value={solution}
                                    onChange={setSolution(index)}
                                />
                            </Box>
                        </Box>

                        {/* @TODO:: Remove */}
                        {/* <Modal 
                    visible={photoModalVisible} 
                    title={`선지 ${index}번 그림`} 
                    onCancel={cancelPhotoModal} 
                    onOk={okPhotoModal}
                >
                    <ReactCrop src={tempPhoto.url} crop={tempPhoto.crop} onChange={onCropChange} />
                    {choices.find(c => c.index===targetChoiceIndex)?.photo && (
                        <Box justifyContent="flex-end">
                            <Button type="primary" danger onClick={removePhoto}>
                                선지 상세 이미지 삭제
                            </Button>
                        </Box>
                    )}
                </Modal> */}
                        <Divider key={"divider" + i} />
                    </Fragment>
                )
            )}
        </Box>
    );
};
