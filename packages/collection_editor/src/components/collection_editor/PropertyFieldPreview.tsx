import {
    cardClickableMixin,
    cardMixin,
    cardSelectedMixin,
    cn,
    ErrorBoundary,
    FieldConfigBadge,
    FunctionsIcon,
    getFieldConfig,
    isPropertyBuilder,
    Paper,
    Property,
    PropertyOrBuilder,
    RemoveCircleIcon,
    Typography,
    useFireCMSContext
} from "@firecms/core";

import { editableProperty } from "../../utils/entities";

export function PropertyFieldPreview({
                                         property,
                                         onClick,
                                         hasError,
                                         includeName,
                                         includeEditButton,
                                         selected
                                     }: {
    property: Property,
    hasError?: boolean,
    selected?: boolean,
    includeName?: boolean,
    includeEditButton?: boolean;
    onClick?: () => void
}) {

    const { fields } = useFireCMSContext();

    const propertyConfig = getFieldConfig(property, fields);
    const disabled = !editableProperty(property);

    const borderColorClass = hasError
        ? "border-red-500"
        : (selected ? "border-blue-500" : "border-transparent");

    return <ErrorBoundary>
        <div
            onClick={onClick}
            className="flex flex-row w-full cursor-pointer">
            <div className={"m-4"}>
                <FieldConfigBadge propertyConfig={propertyConfig}/>
            </div>
            <Paper
                className={cn(
                    "pl-2 w-full flex flex-row gap-4 items-center",
                    cardMixin,
                    onClick ? cardClickableMixin : "",
                    selected ? cardSelectedMixin : "",
                    "flex-grow p-4 border transition-colors duration-200",
                    borderColorClass
                )}
            >

                <div className="w-full flex flex-col">

                    {includeName &&
                        <ErrorBoundary>
                            <Typography variant="body1"
                                        component="span"
                                        className="flex-grow pr-2">
                                {property.name
                                    ? property.name
                                    : "\u00a0"
                                }
                            </Typography>
                        </ErrorBoundary>}

                    <div className="flex flex-row items-center">
                        <ErrorBoundary>
                            <Typography className="flex-grow pr-2"
                                        variant={includeName ? "body2" : "subtitle1"}
                                        component="span"
                                        color="secondary">
                                {propertyConfig?.name}
                            </Typography>
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                {property.dataType}
                            </Typography>
                        </ErrorBoundary>

                        {disabled && <div
                            className="text-xs h-3 ml-0.5">
                            <RemoveCircleIcon color={"disabled"}/>
                        </div>}
                    </div>
                </div>

                {includeEditButton && <Typography variant={"button"}>
                    EDIT
                </Typography>}

            </Paper>
        </div>
    </ErrorBoundary>
}

export function NonEditablePropertyPreview({
                                               name,
                                               selected,
                                               onClick,
                                               property
                                           }: {
    name: string,
    selected: boolean,
    onClick?: () => void,
    property?: PropertyOrBuilder
}) {

    const { fields } = useFireCMSContext();

    const propertyConfig = !isPropertyBuilder(property) && property ? getFieldConfig(property, fields) : undefined;

    return (
        <div
            onClick={onClick}
            className="flex flex-row w-full cursor-pointer">
            <div className={"relative m-4"}>
                {propertyConfig && <FieldConfigBadge propertyConfig={propertyConfig}/>}
                {!propertyConfig && <div
                    className={"h-8 w-8 p-1 rounded-full shadow text-white bg-gray-500"}>
                    <FunctionsIcon color={"inherit"} size={"medium"}/>
                </div>}
                <RemoveCircleIcon color={"disabled"} size={"small"} className={"absolute -right-2 -top-2"}/>
            </div>
            <Paper
                className={cn(
                    "pl-2 w-full flex flex-row gap-4 items-center",
                    cardMixin,
                    onClick ? cardClickableMixin : "",
                    selected ? cardSelectedMixin : "",
                    "flex-grow p-4 border transition-colors duration-200",
                    selected ? "border-blue-500" : "border-transparent")}
            >

                <div className="w-full flex flex-col">
                    <Typography variant="body1"
                                component="span"
                                className="flex-grow pr-2">
                        {property?.name
                            ? property.name
                            : name
                        }
                    </Typography>

                    <div className="flex flex-row items-center">
                        {propertyConfig && <Typography className="flex-grow pr-2"
                                                    variant={"body2"}
                                                    component="span"
                                                    color="secondary">
                            {propertyConfig?.name}
                        </Typography>}

                        {property && !isPropertyBuilder(property) && <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                {property.dataType}
                            </Typography>
                        </ErrorBoundary>}

                        {property && isPropertyBuilder(property) && <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                This property is defined as a property builder in code
                            </Typography>
                        </ErrorBoundary>}

                        {!property && <ErrorBoundary>
                            <Typography variant="body2"
                                        component="span"
                                        color="disabled">
                                This field is defined as an additional field in code
                            </Typography>
                        </ErrorBoundary>}

                    </div>

                    {/*<div className="flex flex-row text-xs">*/}
                    {/*    <Typography className="flex-grow pr-2"*/}
                    {/*                variant="body2"*/}
                    {/*                component="span"*/}
                    {/*                color="secondary">*/}
                    {/*        This field can only be edited in code*/}
                    {/*    </Typography>*/}
                    {/*</div>*/}
                </div>

            </Paper>
        </div>)
}
