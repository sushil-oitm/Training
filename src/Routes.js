import Methods from "./components/Testing";
let {Project,Progress,Task,Login,Resource,External}=Methods;
export const routes= {
        project_detail: {
            component:Task,
        },
        resources:{
            component:Resource
        },
        projects:{
            component:Project
        },
        tasks:{
            component:Task
        },
        trip:{
            component:Progress,
            query:{table:"trip",filter:{},fields:{}}
        },
        login:{
            component:Login
        }
    }

