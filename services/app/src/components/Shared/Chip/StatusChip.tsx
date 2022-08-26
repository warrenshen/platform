import { Chip, Dot, Text } from "components/Shared/Chip/CustomStyles";

interface Props {
  color: string;
  text: string;
}

export default function StatusChip({ color, text }: Props) {
  return (
    <Chip>
      <Dot $dotColor={color}></Dot>
      <Text>{text}</Text>
    </Chip>
  );
}
