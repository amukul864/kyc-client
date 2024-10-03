import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./ErrorModal.module.css";
import Button from "../ui/Button";
import errorModalLocale from "@/locale/multi-lingual/components/ErrorModal";
import useLocale from "@/hooks/useLocale";

interface ModalProps {
  error: string[];
  buttonString?: string[];
  isInputAvailable?: boolean;
  isPositive?: boolean;
  errorHander?: any[];
}

const Modal: React.FC<ModalProps> = ({
  error,
  buttonString,
  isInputAvailable,
  errorHander,
  isPositive,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const locale = useLocale(errorModalLocale);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || typeof window === "undefined") {
    return null;
  }

  if (!locale) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.card}>
        {error.map((item, index) => (
          <div
            key={index}
            className={`${styles.item} ${!isPositive && styles.redText}`}
          >
            {item}
          </div>
        ))}
        {isInputAvailable && (
          <>
            <div className={styles.label}>{locale.Values.Input_Label}</div>
            <input
              type="text"
              required
              name="input"
              className={styles.input}
              ref={inputRef}
            />
          </>
        )}
        <div className={styles.flex}>
          {buttonString &&
            buttonString.map(
              (item, index) =>
                errorHander &&
                errorHander[index] && (
                  <Button
                    key={index}
                    className={`${
                      index % 2 === 0
                        ? styles.controlButton
                        : styles.controlButton2
                    }`}
                    onClick={() => {
                      if (isInputAvailable) {
                        errorHander[index](inputRef.current?.value);
                      } else {
                        errorHander[index]();
                      }
                    }}
                  >
                    {item}
                  </Button>
                ),
            )}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") as HTMLElement,
  );
};

export default Modal;
