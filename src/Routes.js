import Methods from "./components/Testing";
import LoginComponent from "./components/LoginComponent";
import SignupComponent from "./components/SignupComponent";
import SimpleMenu from "./components/Menu";
import MList from "./components/MList";
import Table from "./components/Table";
import Trip from "./views/Trip";
import IntegrationDownshift from "./components/MultiSelect"
import Logout from "./components/Logout"
import EmployeeList,{EmployeeForm} from "./views/EmployeeList"
import AccountList,{AccountForm} from "./views/AccountList"
let {Project,Progress,Task,Login,Resource,External}=Methods;
export const routes= {
    list:{
        component:MList,
    },
    project_detail: {
        component:Task,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
  /*  resources:{
        component:Resource,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },*/
    projects:{
        component:Project,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
    menu:{
        component:SimpleMenu
    },
    tasks:{
        component:Task,
        query:{table:"trip",filter:{_id:"5b72602bf4bd7f56575d7fe0"},fields:{_id:1,vehicle:{_id:1}}}
    },
    trip:{
        component:Trip,
        query: {
            table: "trip",
            filter: {"status" : "Active"},
            fields: {
                _id: 1,
                imei: 1,
                status: 1,
                start_time: 1,
                 // vehicle: {_id: 1, name: 1},
                //  customer: {_id: 1, name: 1},
                // transporter: {_id: 1, name: 1}
            }
        }
    },
    resources:{
        component:EmployeeList,
        query: {
            table: "Resource",
              // filter: {name:"aaaa1"},
              // filter: {"" : "Active"},
            fields: {
                _id: 1,
                functional_manager: {_id:1,name:1},
                reportingTo: {_id:1,name:1},
                dob:1,
                employee_code:1,
                employee_status:1,
                name: 1,
                salary_payment_mode: 1,
                official_email_id: 1,
                photo:1,
                bank_accounts:{
                    _id:1,
                    name_in_bank:1,
                    account_number:1,
                    branch:1,
                    account_type_id:1,
                    date_of_opening:1,
                    ifsc_code:1,
                    nominee:{_id:1,name:1}
                }
            }
        }
    },
    accounts:{
        component:AccountList,
        query:{
            table:"Account",
            fields:{
                _id:1,
                name_in_bank:1,
                name:1,
                description:1,
                account_group_type:1

            }
        }
    },
    "account-detail":{
        component:AccountForm,
        query:{
            table:"Account",
            fields:{
                _id:1,
                name_in_bank:1,
                name:1,
                description:1,
                account_group_type:1

            }
        }
    },
    "resources-detail":{
        component:EmployeeForm,
        query: {
            table: "Resource",
            // filter: {"employee_status" : "Active"},
            fields: {
                _id: 1,
                functional_manager: {_id:1,name:1},
                reportingTo: {_id:1,name:1},
                dob:1,
                card_no:1,
                employee_code:1,
                employee_status:1,
                name: 1,
                salary_payment_mode: 1,
                official_email_id: 1,
                photo:1,
                bank_accounts:{
                    _id:1,
                    name_in_bank:1,
                    account_number:1,
                    branch:1,
                    account_type_id:1,
                    date_of_opening:1,
                    ifsc_code:1,
                    nominee:{_id:1,name:1}
                }
            }
        }
    },
    login:{
        component:LoginComponent
    },
    logout:{
      component:Logout
    },
    signup:{
        component:SignupComponent
    },
    multiselect:{
        component:IntegrationDownshift
    }
}
export const ProjectMenu=[
    {
        label:"Employee",
        route:"/resources"
    },
    {
        label:"Account",
        route:"/accounts"
    }

]

