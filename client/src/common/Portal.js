import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

function Portal({ children, selector }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  return mounted ? ReactDOM.createPortal(children, ref.current) : null;
}

export default Portal;
