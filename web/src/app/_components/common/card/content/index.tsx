import * as React from "react";

type Props = {
  title: string;
  value: string | undefined;
};

export const CardContent: React.FC<Props> = ({ value, title }) => {
  return (
    <div className="flex pl-[15px]">
      <p className="pr-[15px]">{title}:</p>
      <div className="cursor-pointer font-semibold">{value}</div>
    </div>
  );
};
