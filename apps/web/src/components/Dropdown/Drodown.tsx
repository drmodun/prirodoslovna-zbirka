"use client";
import React, { use, useEffect, useState } from "react";
import classes from "./Dropdown.module.scss";
import clsx from "clsx";
import { FieldValues, UseFormReturn, set } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  onSelect?: (value: string) => void;
  cancel?: boolean;
  attribute: string;
  form: UseFormReturn<FieldValues>;
  closer?: Function;
  initSelected?: string | number;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  cancel,
  closer,
  form,
  attribute,
  initSelected,
}: DropdownProps) => {
  const { setValue } = form;

  const [searchTerm, setSearchTerm] = useState<string | number>("");
  const [selected, setSelected] = useState<string | number>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>(
    options.find((option) => option.value == initSelected)?.label || "Search"
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setValue(attribute, event.target.value);
    onSelect && onSelect(event.target.value);
  };

  const handleSelect = (value: string, label: string) => {
    setSelected(value);
    setSearchTerm(label);
    setPlaceholder(label);
    onSelect && onSelect(value);
    setVisible(false);
  };

  useEffect(() => {
    setValue(attribute, selected);
  }, [selected]);

  const toggleVisible = () => {
    closer && closer();
    setVisible((prev) => !prev);
  };

  const handleReset = () => {
    setSelected("");
    setSearchTerm("");
    setPlaceholder("Search");
    onSelect && onSelect("");
    setVisible(false);
  };

  const slowHide = () => {
    setTimeout(() => {
      setVisible(false);
    }, 100);
  };

  useEffect(() => {
    setVisible(false);
  }, [cancel]);

  return (
    <div
      className={classes.dropdown}
      onFocus={toggleVisible}
      onBlur={slowHide}
    >
      <div className={clsx(classes.top, visible && classes.active)}>
        <input
          type="text"
          placeholder={placeholder}
          onChange={handleSearch}
          value={searchTerm}
        />
      </div>
      <div className={visible ? classes.menu : classes.hidden}>
        {<li key="empty" onClick={handleReset}></li>}
        {options
          .filter((option) =>
            option.label
              .toLowerCase()
              .includes(searchTerm.toString().toLowerCase())
          )
          .toSpliced(10)
          .map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option.value, option.label)}
            >
              {option.label}
            </li>
          ))}
      </div>
    </div>
  );
};
