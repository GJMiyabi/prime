import * as React from "react";

type Props = {
  title: string;
  value: string | undefined;
};

export const ProfileContent: React.FC<Props> = ({ value, title }) => {
  return (
    <div className="flex">
      <p className="pr-[15px]">{title}:</p>
      <div className="cursor-pointer font-semibold">{value}</div>
    </div>
  );
};
