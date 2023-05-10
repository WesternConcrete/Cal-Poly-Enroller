import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import {
  DragDropContext,
  DropResult,
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd';
import AddIcon from '@material-ui/icons/Add';
import { hooks, emptyArray } from './store';
import { useBoardStyles } from './styles';
import StatusLane from './StatusLane';
import { Fab } from '@material-ui/core';
import CourseEditorForm from './CourseEditorForm';
import { useCurrentUserId } from './CurrentUser';
import {handleCloseModal} from "../helpers/shared"


export default function Flowchart() {
  const currentUserId = useCurrentUserId();
  const statusIds = hooks.useStatusIds();
  const createCourse = hooks.useCreateCourse();
  const moveStatus = hooks.useMoveStatus();
  const moveCourse = hooks.useMoveStatusCourse();


  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const openCourseForm = () => setIsCourseFormOpen(true);
  const closeCourseForm = () => setIsCourseFormOpen(false);

  const classNames = useBoardStyles();


  const handleDragEnd = ({ type, source, destination, draggableId }: DropResult) => {
    if (source && destination) {
      if (type === 'statusLane' && moveStatus) {
        moveStatus(source.index, destination.index);
      }

      if (type === 'taskCard' && moveCourse) {
        moveCourse(
          draggableId,
          source.droppableId,
          source.index,
          destination.droppableId,
          destination.index
        )
      }
    }
  };

  const handleSubmitNewCourse = (title: string, desc: string) => {
    if (createCourse && currentUserId) {
      const statuses = [
        "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
        "49237786-3411-4ab5-974e-3b0078643bab",
        "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
        "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
        "c41ba2a3-5068-4a8f-b8b5-568ca295ef56",
        "c40bfef2-31c2-4228-a8c6-22b52974fbc7",
        "c41ba2a3-5068-4a8f-b8b7-568ca295ef56",
        "c41ba2a3-5068-4a8f-b8b6-568ca295ef56",
        "49237786-3411-4ab5-9746-3b0078643bab",
        "c40bfef2-31c2-4228-a8c6-22b52974fbc7",
        "c41ba2a3-5068-4a8f-b8b7-568ca295ef56",
        "49237786-3411-4ab5-9747-3b0078643bab",
        "c40bfef2-31c2-4228-a8c7-22b52974fbc7",
      ]

      const courses = [
        {
          classcode: 'CSC 101',
          classname: 'Intro to Computer Science',
        },
        {
          classcode: 'CSC 102',
          classname: 'Data Structures and Algorithms',
        },
        {
          classcode: 'CSC 202',
          classname: 'Discrete Structures',
        },
        {
          classcode: 'CSC 225',
          classname: 'Introduction to Computer Organization',
        },
        {
          classcode: 'CSC 248',
          classname: 'Introduction to Database Systems',
        },
        {
          classcode: 'CSC 307',
          classname: 'Systems Programming',
        },
        {
          classcode: 'CSC 357',
          classname: 'Design & Analysis of Algorithms',
        },
        {
          classcode: 'CSC 453',
          classname: 'Operating Systems',
        },
        {
          classcode: 'CSC 491',
          classname: 'Senior Project Lab I',
        },
        {
          classcode: 'CSC 492',
          classname: 'Senior Project Lab II',
        },
        {
          classcode: 'CSC 497',
          classname: 'Research Senior Project I',
        },
        {
          classcode: 'CPE 102',
          classname: 'Introduction to Computer Science II',
        },
        {
          classcode: 'CPE 103',
          classname: 'Object-Oriented Design',
        },
        {
          classcode: 'CPE 357',
          classname: 'Introduction to Software Engineering',
        },
        {
          classcode: 'MATH 141',
          classname: 'Calculus I',
        },
        {
          classcode: 'MATH 142',
          classname: 'Calculus II',
        },
        {
          classcode: 'MATH 206',
          classname: 'Statistical Methods for Engineers',
        },
        {
          classcode: 'MATH 244',
          classname: 'Applied Linear Models',
        },
      ];
      

      [...statuses].forEach(status => {
        const course1 = courses[Math.round(Math.random() * courses.length)]
        const course2 = courses[Math.round(Math.random() * courses.length)]
        if(course1) {
          createCourse({ title: course1.classcode, statusId: status, creatorId: currentUserId, description: course1.classname, });
        }
        if(course2) {
          createCourse({ title: course2.classcode, statusId: status, creatorId: currentUserId, description: course2.classname, });
        }
      })
      //createCourse({ title, statusId: status, creatorId: currentUserId, description: desc, });
      
    }
    closeCourseForm();
  };

  return (
    <div className={classNames.board}>
      {createCourse && (
          <Dialog open={isCourseFormOpen} onClose={(event, reason) => (handleCloseModal(event, reason, closeCourseForm))}>
            <Paper className={classNames.dialog}>
              <CourseEditorForm onSubmit={handleSubmitNewCourse} onCancel={closeCourseForm}/>
            </Paper>
          </Dialog>
        )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable type="statusLane" droppableId="projectBoard" direction="horizontal">
          {(provided: DroppableProvided) => {
            return (
              <div ref={provided.innerRef} {...provided.droppableProps} className={classNames.lanes}>
                {(statusIds || emptyArray).map((statusId, index) => (
                   <div className={classNames.laneContainer} key={index}>
                   <StatusLane id={statusId}  />
                 </div>
                ))}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </DragDropContext>
      <div className={classNames.addButtonContainer}>
        <Fab color="primary" aria-label="add" onClick={() => openCourseForm()}>
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
}
