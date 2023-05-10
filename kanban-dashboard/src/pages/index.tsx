import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Dashboard } from '../dashboard';
import { Flowchart as FlowchartState, FlowchartData, Course } from '../dashboard/store/types';

export default function DashboardPage() {
  const router = useRouter();

  const [project, setFlowchart] = useState<FlowchartState>( {
    "meta": {
      "id": "2658eced-fd21-446a-8d7c-4896f0d423b3",
      "title": "Computer Science ML/AI (2021 - 2022)",
      "description": "An example project with a basic Kanban setup",
    },
    "data": {
      "entities": {
        "user": {
        },
        "task": {
        },
        "status": {
                  "c41ba2a3-5068-4a8f-b8b0-568ca295ef56": {
                    "id": "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
                    "title": "Fall 1",
                    "taskIds": [
                      
                    ]
                  },
                  "49237786-3411-4ab5-974e-3b0078643bab": {
                    "id": "49237786-3411-4ab5-974e-3b0078643bab",
                    "title": "Winter 1",
                    "taskIds": [
                     
                    ]
                  },
                  "c40bfef2-31c2-4228-a8cc-22b52974fbc7": {
                    "id": "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
                    "title": "Spring 1",
                    "taskIds": [
                      
                    ]
                  },
          
                  "c41ba2a3-5068-4a8f-b8b5-568ca295ef56": {
                    "id": "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
                    "title": "Fall 2",
                    "taskIds": [
                      
                    ]
                  },
                  "49237786-3411-4ab5-9745-3b0078643bab": {
                    "id": "49237786-3411-4ab5-974e-3b0078643bab",
                    "title": "Winter 2",
                    "taskIds": [
                     
                    ]
                  },
                  "c40bfef2-31c2-4228-a8c5-22b52974fbc7": {
                    "id": "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
                    "title": "Spring 2",
                    "taskIds": [
                      
                    ]
                  },
     
                  "c41ba2a3-5068-4a8f-b8b6-568ca295ef56": {
                    "id": "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
                    "title": "Fall 3",
                    "taskIds": [
                      
                    ]
                  },
                  "49237786-3411-4ab5-9746-3b0078643bab": {
                    "id": "49237786-3411-4ab5-974e-3b0078643bab",
                    "title": "Winter 3",
                    "taskIds": [
                     
                    ]
                  },
                  "c40bfef2-31c2-4228-a8c6-22b52974fbc7": {
                    "id": "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
                    "title": "Spring 3",
                    "taskIds": [
                      
                    ]
                  },
   
                  "c41ba2a3-5068-4a8f-b8b7-568ca295ef56": {
                    "id": "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
                    "title": "Fall 4",
                    "taskIds": [
                      
                    ]
                  },
                  "49237786-3411-4ab5-9747-3b0078643bab": {
                    "id": "49237786-3411-4ab5-974e-3b0078643bab",
                    "title": "Winter 4",
                    "taskIds": [
                     
                    ]
                  },
                  "c40bfef2-31c2-4228-a8c7-22b52974fbc7": {
                    "id": "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
                    "title": "Spring 4",
                    "taskIds": [
                      
                    ]
                  },
 
                 
          
                },
        "tag": {},
        "comment": {
         
        }
      },
      "ids": {
        "user": [
         
        ],
        "task": [
          
        ],
        "status": [
          "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
          "49237786-3411-4ab5-974e-3b0078643bab",
          "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
          "c41ba2a3-5068-4a8f-b8b5-568ca295ef56",
          "49237786-3411-4ab5-9745-3b0078643bab",
          "c40bfef2-31c2-4228-a8c5-22b52974fbc7",
          "c41ba2a3-5068-4a8f-b8b6-568ca295ef56",
          "49237786-3411-4ab5-9746-3b0078643bab",
          "c40bfef2-31c2-4228-a8c6-22b52974fbc7",
          "c41ba2a3-5068-4a8f-b8b7-568ca295ef56",
          "49237786-3411-4ab5-9747-3b0078643bab",
          "c40bfef2-31c2-4228-a8c7-22b52974fbc7",

         
        ],
        "tag": [],
        "comment": [
  
        ]
      }
    }
  });
  
 

  //turn this into a promise

  const updateFlowchartData = useCallback(async (projectData: FlowchartData) => {
    setFlowchart(prevFlowchart => ({
      ...prevFlowchart,
      data: projectData,
    }));
  }, []);

  // useEffect(() => {
  //   const courses = [] as Course[]
  //   setFlowchart(prevFlowchart => {
  //     const newFlowchart = prevFlowchart
  //     const task_record = {} as Record<string, Course>
  //     newFlowchart.data.ids.task = courses.map(course => {
  //       task_record[course.id] = course
  //       return course.id
  //     })
  //     newFlowchart.data.entities.task = task_record
  //     return newFlowchart
  //   }
      
  //   );
  // })
  


  return (
    <Dashboard
      state={project.data}
      updateFlowchartData={updateFlowchartData}
      title={project.meta.title}
      projectsUrlPath="/"
    />
  );
}

  // const [project, setFlowchart] = useState<FlowchartState>( {
  //   "meta": {
  //     "id": "2658eced-fd21-446a-8d7c-4896f0d423b3",
  //     "title": "First Flowchart",
  //     "description": "An example project with a basic Kanban setup",
  //   },
  //   "data": {
  //     "entities": {
  //       "user": {
  //         "3e39228d-c44c-44dc-93ba-e85497c162ce": {
  //           "id": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "username": "John Doe",
  //           "createdCourseIds": [
  //             "ca6a69f9-76e4-4c2a-91ef-28af60e741ad",
  //             "2e334c1c-f74e-4830-9a55-4b044e5b1b87",
  //             "c39a55b2-0bf0-4576-8675-845a42a0b01d",
  //             "05ac3062-71bc-4692-8bb6-a1c44979990a",
  //             "a3e500b0-3473-4c22-ba35-841e8db70d5f"
  //           ],
  //           "assignedCourseIds": [
  //             "c39a55b2-0bf0-4576-8675-845a42a0b01d"
  //           ],
  //           "commentIds": [
  //             "9f2f72c9-a338-4b27-82c7-881687a72b41",
  //             "c0e51211-6552-4437-8d58-7eb28de81883",
  //             "2d1c98e3-77c3-467d-aca2-08cf0f2b6fa2"
  //           ]
  //         },
  //         "112dd8bf-e9b4-4b76-95d6-62ec6f50797d": {
  //           "id": "112dd8bf-e9b4-4b76-95d6-62ec6f50797d",
  //           "username": "Briet Sparks",
  //           "commentIds": [
  //             "3aa940c2-187a-4511-ab35-0d2c8f605808"
  //           ],
  //           "assignedCourseIds": [
  //             "05ac3062-71bc-4692-8bb6-a1c44979990a"
  //           ]
  //         }
  //       },
  //       "task": {
  //         "ca6a69f9-76e4-4c2a-91ef-28af60e741ad": {
  //           "id": "ca6a69f9-76e4-4c2a-91ef-28af60e741ad",
  //           "title": "build first iteration of kanban dashboard app",
  //           "description": "",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "statusId": "0663f819-f550-488c-9b20-d74af0df5b35"
  //         },
  //         "2e334c1c-f74e-4830-9a55-4b044e5b1b87": {
  //           "id": "2e334c1c-f74e-4830-9a55-4b044e5b1b87",
  //           "title": "design drag-and-drop features",
  //           "description": "",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "statusId": "0663f819-f550-488c-9b20-d74af0df5b35"
  //         },
  //         "c39a55b2-0bf0-4576-8675-845a42a0b01d": {
  //           "id": "c39a55b2-0bf0-4576-8675-845a42a0b01d",
  //           "title": "user-deletion",
  //           "description": "",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "statusId": "49237786-3411-4ab5-974e-3b0078643bab",
  //           "assigneeId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "rootCommentIds": [
  //             "9f2f72c9-a338-4b27-82c7-881687a72b41"
  //           ]
  //         },
  //         "05ac3062-71bc-4692-8bb6-a1c44979990a": {
  //           "id": "05ac3062-71bc-4692-8bb6-a1c44979990a",
  //           "title": "persist current-user",
  //           "description": "",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "statusId": "49237786-3411-4ab5-974e-3b0078643bab",
  //           "rootCommentIds": [
  //             "c0e51211-6552-4437-8d58-7eb28de81883"
  //           ],
  //           "assigneeId": "112dd8bf-e9b4-4b76-95d6-62ec6f50797d"
  //         },
  //         "a3e500b0-3473-4c22-ba35-841e8db70d5f": {
  //           "id": "a3e500b0-3473-4c22-ba35-841e8db70d5f",
  //           "title": "add delays to service calls to simulate network",
  //           "description": "",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "statusId": "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
  //           "rootCommentIds": [
  //             "2d1c98e3-77c3-467d-aca2-08cf0f2b6fa2"
  //           ]
  //         }
  //       },
  //       "status": {
  //         "c41ba2a3-5068-4a8f-b8b0-568ca295ef56": {
  //           "id": "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
  //           "title": "Todo",
  //           "taskIds": [
  //             "a3e500b0-3473-4c22-ba35-841e8db70d5f"
  //           ]
  //         },
  //         "49237786-3411-4ab5-974e-3b0078643bab": {
  //           "id": "49237786-3411-4ab5-974e-3b0078643bab",
  //           "title": "In Progress",
  //           "taskIds": [
  //             "c39a55b2-0bf0-4576-8675-845a42a0b01d",
  //             "05ac3062-71bc-4692-8bb6-a1c44979990a"
  //           ]
  //         },
  //         "0663f819-f550-488c-9b20-d74af0df5b35": {
  //           "id": "0663f819-f550-488c-9b20-d74af0df5b35",
  //           "title": "Completed",
  //           "taskIds": [
  //             "ca6a69f9-76e4-4c2a-91ef-28af60e741ad",
  //             "2e334c1c-f74e-4830-9a55-4b044e5b1b87"
  //           ]
  //         }
  //       },
  //       "tag": {},
  //       "comment": {
  //         "9f2f72c9-a338-4b27-82c7-881687a72b41": {
  //           "id": "9f2f72c9-a338-4b27-82c7-881687a72b41",
  //           "value": "in the users menu, add a options button that allows a user to be deleted and edited",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "taskId": "c39a55b2-0bf0-4576-8675-845a42a0b01d"
  //         },
  //         "c0e51211-6552-4437-8d58-7eb28de81883": {
  //           "id": "c0e51211-6552-4437-8d58-7eb28de81883",
  //           "value": "the current user's ID should persist upon change",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "taskId": "05ac3062-71bc-4692-8bb6-a1c44979990a",
  //           "childCommentIds": [
  //             "3aa940c2-187a-4511-ab35-0d2c8f605808"
  //           ]
  //         },
  //         "3aa940c2-187a-4511-ab35-0d2c8f605808": {
  //           "id": "3aa940c2-187a-4511-ab35-0d2c8f605808",
  //           "value": "I agree",
  //           "creatorId": "112dd8bf-e9b4-4b76-95d6-62ec6f50797d",
  //           "parentCommentId": "c0e51211-6552-4437-8d58-7eb28de81883"
  //         },
  //         "2d1c98e3-77c3-467d-aca2-08cf0f2b6fa2": {
  //           "id": "2d1c98e3-77c3-467d-aca2-08cf0f2b6fa2",
  //           "value": "also add async hooks and loading spinners",
  //           "creatorId": "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //           "taskId": "a3e500b0-3473-4c22-ba35-841e8db70d5f"
  //         }
  //       }
  //     },
  //     "ids": {
  //       "user": [
  //         "3e39228d-c44c-44dc-93ba-e85497c162ce",
  //         "112dd8bf-e9b4-4b76-95d6-62ec6f50797d"
  //       ],
  //       "task": [
  //         "ca6a69f9-76e4-4c2a-91ef-28af60e741ad",
  //         "2e334c1c-f74e-4830-9a55-4b044e5b1b87",
  //         "c39a55b2-0bf0-4576-8675-845a42a0b01d",
  //         "05ac3062-71bc-4692-8bb6-a1c44979990a",
  //         "a3e500b0-3473-4c22-ba35-841e8db70d5f"
  //       ],
  //       "status": [
  //         "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
  //         "49237786-3411-4ab5-974e-3b0078643bab",
  //         "0663f819-f550-488c-9b20-d74af0df5b35"
  //       ],
  //       "tag": [],
  //       "comment": [
  //         "9f2f72c9-a338-4b27-82c7-881687a72b41",
  //         "c0e51211-6552-4437-8d58-7eb28de81883",
  //         "3aa940c2-187a-4511-ab35-0d2c8f605808",
  //         "2d1c98e3-77c3-467d-aca2-08cf0f2b6fa2"
  //       ]
  //     }
  //   }
  // });