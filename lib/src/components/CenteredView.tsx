import React from "react";
import clsx from "clsx";
import { Container } from "./Container";

export function CenteredView({
                                 children,
                                 maxWidth,
                                 fullScreen = false,
                                 className,
                             }: {
    children: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
    className?: string;
    fullScreen?: boolean,
}) {

    const container = <><Container className={clsx("m-auto",
        className)}
                                   maxWidth={maxWidth}>
        {children}
    </Container></>;

    if (fullScreen) {
        return <div className={"flex flex-col flex-grow h-screen"}>
            {container}
        </div>
    }

    return container;

}
