// フレームワーク層：折りたたみ可能なカードコンテナUIコンポーネント
import * as React from "react";
import { useCollapsible } from "../../../../_hooks/useCollapsible";

type Props = {
  title: string;
  children?: React.ReactNode;
};

/**
 * 折りたたみ可能なカードコンテナコンポーネント
 * 状態管理はカスタムフックに委譲
 */
export const CollapsibleCardContainer: React.FC<Props> = ({
  title,
  children,
}) => {
  const { isOpen, toggle } = useCollapsible(true);

  return (
    <div className="border rounded shadow-sm ">
      <div
        className="bg-blue-100 py-2 px-[5px] sm:px-6 cursor-pointer font-semibold"
        onClick={toggle}
      >
        {title}
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleCardContainer;
