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
import { Course, CourseType } from './store/types';


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

      const courseType_arr = Object.values(CourseType)

      const courses = [
        {
          title: 'CSC 101',
          description: 'Intro to Computer Science',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 102',
          description: 'Data Structures and Algorithms',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 202',
          description: 'Discrete Structures',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 225',
          description: 'Introduction to Computer Organization',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 248',
          description: 'Introduction to Database Systems',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 307',
          description: 'Systems Programming',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 357',
          description: 'Design & Analysis of Algorithms',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 453',
          description: 'Operating Systems',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 491',
          description: 'Senior Project Lab I',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 492',
          description: 'Senior Project Lab II',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CSC 497',
          description: 'Research Senior Project I',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CPE 102',
          description: 'Introduction to Computer Science II',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CPE 103',
          description: 'Object-Oriented Design',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'CPE 357',
          description: 'Introduction to Software Engineering',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'MATH 141',
          description: 'Calculus I',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'MATH 142',
          description: 'Calculus II',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'MATH 206',
          description: 'Statistical Methods for Engineers',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
        {
          title: 'MATH 244',
          description: 'Applied Linear Models',
          units: 4,
          courseType: courseType_arr[Math.round(Math.random() * courseType_arr.length)],
        },
      ] as Partial<Course>[];
      

      [...statuses].forEach(status => {
        const course1 = courses[Math.round(Math.random() * courses.length)]
        const course2 = courses[Math.round(Math.random() * courses.length)]
        if(course1) {
          createCourse({ title: course1.title, statusId: status, creatorId: currentUserId, description: course1.description, courseType: course1.courseType });
        }
        if(course2) {
          createCourse({ title: course2.title, statusId: status, creatorId: currentUserId, description: course2.description, courseType: course2.courseType });
        }
      })
      
      
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
