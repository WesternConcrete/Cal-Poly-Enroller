import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  type FC,
  type SetStateAction,
  type Dispatch,
} from "react";

import { type Requirement, type Degree} from "~/server/api/root";
import { api } from "~/utils/api";

type Setter<S> = React.Dispatch<React.SetStateAction<S>>;

export type PartialDegree = Pick<Degree, "name" | "id">;

type FlowchartStateType = {
  requirements: Requirement[];
  setRequirements: Setter<Requirement[]>;
  degree: PartialDegree | null;
  setDegree: Setter<PartialDegree | null>;
  startYear: number;
  setStartYear: Setter<number>;
  selectedRequirements: string[];
  setSelectedRequirements: Setter<string[]>;
  studentYear: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
  setStudentYear:  Setter<'Freshman' | 'Sophomore' | 'Junior' | 'Senior'>;
  studentTerm: 'Winter' | 'Spring' | 'Fall';
  setStudentTerm: Setter< 'Winter' | 'Spring' | 'Fall'>;
  indexMap: Record<string, string[]>;
  setIndexMap: Setter<Record<string, string[]>>;
  setIndexForQuarter: (des_quarter_id: string, dest_index: number, requirement_id: string) => void;

};

export const STUDENT_YEAR_OPTIONS = ['Freshman' , 'Sophomore' , 'Junior' , 'Senior'] as ('Freshman' | 'Sophomore' | 'Junior' | 'Senior')[];

export const STUDENT_TERM_OPTIONS = ['Winter' , 'Spring',  'Fall'] as ('Winter' | 'Spring' | 'Fall')[]

export const FlowchartState = createContext<FlowchartStateType>(
  {} as FlowchartStateType
);

export const FlowchartStateProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // TODO: remove requirements state and replace with trpc query
  // TODO: remove StoreProvider and replace with trpc quarters query in flowchart
  // TODO: merge dashboard and flowhcart components
  // TODO: make moveRequirement a backend mutation
  const [degree, setDegree] = useState<PartialDegree | null>(null);
  const [studentYear, setStudentYear] = useState<'Freshman' | 'Sophomore' | 'Junior' | 'Senior'>("Freshman");

  const currentMonth = new Date().getMonth();

  let currentSeason: 'Winter' | 'Spring' | 'Fall';
  if (currentMonth < 3) currentSeason = 'Winter';
  else if (currentMonth < 6) currentSeason = 'Spring';
  else currentSeason = 'Fall';

  const [studentTerm, setStudentTerm] = useState<'Winter' | 'Spring' | 'Fall'>(currentSeason);

  const [indexMap, setIndexMap] = useState<Record<string, string[]>>({});


  const setIndexForQuarter = (des_quarter_id: string, dest_index: number, requirement_id: string) => {
    
    let source_quarter_id;
    Object.keys(indexMap).forEach(quarter => {
      indexMap[quarter].forEach(req => {
        if(req === requirement_id) {
          source_quarter_id = quarter
        }
      })
    })
    if(source_quarter_id) {
      if(indexMap[source_quarter_id] === undefined) {
        indexMap[source_quarter_id] = []
      }

      indexMap[source_quarter_id] = indexMap[source_quarter_id].filter(
        req_id => req_id !== requirement_id
      )
    }

    
    
    if(indexMap[des_quarter_id] === undefined) {
      indexMap[des_quarter_id] = []
    }

    indexMap[des_quarter_id].splice(dest_index, 0, requirement_id);
    setIndexMap(indexMap)
  }

  
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  const setRequirementsWrapper = (requirements: Requirement[]) => {
    requirements.forEach(req => {
      console.log(req)
      setIndexForQuarter(req.quarterId.toString(), 0,  req.id)
    })
    setRequirements(requirements)
  }

  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
    []
  );

  // default to current year
  // TODO: create way to select start year
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  useEffect(() => {
    console.log("updating requirements!");
  }, [requirements]);
  const _requirementsQuery = api.degrees.requirements.useQuery(
    { degreeId: degree?.id ?? null, startYear },
    { enabled: false, onSuccess: (data) => setRequirementsWrapper(data) }
  );
  const flowchartContext = {
    degree,
    setDegree,
    requirements,
    setRequirements,
    startYear,
    setStartYear,
    selectedRequirements,
    setSelectedRequirements,
    studentYear,
    setStudentYear,
    studentTerm,
    setStudentTerm,
    indexMap, 
    setIndexMap,
    setIndexForQuarter,
  };

  // TODO: move nested courses fetch here to avoid loading spinner waterfall

  return (
    <FlowchartState.Provider value={flowchartContext}>
      {children}
    </FlowchartState.Provider>
  );
};

export const useMoveRequirement = () => {
  const { degree, startYear } = useContext(FlowchartState);
  const trpcClient = api.useContext();
  const moveRequirement = (requirementId: string, quarterId: number) => {
    trpcClient.degrees.requirements.setData(
      { degreeId: degree?.id ?? null, startYear },
      (requirements) => {
        if (!requirements) {
          console.error("No requirements found for degree:", degree);
          return [];
        }
        let found = false;
        const newRequirements = requirements.map((r) => {
          if (r.id === requirementId) {
            found = true;
            console.log("moving:", r, "to:", quarterId);
            r.quarterId = quarterId;
          }
          return r;
        });
        if (!found) {
          console.error(
            `Tried to move requirement with id: ${requirementId} but couldn't find it...`
          );
        }
        return newRequirements;
      }
    );
  };
  return moveRequirement;
};

export const DraggingState = React.createContext({
  // existing state and functions...
  dragging: false,
  setDragging: (() => {}) as unknown as Dispatch<SetStateAction<boolean>>,
  draggingItem: null,
  setDraggingItem: (() => {}) as unknown as Dispatch<SetStateAction<null>>,
  draggingOver: null,
  setDraggingOver: (() => {}) as unknown as Dispatch<SetStateAction<null>>,
});
