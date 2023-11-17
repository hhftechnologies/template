export {
    useCollectionEditorPlugin
} from "./useCollectionEditorPlugin";

export {
    useCollectionEditorController
} from "./useCollectionEditorController";
export {
    useCollectionsConfigController
} from "./useCollectionsConfigController";

export {
    editableProperty, removeNonEditableProperties
} from "./utils/entities";

export type {
    CollectionsConfigController, DeleteCollectionParams, SaveCollectionParams
} from "./types/config_controller";
export type {
    CollectionEditorController
} from "./types/collection_editor_controller";
export type {
    CollectionEditorPermissions, CollectionEditorPermissionsBuilder
} from "./types/config_permissions";
export type {
    PersistedCollection
} from "./types/persisted_collection";

export type {
    CollectionInference
} from "./types/collection_inference";

export { MissingReferenceWidget } from "./components/MissingReferenceWidget";
export * from "./components/collection_editor/util";