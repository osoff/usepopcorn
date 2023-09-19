import { useEffect, useRef } from "react";

export function useKey(key, action) {
  const inputElement = useRef(null);
  useEffect(
    function () {
      function callback(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [key, action]
  );

  return inputElement;
}
