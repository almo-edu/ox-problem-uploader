import { Button, Divider, Input, InputNumber, Switch } from "antd";
import { currentSubjectState } from "atoms";
import {
    examPNGProblemsState,
    useRemoveProblem,
    useResetChoicesIndex,
    useSetProblem,
} from "atoms/pngPhotos";
import { ISource } from "interfaces/source.interface";
import { Box, Text } from "materials";
import { MathJaxOrText } from "materials/MathJaxOrText";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useRecoilValue } from "recoil";
import { gccTextDetection } from "utils/gcc-text-detection";
import { getCroppedImg } from "utils/getCroppedImg";
import { ChoicesEditor } from "./ChoicesEditor";
import { ImageWithCropper } from "./ImageWithCropper";

interface ProblemPreviewProps {
    index: number;
    source: Omit<ISource, "subject">;
}

export const ProblemPreview = ({
    index,
    source: { year, alias },
}: ProblemPreviewProps) => {
    const {
        index: problem_real_index,
        correct_rate,
        photo,
        useImage,
        solution,
        choices,
        score,
    } = useRecoilValue(examPNGProblemsState)[index];
    const currentSubject = useRecoilValue(currentSubjectState);
    const intro = `${year} ${alias} ${currentSubject.name}, ${problem_real_index}번`;

    // remove problem
    const _removeProblem = useRemoveProblem();
    const onRemove = useCallback(() => _removeProblem(index), [index]);
    const [displayLatex, setDisplayLatex] = useState<boolean>(false);

    // @TODO:: Remove
    // const _setUseImage = useSetUseImage()
    // const onChangeUseImage = useCallback((useImage: boolean) => _setUseImage(index, useImage), [index])

    // 선지 종류
    const [isKor, setIsKor] = useState<boolean>(true);

    // 선지 종류 변경 감지
    const {
        resetChoicesIndex,
        addChoice: _addC,
        removeChoice: _removeC,
    } = useResetChoicesIndex();
    useEffect(() => {
        resetChoicesIndex(index, isKor);
    }, [isKor]);
    const addChoice = useCallback(() => _addC(index, isKor), [index, isKor]);
    const removeChoice = useCallback(() => _removeC(index), [index, isKor]);

    // set problem
    const setProblemGetter = useSetProblem();
    const { setSolution, setCorrectRate, setScore } = setProblemGetter(index);

    const [detectedText, setDetectedText] = useState<string>("");
    const onTextDetection = async () => {
        const { url } = await getCroppedImg(photo);
        const text = await gccTextDetection(url);
        setDetectedText(text);
    };
    const onTextChange = ({
        target: { value },
    }: ChangeEvent<HTMLTextAreaElement>) => {
        setDetectedText(value);
    };

    return (
        <>
            <Box>
                <Box flexDirection="column" justifyContent="center">
                    <Text
                        type="D2"
                        align="center"
                        content="[자료 이미지]"
                        marginBottom={20}
                    />
                    <ImageWithCropper index={index} />
                </Box>

                <Box
                    flexDirection="column"
                    paddingHorizontal={32}
                    paddingVertical={16}
                    flex={1}
                >
                    <Box
                        alignItems="flex-end"
                        justifyContent="space-between"
                        marginBottom={14}
                    >
                        <Text bold type="P1" content={intro} />
                        <AiOutlineDelete
                            color="red"
                            size={22}
                            onClick={onRemove}
                        />
                    </Box>

                    <Box alignItems="center" justifyContent="space-between">
                        {/* 선지 종류(한글/숫자) 설정 */}
                        {/* @TODO:: Remove */}
                        {/* <Box alignItems="center">
                        <Text type="P1" content="이미지 사용" marginRight={5} marginBottom={4} />
                        <Switch 
                            checkedChildren="on" 
                            unCheckedChildren="off" 
                            checked={useImage}
                            onChange={onChangeUseImage}
                        />
                    </Box> */}

                        {/* 정답률 */}
                        <Box alignItems="center">
                            <Text
                                type="P1"
                                content="정답률"
                                marginRight={8}
                                marginBottom={4}
                            />
                            <InputNumber
                                placeholder="정답률"
                                style={{ width: 68 }}
                                value={correct_rate || undefined}
                                onChange={setCorrectRate}
                                min={0}
                                max={100}
                            />
                        </Box>

                        {/* 선지 종류(한글/숫자) 설정 */}
                        <Box alignItems="center">
                            <Text
                                type="P1"
                                content="선지 종류"
                                marginRight={5}
                                marginBottom={4}
                            />
                            <Switch
                                checkedChildren="ㄱㄴㄷ"
                                unCheckedChildren="12345"
                                defaultChecked
                                checked={isKor}
                                onChange={setIsKor}
                            />
                        </Box>

                        {/* 문제 점수 */}
                        <Box alignItems="center">
                            <Text
                                type="P1"
                                content="점수"
                                marginRight={5}
                                marginBottom={4}
                            />
                            <InputNumber
                                placeholder="점수"
                                value={score}
                                style={{ width: 50 }}
                                onChange={setScore}
                                min={2}
                                max={3}
                            />
                        </Box>
                    </Box>
                    <Button
                        type="primary"
                        style={{ width: 200, marginTop: 10 }}
                        onClick={() => setDisplayLatex((prev) => !prev)}
                    >
                        {displayLatex
                            ? `공통해설 Latex 가리기`
                            : `공통해설 LaText 확인하기`}
                    </Button>
                    <Box marginVertical={8}>
                        <Input.TextArea
                            placeholder="문제 공통 해설"
                            value={solution}
                            onChange={setSolution}
                        />
                    </Box>
                    {displayLatex && solution ? (
                        <MathJaxOrText content={solution} />
                    ) : (
                        ""
                    )}

                    <Divider />

                    <Button color="primary" onClick={onTextDetection}>
                        현재 선택 이미지에서 텍스트 추출
                    </Button>

                    <Box marginVertical={8}>
                        <Input.TextArea
                            placeholder="텍스트 추출 결과"
                            value={detectedText}
                            onChange={onTextChange}
                            autoSize={{ minRows: 7 }}
                        />
                    </Box>

                    {/* 자주 사용되는 글자들 */}
                    <Text
                        type="D1"
                        content="☆ 자주 사용하는 문자"
                        marginBottom={6}
                    />
                    <Text
                        type="P1"
                        content="㉠ ㉡ ㉢ ㉣ ㉤ ⓐ ⓑ ⓒ ⓓ ⍺ β θ ⍴ 𝒙 𝒚 𝒛"
                        marginBottom={8}
                    />
                    <Text
                        type="P1"
                        content="화학식  $/ce{}$"
                        marginBottom={8}
                    />
                    <Text
                        type="P1"
                        content="분수  $/frac{}{}$"
                        marginBottom={8}
                    />
                </Box>

                <Box flexDirection="column" flex={1}>
                    {/* 선지 편집기 */}
                    <ChoicesEditor index={index} />
                    {/* 선지 추가/삭제 */}
                    <Box justifyContent="flex-end">
                        <Button
                            danger
                            type="primary"
                            onClick={removeChoice}
                            disabled={choices.length <= 3}
                        >
                            {choices.length &&
                                choices[choices.length - 1].index + "번"}{" "}
                            선지 삭제하기
                        </Button>
                        <span style={{ padding: 5 }} />
                        <Button type="primary" onClick={addChoice}>
                            선지 추가하기
                        </Button>
                    </Box>
                </Box>
            </Box>
            <Divider />
        </>
    );
};
