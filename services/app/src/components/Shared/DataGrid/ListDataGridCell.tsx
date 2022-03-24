import { List, ListItem } from "@material-ui/core";

interface Props {
  values: string[];
}

export default function TextDataGridCell({ values }: Props) {
  return (
    <List>
      {values.map((value) => (
        <ListItem>{value}</ListItem>
      ))}
    </List>
  );
}
