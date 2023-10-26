import { deleteField, DocumentSnapshot } from "firebase/firestore";
import {
    CMSType,
    COLLECTION_PATH_SEPARATOR,
    EntityCollection,
    PermissionsBuilder,
    Properties,
    removeFunctions,
    removeUndefined,
    sortProperties,
    stripCollectionPath
} from "@firecms/core";
import {
    EditablePropertiesOrBuilders,
    PersistedCollection,
    removeNonEditableProperties
} from "@firecms/collection_editor";

export function buildCollectionPath(path: string, parentPathSegments?: string[]): string {
    if (!parentPathSegments)
        return stripCollectionPath(path);
    return [...parentPathSegments.map(stripCollectionPath), stripCollectionPath(path)].join(COLLECTION_PATH_SEPARATOR);
}

export function setUndefinedToDelete(data: any): any {
    if (Array.isArray(data)) {
        return data.map(v => setUndefinedToDelete(v));
    } else if (typeof data === "object") {
        return Object.entries(data)
            .map(([key, value]) => ({ [key]: setUndefinedToDelete(value) }))
            .reduce((a, b) => ({ ...a, ...b }), {});
    } else if (data === undefined) {
        return deleteField();
    }
    return data;
}

export const docsToCollectionTree = (docs: DocumentSnapshot[]): PersistedCollection[] => {

    const collectionsMap = docs.map((doc) => {
        const id: string = doc.id;
        const collection = docToCollection(doc);
        return { [id]: collection };
    }).reduce((a, b) => ({ ...a, ...b }), {});

    Object.entries(collectionsMap).forEach(([id, collection]) => {
        if (id.includes(COLLECTION_PATH_SEPARATOR)) {
            const parentId = id.split(COLLECTION_PATH_SEPARATOR).slice(0, -1).join(COLLECTION_PATH_SEPARATOR);
            const parentCollection = collectionsMap[parentId];
            if (parentCollection)
                parentCollection.subcollections = [...(parentCollection.subcollections ?? []), collection];
            delete collectionsMap[id];
        }
    });

    return Object.values(collectionsMap);
}

export const docToCollection = (doc: DocumentSnapshot): PersistedCollection => {
    const data = doc.data();
    if (!data)
        throw Error("Entity collection has not been persisted correctly");
    const propertiesOrder = data.propertiesOrder;
    const properties = data.properties as Properties ?? {};
    const sortedProperties = sortProperties(properties, propertiesOrder);
    return { ...data, properties: sortedProperties } as PersistedCollection;
}

export function prepareCollectionForPersistence<M extends { [Key: string]: CMSType }>(collection: EntityCollection<M>) {
    const properties = setUndefinedToDelete(removeFunctions(removeNonEditableProperties(collection.properties as EditablePropertiesOrBuilders)));
    const newCollection = {
        ...removeUndefined(collection),
        properties
    };
    if (newCollection.alias === "")
        delete newCollection.alias;
    delete newCollection.permissions;
    delete newCollection.views;
    delete newCollection.additionalFields;
    delete newCollection.callbacks;
    delete newCollection.Actions;
    delete newCollection.selectionController;
    delete newCollection.subcollections;
    return newCollection;
}

export const applyPermissionsFunction = (collections: PersistedCollection[], permissionsBuilder?: PermissionsBuilder): PersistedCollection[] => {
    return collections.map(collection => ({
        ...collection,
        permissions: permissionsBuilder
    }))

}