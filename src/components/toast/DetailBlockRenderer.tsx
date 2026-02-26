import React from "react";
import type { DetailBlock } from "../../types";
import { DetailBlockText } from "./DetailBlockText";
import { DetailBlockTaskList } from "./DetailBlockTaskList";
import { DetailBlockStats } from "./DetailBlockStats";
import { DetailBlockKeyValue } from "./DetailBlockKeyValue";

export const DetailBlockRenderer: React.FC<{ block: DetailBlock }> = ({
  block,
}) => {
  switch (block.type) {
    case "text":
      return <DetailBlockText content={block.content} />;
    case "task-list":
      return <DetailBlockTaskList tasks={block.tasks} label={block.label} />;
    case "stats":
      return <DetailBlockStats data={block.data} />;
    case "key-value":
      return <DetailBlockKeyValue entries={block.entries} />;
  }
};
