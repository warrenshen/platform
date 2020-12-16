import { PageContext } from "contexts/PageContext";
import { useContext, useEffect } from "react";

function useAppBarTitle(title?: string) {
  const pageContext = useContext(PageContext);
  const setAppBarTitle = pageContext.setAppBarTitle;

  useEffect(() => {
    if (title) {
      setAppBarTitle(title);
    }
  }, [setAppBarTitle, title]);

  return setAppBarTitle;
}

export default useAppBarTitle;
