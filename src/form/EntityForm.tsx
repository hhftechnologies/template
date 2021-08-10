import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Container,
    createStyles,
    Grid,
    makeStyles,
    Typography
} from "@material-ui/core";
import {
    CMSFormFieldProps,
    Entity,
    EntitySchema,
    EntityStatus,
    EntityValues,
    FormContext,
    Properties,
    Property
} from "../models";
import { Form, Formik, FormikHelpers } from "formik";
import { buildPropertyField, createCustomIdField } from "./form_factory";
import {
    checkUniqueField,
    computeSchemaProperties,
    initEntityValues
} from "../models/firestore";
import { CustomFieldValidator, getYupEntitySchema } from "./validation";
import deepEqual from "deep-equal";
import { ErrorFocus } from "./ErrorFocus";
import { isReadOnly } from "../models/utils";

export const useStyles = makeStyles(theme => createStyles({
    stickyButtons: {
        marginTop: theme.spacing(2),
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(3px)",
        borderTop: "solid 1px #f9f9f9",
        position: "sticky",
        bottom: 0,
        zIndex: 200
    },
    container: {
        height: "100%",
        padding: theme.spacing(4),
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down("sm")]: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(3),
            paddingBottom: theme.spacing(3)
        },
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(2),
        }
    },
    button: {
        margin: theme.spacing(1)
    },
    form: {
        marginTop: theme.spacing(2)
    }
}));

interface EntityFormProps<S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>> {

    /**
     * New or existing status
     */
    status: EntityStatus;

    /**
     * Path of the collection this entity is located
     */
    collectionPath: string;

    /**
     * Schema of the entity this form represents
     */
    schema: S;

    /**
     * The updated entity is passed from the parent component when the underlying data
     * has changed in Firestore
     */
    entity?: Entity<S, Key>;
    containerRef: React.RefObject<HTMLDivElement>;

    /**
     * The callback function called when Save is clicked and validation is correct
     */
    onEntitySave(schema: S, collectionPath: string, id: string | undefined, values: EntityValues<S, Key>): Promise<void>;

    /**
     * The callback function called when discard is clicked
     */
    onDiscard(): void;

    /**
     * The callback function when the form original values have been modified
     */
    onModified(dirty: boolean): void;

    /**
     * The callback function when the form original values have been modified
     */
    onValuesChanged(values?:EntityValues<S, Key>): void;

}

function EntityForm<S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>>({
                                                                                                                  status,
                                                                                                                  collectionPath,
                                                                                                                  schema,
                                                                                                                  entity,
                                                                                                                  onEntitySave,
                                                                                                                  onDiscard,
                                                                                                                  onModified,
                                                                                                                  containerRef,
                                                                                                                  onValuesChanged
                                                                                                              }: EntityFormProps<S, Key>) {

    const classes = useStyles();

    /**
     * Base values are the ones this view is initialized from, we use them to
     * compare them with underlying changes in Firestore
     */
    let baseFirestoreValues: EntityValues<S, Key>;
    if ((status === "existing" || status === "copy") && entity) {
        baseFirestoreValues = entity.values ?? {};
    } else if (status === "new") {
        baseFirestoreValues = initEntityValues(schema, collectionPath);
    } else {
        throw new Error("Form configured wrong");
    }

    const [customId, setCustomId] = React.useState<string | undefined>(undefined);
    const [customIdError, setCustomIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<any>();

    const initialValuesRef = React.useRef<EntityValues<S, Key>>(entity?.values ?? baseFirestoreValues);
    const initialValues = initialValuesRef.current;
    const [internalValue, setInternalValue] = useState<EntityValues<S, Key> | undefined>(initialValues);

    const mustSetCustomId: boolean = (status === "new" || status === "copy") && !!schema.customId;

    let underlyingChanges: Partial<EntityValues<S, Key>> = useMemo(() => {
        if (initialValues && status === "existing") {
            return Object.keys(schema.properties)
                .map((key) => {
                    const initialValue = (initialValues as any)[key];
                    const latestValue = (baseFirestoreValues as any)[key];
                    if (!deepEqual(initialValue, latestValue)) {
                        return { [key]: latestValue };
                    }
                    return {};
                })
                .reduce((a, b) => ({ ...a, ...b }), {}) as Partial<EntityValues<S, Key>>;
        } else {
            return {};
        }
    }, [initialValues, baseFirestoreValues]);

    function saveValues(values: EntityValues<S, Key>, formikActions: FormikHelpers<EntityValues<S, Key>>) {

        if (mustSetCustomId && !customId) {
            console.error("Missing custom Id");
            setCustomIdError(true);
            formikActions.setSubmitting(false);
            return;
        }

        setSavingError(null);
        setCustomIdError(false);

        let id: string | undefined;
        if (status === "existing") {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
            id = entity.id;
        } else if (status === "new" || status === "copy") {
            if (schema.customId) {
                if (!customId) throw Error("Form misconfiguration when saving, customId should be set");
                id = customId;
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        onEntitySave(schema, collectionPath, id, values)
            .then(_ => {
                initialValuesRef.current = values;
                formikActions.setTouched({});
            })
            .catch(e => {
                console.error(e);
                setSavingError(e);
            })
            .finally(() => {
                formikActions.setSubmitting(false);
            });

    }

    const uniqueFieldValidator: CustomFieldValidator = ({
                                                            name,
                                                            value,
                                                            property
                                                        }) => checkUniqueField(collectionPath, name, value, property, entity?.id);

    const validationSchema = getYupEntitySchema(
        schema.properties,
        internalValue as Partial<EntityValues<S, Key>> ?? {},
        collectionPath,
        uniqueFieldValidator,
        entity?.id);

    function buildButtons(isSubmitting: boolean, modified: boolean) {
        const disabled = isSubmitting || (!modified && status === "existing");
        return (
            <Box textAlign="right">

                {status === "existing" &&
                <Button
                    variant="text"
                    color="primary"
                    disabled={disabled}
                    className={classes.button}
                    type="reset"
                >
                    Discard
                </Button>}

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={disabled}
                    className={classes.button}
                >
                    {status === "existing" && "Save"}
                    {status === "copy" && "Create copy"}
                    {status === "new" && "Create"}
                </Button>

            </Box>
        );
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={saveValues}
            validationSchema={validationSchema}
            validate={(values) => console.debug("Validating", values)}
            onReset={() => onDiscard && onDiscard()}

        >
            {({
                  values,
                  touched,
                  setFieldValue,
                  handleSubmit,
                  isSubmitting,
                  dirty
              }) => {

                const modified = useMemo(() => !deepEqual(baseFirestoreValues, values), [baseFirestoreValues, values]);
                useEffect(() => {
                    onModified(modified);
                    setInternalValue(values);
                    onValuesChanged(values);
                }, [modified, values]);

                if (underlyingChanges && entity) {
                    // we update the form fields from the Firestore data
                    // if they were not touched
                    Object.entries(underlyingChanges).forEach(([key, value]) => {
                        const formValue = (values as any)[key];
                        if (!deepEqual(value, formValue) && !(touched as any)[key]) {
                            console.debug("Updated value from Firestore:", key, value);
                            setFieldValue(key, value !== undefined ? value : null);
                        }
                    });
                }

                const context: FormContext<S, Key> = {
                    entitySchema: schema,
                    entityId: entity?.id,
                    values
                };

                const schemaProperties: Properties<Key> = computeSchemaProperties(schema, collectionPath, entity?.id, values as EntityValues<S, Key>);
                const formFields = (
                    <Grid container spacing={4}>

                        {Object.entries<Property>(schemaProperties).map(([key, property]) => {

                            const underlyingValueHasChanged: boolean =
                                !!underlyingChanges
                                && Object.keys(underlyingChanges).includes(key)
                                && !!(touched as any)[key];

                            const dependsOnOtherProperties = typeof (schema.properties as any)[key] === "function";

                            const disabled = isSubmitting || isReadOnly(property) || !!property.disabled;
                            const cmsFormFieldProps: CMSFormFieldProps<any, any> = {
                                name: key,
                                disabled: disabled,
                                property: property,
                                includeDescription: true,
                                underlyingValueHasChanged: underlyingValueHasChanged,
                                context: context,
                                tableMode: false,
                                partOfArray: false,
                                autoFocus: false,
                                dependsOnOtherProperties: dependsOnOtherProperties
                            };
                            return (
                                <Grid item
                                      xs={12}
                                      id={`form_field_${key}`}
                                      key={`field_${schema.name}_${key}`}>
                                    {buildPropertyField(cmsFormFieldProps)}
                                </Grid>
                            );
                        })}

                    </Grid>
                );

                return (
                    <Container maxWidth={"sm"}
                               className={classes.container}>

                        {createCustomIdField(schema, status, setCustomId, customIdError, entity)}


                        <Form className={classes.form}
                              onSubmit={handleSubmit}
                              noValidate>

                            <Box pt={3}>
                                {formFields}
                            </Box>

                            <div className={classes.stickyButtons}>

                                {savingError &&
                                <Box textAlign="right">
                                    <Typography color={"error"}>
                                        {savingError.message}
                                    </Typography>
                                </Box>}

                                {buildButtons(isSubmitting, modified)}

                            </div>

                        </Form>


                        <ErrorFocus containerRef={containerRef}/>

                    </Container>
                );
            }}
        </Formik>
    );
}

export default React.memo<EntityFormProps<any>>(EntityForm);
