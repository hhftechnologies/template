import { IconButton, ResolvedProperty, SettingsIcon, Tooltip } from "@firecms/core";
import React from "react";
import { useCollectionEditorController } from "../useCollectionEditorController";

export function CollectionViewHeaderAction({
                                               propertyKey,
                                               onHover,
                                               property,
                                               fullPath,
                                               parentPathSegments
                                           }: {
    property: ResolvedProperty,
    propertyKey: string,
    onHover: boolean,
    fullPath: string,
    parentPathSegments: string[],
}) {

    const collectionEditorController = useCollectionEditorController();

    return (
        <Tooltip title={"Edit"}>
            <IconButton
                className={onHover ? "bg-white dark:bg-gray-950" : "hidden"}
                onClick={() => {
                    collectionEditorController.editProperty({
                        propertyKey,
                        property,
                        editedCollectionPath: fullPath,
                        parentPathSegments
                    });
                }}
                size={"small"}>
                <SettingsIcon size={"small"}/>
            </IconButton>
        </Tooltip>
    )
}
