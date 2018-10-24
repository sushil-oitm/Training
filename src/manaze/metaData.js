/**
 * Created by root on 21/4/17.
 */

let fields = {
    resources: [
        {
            "id": "name",
            "label": "Name",
            "type": "string",
            "index": 1,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "dob",
            "label": "DOB",
            "type": "date",
            "index": 2,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "report_to",
            "label": "Report To",
            "type": "fk",
            "index": 3,
            "dataset": "Resource",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "type",
            "label": "Type",
            "type": "select",
            "index": 4,
            "options": ["Parmanent", "Contract"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "status",
            "label": "Status",
            "type": "select",
            "index": 4,
            "options": ["Active", "InActive"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",

        }
    ],
    projects: [
        {
            "id": "name",
            "label": "Name",
            "type": "string",
            "index": 1,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
        },
        {
            "id": "date",
            "label": "Date",
            "type": "date",
            "index": 2,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        }, {
            "id": "parent",
            "label": "Parent",
            "type": "fk",
            "index": 3,
            "dataset": "Project",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "manager",
            "label": "Manager",
            "type": "fk",
            "index": 4,
            "dataset": "Resource",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "priority",
            "label": "Priority",
            "type": "select",
            "index": 5,
            "options": ["Low", "Medium", "High", "Highest"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "status",
            "label": "Status",
            "type": "select",
            "index": 4,
            "options": ["Active", "InActive"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",

        }
    ],
    project_detail: [
        {
            "id": "name",
            "label": "Name",
            "type": "string",
            "index": 1,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
        },
        {
            "id": "date",
            "label": "Date",
            "type": "date",
            "index": 2,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        }, {
            "id": "parent",
            "label": "Parent",
            "type": "fk",
            "index": 3,
            "dataset": "Project",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "manager",
            "label": "Manager",
            "type": "fk",
            "index": 4,
            "dataset": "Resource",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "priority",
            "label": "Priority",
            "type": "select",
            "index": 5,
            "options": ["Low", "Medium", "High", "Highest"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "status",
            "label": "Status",
            "type": "select",
            "index": 4,
            "options": ["Active", "InActive"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",

        }
    ],
    tasks: [
        {
            "id": "name",
            "label": "Name",
            "type": "string",
            "index": 1,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
        },
        {
            "id": "date",
            "label": "Date",
            "type": "date",
            "index": 2,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "project",
            "label": "Project",
            "type": "fk",
            "index": 3,
            "dataset": "Project",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "resource",
            "label": "Resource",
            "type": "fk",
            "index": 4,
            "dataset": "Resource",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "priority",
            "label": "Priority",
            "type": "select",
            "index": 5,
            "options": ["Low", "Medium", "High", "Highest"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "status",
            "label": "Status",
            "type": "select",
            "index": 4,
            "options": ["New", "Active","Completed"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",

        }
    ],
    progress: [
        {
            "id": "name",
            "label": "Name",
            "type": "string",
            "index": 1,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
        },
        {
            "id": "date",
            "label": "Date",
            "type": "date",
            "index": 2,
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "resource",
            "label": "Resource",
            "type": "fk",
            "index": 3,
            "dataset": "Resource",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "task",
            "label": "Task",
            "type": "fk",
            "index": 4,
            "dataset": "Task",
            "display": "name",
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "priority",
            "label": "Priority",
            "type": "select",
            "index": 5,
            "options": ["Low", "Medium", "High", "Highest"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",
            "filter": true
        },
        {
            "id": "status",
            "label": "Status",
            "type": "select",
            "index": 4,
            "options": ["Pending", "Reviewed"],
            "is_edit": true,
            "is_primary": true,
            "width": "200",
            "height": "20px",

        }
    ],
}
let views={
    Resource:[
        {
            view:"active_resource",
            lable:"Acitve",
            dataset:"Resource",
            fields:fields.Resource,
            filter:{status:"Active"}
        },
        {
            view:"inactive_resource",
            lable:"Inacitve",
            fields:fields.Resource,
            dataset:"Resource",
            filter:{status:"InActive"}
        },
        {
            view:"all_resource",
            lable:"All",
            fields:fields.Resource,
            dataset:"Resource",
            filter:{}
        },
        // {
        //     view:"active_project",
        //     lable:"Acitve Project",
        //     dataset:"Project",
        //     fields:fields.Project
        // },
        // {
        //     view:"active_task",
        //     lable:"Acitve Task",
        //     dataset:"Task",
        //     fields:fields.Task
        // }
    ],
    Project:[
        {
            view:"active_project",
            lable:"Acitve",
            dataset:"Project",
            fields:fields.Project,
            filter:{status:"Active"}
        },
        {
            view:"inactive_project",
            dataset:"Project",
            lable:"Completed",
            fields:fields.Project,
            filter:{status:"InActive"}
        } ,
        {
            view:"inactive_project",
            dataset:"Project",
            lable:"All",
            fields:fields.Project
        }
    ],
    Task:[
        {
            view:"active_task",
            lable:"New",
            dataset:"Task",
            fields:fields.Task,
            filter:{status:"New"}
        } ,
        {
            view:"inactive_task",
            lable:"InProgress",
            dataset:"Task",
            fields:fields.Task,
            filter:{status:"Active"}
        },
        {
            view:"inactive_task",
            lable:"Completed",
            dataset:"Task",
            fields:fields.Task,
            filter:{status:"Completed"}
        },
        {
            view:"inactive_task",
            lable:"All",
            dataset:"Task",
            fields:fields.Task,

        }
    ],
    Progress:[
        {
            view:"active_progress",
            lable:"All",
            dataset:"Progress",
            fields:fields.Progress
        } ,
        {
            view:"inactive_progress",
            lable:"Reviewed",
            dataset:"Progress",
            fields:fields.Progress,
            filter:{status:"Reviewed"}
        }
    ]
}

module.exports = {
    fields,
    views
}
