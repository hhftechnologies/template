import React from "react";
import clsx from "clsx";

import { useOutsideAlerter } from "../core";
import { paperMixin } from "../styles";
import { Collapse } from "./Collapse";

export type AutocompleteProps = {
    children: React.ReactNode;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const useAutoComplete = ({ ref }: {
    ref: React.MutableRefObject<HTMLDivElement | null>;
}) => {

    const [autoCompleteOpen, setAutoCompleteOpen] = React.useState(false);
    const [inputFocused, setInputFocused] = React.useState(false);

    // if ref is not focused, close autocomplete
    React.useEffect(() => {
        if (ref.current) {
            ref.current.onfocus = () => {
                setAutoCompleteOpen(true);
                setInputFocused(true);
            }
            ref.current.onblur = () => {
                setInputFocused(false);
            }
        }
    }, [ref]);

    return {
        inputFocused,
        autoCompleteOpen,
        setAutoCompleteOpen
    };
}

export function Autocomplete({
                                 children,
                                 open,
                                 setOpen
                             }: AutocompleteProps) {

    const autocompleteRef = React.useRef<HTMLDivElement>(null);
    useOutsideAlerter(autocompleteRef, () => setOpen(false));

    return <Collapse
        in={open}
        duration={50}
        className={clsx(
            "absolute top-full left-0 right-0",
            "p-2",
            "z-20",
            "w-full")}>
        <div ref={autocompleteRef}
             className={clsx(
                 open ? clsx(paperMixin, "shadow") : "",
                 "bg-gray-100 dark:bg-gray-900 py-2"
             )}>
            {children}
        </div>
    </Collapse>;

}

export type AutocompleteItemProps = {
    children: React.ReactNode,
    onClick?: () => void,
};

export function AutocompleteItem({
                                     children,
                                     onClick
                                 }: AutocompleteItemProps) {

    return (
        <div
            className="flex w-full items-center pr-6 pl-14 h-[48px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClick}>
            {children}
        </div>
    )
}
