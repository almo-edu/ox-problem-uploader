import { IProblem } from "interfaces/problem-interface";
import { Box, Text } from "materials";
import { Button, Image as AntdImage } from "antd";
import { useEffect, useState } from "react";
import { ImageEditModal } from "./ImageEditModal";
import { MathJaxOrText } from "materials/MathJaxOrText";

interface ChoiceViewProps {
    problem: IProblem;
    choiceIndex: string;
}

export const ChoiceView = ({ problem, choiceIndex }: ChoiceViewProps) => {
    const choice = problem.choices.find((ch) => ch.index === choiceIndex);

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const open = () => setModalVisible(true);

    const [currentImage, setCurrentImage] = useState<string>(
        choice?.image || problem.image
    );

    useEffect(() => {
        setCurrentImage(choice?.image || problem.image);
    }, [choice?.index, problem.id]);

    if (!choice) return null;

    return (
        <Box flexDirection="column" marginTop={18}>
            <MathJaxOrText
                content={`${problem.number}. ${
                    choice.description || "(자료 설명 없음)"
                }`}
                marginBottom={12}
            />
            <AntdImage src={currentImage} width={400} />
            <Button color="ghost" style={{ marginTop: 16 }} onClick={open}>
                이미지 수정
            </Button>

            <Text
                type="P1"
                bold
                content="선지"
                marginTop={24}
                marginBottom={12}
            />
            <MathJaxOrText content={`${choice.question}`} />

            <Text type="P1" bold content="정답" marginTop={24} />
            <Text content={choice.answer ? "O" : "X"} marginVertical={12} />

            <Text
                type="P1"
                bold
                content="해설(공통)"
                marginTop={24}
                marginBottom={12}
            />
            <MathJaxOrText content={problem.solution || "(없음)"} />

            <Text
                type="P1"
                bold
                content="해설(선지)"
                marginTop={24}
                marginBottom={12}
            />
            <MathJaxOrText content={choice.solution || "(없음)"} />

            <ImageEditModal
                visible={modalVisible}
                setVisible={setModalVisible}
                src={choice?.image || problem.image}
                setCurrentImage={setCurrentImage}
            />
        </Box>
    );
};
