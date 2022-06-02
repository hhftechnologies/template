import {
    AuthController,
    EntityCollection,
    Permissions,
    segmentsToStrippedPath,
    User
} from "@camberi/firecms";
import { Role } from "../models/roles";
import { SassUser } from "../models/sass_user";

export const DEFAULT_ROLES: Role[] = [
    {
        id: "admin",
        name: "Admin",
        isAdmin: true
    },
    {
        id: "editor",
        name: "Editor",
        isAdmin: false,
        defaultPermissions: {
            read: true,
            create: true,
            edit: true,
            delete: false
        }
    }
];

const DEFAULT_PERMISSIONS = {
    read: false,
    edit: false,
    create: false,
    delete: false
};

export function resolveSassPermissions<M extends { [Key: string]: any }, UserType extends User>
(collection: EntityCollection<M>,
 authController: AuthController<UserType>,
 paths: string[]): Permissions {

    if (!authController.extra?.roles) {
        return DEFAULT_PERMISSIONS;
    } else {
        const strippedCollectionPath = segmentsToStrippedPath(paths);
        return resolveCollectionPermissions(authController.extra.roles, strippedCollectionPath);
    }
}

export function resolveCollectionPermissions(roles: Role[], path: string): Permissions {
    const basePermissions = {
        read: false,
        create: false,
        edit: false,
        delete: false
    };

    return roles
        .map(role => resolveCollectionRole(role, path))
        .reduce(mergePermissions, basePermissions);
}

function resolveCollectionRole(role: Role, path: string): Permissions {

    const basePermissions = {
        read: role.isAdmin,
        create: role.isAdmin,
        edit: role.isAdmin,
        delete: role.isAdmin
    };
    if (role.collectionPermissions && role.collectionPermissions[path]) {
        return mergePermissions(role.collectionPermissions[path], basePermissions);
    } else if (role.defaultPermissions) {
        return mergePermissions(role.defaultPermissions, basePermissions);
    } else {
        return basePermissions;
    }
}

const mergePermissions = (permA: Permissions, permB: Permissions) => {
    return {
        read: permA.read || permB.read,
        create: permA.create || permB.create,
        edit: permA.edit || permB.edit,
        delete: permA.delete || permB.delete
    };
}

export function getUserRoles(roles: Role[], sassUser: SassUser) {
    return !roles
        ? undefined
        : (sassUser.roles
            ? sassUser.roles
                .map(roleId => roles.find((r) => r.id === roleId))
                .filter(Boolean) as Role[]
            : []);
}
