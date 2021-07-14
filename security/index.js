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
        timeTrack: {
            'read:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        }
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
        timeTrack: {
            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        }
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
        timeTrack: {
            'read:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        }
    },
    client: {
        project: {

            'read:own': ['*'],
        },
        task: {
            'read:any': ['*'],

            'read:own': ['*'],
        },
        taskComment: {
            'create:any': ['*'],
            'read:any': ['*'],

            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        },
        timeTrack: {
            'create:own': ['*'],
            'read:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*'],
        }
    },
};

module.exports = new AccessControl(grantsObject);