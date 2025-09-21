import * as React from "react";

type Props = {
  title: string;
  children?: React.ReactNode;
};

export const CollapsibleCardContainer: React.FC<Props> = ({
  title,
  children,
}) => {
  const [open, setOpen] = React.useState(true);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <div className="border rounded shadow-sm ">
      <div
        className="bg-blue-100 py-2 px-[5px] sm:px-6 cursor-pointer font-semibold"
        onClick={handleToggle}
      >
        {title}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleCardContainer;
