import React from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { theme } from "../config";

function SelectCustom({ creatable, ...props }) {
  const Component = creatable ? CreatableSelect : Select;

  return (
    <Component
      styles={filterStyles}
      placeholder="-- Choisir --"
      noOptionsMessage={() => "Aucun résultat"}
      formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
      theme={(defaultTheme) => ({
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: theme.main,
          primary25: theme.main25,
          primary50: theme.main50,
          primary75: theme.main75,
        },
      })}
      instanceId={props.name}
      inputId={props.inputId}
      classNamePrefix={props.classNamePrefix}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}
const filterStyles = {
  // control: (styles) => ({ ...styles, borderWidth: 0 }),
  indicatorSeparator: (styles) => ({ ...styles, borderWidth: 0, backgroundColor: "transparent" }),
  menuPortal: (provided) => ({ ...provided, zIndex: 10000 }),
  menu: (provided) => ({ ...provided, zIndex: 10000 }),
};

export default SelectCustom;
