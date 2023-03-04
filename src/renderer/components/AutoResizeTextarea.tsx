/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
import React from "react";

function AutoResizeTextarea({
  onNewLine,
  ...props
}: {
  onNewLine: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-min grow" ref={wrapperRef}>
      <div
        aria-hidden
        className={["pointer-events-none invisible", props.className].join(" ")}
        placeholder="Write here the description of the project. Try to be as concise as possible, with some objectives so that the features are aligned with the project goals."
      >
        {String(props.defaultValue || props.value)
          ?.split("\n")
          .map((item, _index, array) => (
            <React.Fragment key={item + _index}>
              <span>{item}</span>
              {_index !== array?.length - 1 ? <br /> : null}
            </React.Fragment>
          ))}
      </div>
      <textarea
        {...props}
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            onNewLine?.(e);
          }
        }}
        className={["absolute inset-0 h-full w-full", props.className].join(" ")}
      />
    </div>
  );
}

export default AutoResizeTextarea;
