import {
    EntityCollection,
    EntitySchema,
    EntityValues,
    EnumValueConfig, PropertiesOrBuilder,
    Property,
    PropertyOrBuilder
} from "./models";
import { Navigation, NavigationBuilder } from "../CMSAppProps";

export function buildPropertyFrom<S extends EntitySchema<Key>, Key extends string, T extends any = any>(
    propertyOrBuilder: PropertyOrBuilder<S, Key, T>,
    values: Partial<EntityValues<S, Key>>,
    entityId?: string
): Property<T> {
    if (typeof propertyOrBuilder === "function") {
        return propertyOrBuilder({ values, entityId });
    } else {
        return propertyOrBuilder;
    }
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * navigation objects with all its properties
 * @param navigation
 */
export function buildNavigation(
    navigation: Navigation | NavigationBuilder
): Navigation | NavigationBuilder {
    return navigation;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * collection views with all its properties
 * @param collectionView
 */
export function buildCollection<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>,
    AdditionalKey extends string = string>(
    collectionView: EntityCollection<S, Key, AdditionalKey>
): EntityCollection<S, Key, AdditionalKey> {
    return collectionView;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the schema keys
 * @param schema
 */
export function buildSchema<Key extends string = string>(
    schema: EntitySchema<Key>
): EntitySchema<Key> {
    return schema;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the property keys.
 * @param property
 */
export function buildProperty<S extends EntitySchema<Key>, Key extends string>(
    property: Property<Key>
): Property<Key> {
    return property;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys. It can be useful if you have entity schemas with the
 * same properties
 * @param properties
 */
export function buildProperties<S extends EntitySchema<Key>, Key extends string>(
    properties: PropertiesOrBuilder<S, Key>
): PropertiesOrBuilder<S, Key> {
    return properties;
}

export function buildEnumValueConfig(
    enumValueConfig: EnumValueConfig
): EnumValueConfig {
    return enumValueConfig;
}
