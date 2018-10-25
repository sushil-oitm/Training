import Methods from "./components/Testing";
import LoginComponent from "./components/LoginComponent";
import SignupComponent from "./components/SignupComponent";
let {Project,Progress,Task,Login,Resource,External}=Methods;
export const routes= {
    project_detail: {
        component:Task,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
    resources:{
        component:Resource,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
    projects:{
        component:Project,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
    tasks:{
        component:Task,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
    trip:{
        component:Progress,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
    login:{
        component:LoginComponent
    },
    signup:{
        component:SignupComponent
    }
}



