import Methods from "./components/Testing";
import LoginComponent from "./components/LoginComponent";
import SignupComponent from "./components/SignupComponent";
export const routes= {
    project_detail: {
        component:Task,
        query:{table:"trip",filter:{},fields:{}}
    },
    resources:{
        component:Resource,
        query:{table:"trip",filter:{},fields:{}}
    },
    projects:{
        component:Project,
        query:{table:"trip",filter:{},fields:{}}
    },
    tasks:{
        component:Task,
        query:{table:"trip",filter:{},fields:{}}
    },
    trip:{
        component:Progress,
        query:{table:"trip",filter:{},fields:{}}
    },
    login:{
        component:LoginComponent
    },
    signup:{
        component:SignupComponent
    }
}


let {Project,Progress,Task,Login,Resource,External}=Methods;
