import { TextProps, Text } from "./Text";
import { MathComponent } from "mathjax-react";
import { Box } from "./Box";

interface MathJaxOrTextProps extends TextProps {}

export const MathJaxOrText = ({ content, ...props }: MathJaxOrTextProps) => {
    const parsedContent = String(content).split("$");

    return (
        <span style={props}>
            {parsedContent.map((str, index) => {
                if (index % 2)
                    return (
                        <MathComponent
                            display={false}
                            tex={String.raw`${str}`}
                        />
                    );
                return str;
            })}
        </span>
    );
};
