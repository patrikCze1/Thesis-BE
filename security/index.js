const AccessControl = require('accesscontrol');

const grantsObject = {
    admin: {
        project: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
        task: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
        client: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
            'delete:any': ['*'],
        },
        taskComment: {
            'create:any': ['*'],
            'read:any': ['*'],
            // 'update:any': ['*'],
            'delete:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
    },
    user: {
        project: {
            'read:own': ['*'],
        },
        task: {
            'read:own': ['*'],
            'update:own': ['solverId', 'status'],
        },
        taskComment: {
            'create:any': ['*'],
            'read:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
    },
    manager: {
        project: {
            'create:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*']
        },
        task: {
            'create:any': ['*'],
            'read:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*']
        },
        taskComment: {
            'create:any': ['*'],
            'read:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
    },
    client: {

    },
};

module.exports = new AccessControl(grantsObject);