import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { useRouter } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"  
import React, { useEffect, useRef, useState } from "react";
import { FlowchartState } from "~/dashboard/state";
import Layout from "~/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Check, Copy, CopyCheck, Expand, Flag, GraduationCap, Link, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";


const classSections = [
    {
      section: "Sec 01",
      instructor: "Dr. John",
      days: "MWF",
      startTime: "10:00am",
      endTime: "11:00am",
      room: "101",
      courseCode: "18376"
    },
    {
      section: "Sec 02",
      instructor: "Dr. Jane",
      days: "TTh",
      startTime: "1:00pm",
      endTime: "2:30pm",
      room: "202",
      courseCode: "4487"
    },
    {
      section: "Sec 03",
      instructor: "Prof. Doe",
      days: "MW",
      startTime: "3:00pm",
      endTime: "4:30pm",
      room: "303",
      courseCode: "2376"
    },
    {
      section: "Sec 04",
      instructor: "Prof. Smith",
      days: "TTh",
      startTime: "9:00am",
      endTime: "10:30am",
      room: "404",
      courseCode: "19374"
    },    
  ];
  
  
  export default function EnrollmentPage() {
    const { selectedRequirements, setSelectedRequirements, requirements } = React.useContext(FlowchartState);
    const selectedRequirementObjects = requirements.filter((req) => {
        return selectedRequirements.includes(req.id)
    })

    const router = useRouter()

    const [copiedCourse, setCopiedCourse] = useState("")
    
    const copy_course_clear_timeout_tracker = useRef<NodeJS.Timeout | null>(null);

const copyCourse = (courseCode: string) => {
    navigator.clipboard.writeText(courseCode)
    setCopiedCourse(courseCode)
    if (copy_course_clear_timeout_tracker.current) {
        clearTimeout(copy_course_clear_timeout_tracker.current)
    }
    copy_course_clear_timeout_tracker.current = setTimeout(() => {
        setCopiedCourse("")
    }, 2000)
}

//view on rate my professor link
//navigate to https://www.polyratings.com/list.html
const openPolyRatings = (instructor: string) => {
    window.open(`https://www.polyratings.com/list.html`, "_blank")
}

const openRateMyProfessor = (instructor: string) => {
    console.log(instructor)
    window.open(`https://www.ratemyprofessors.com/search/professors?q=${instructor}`, "_blank")
}

    
  
    return (
        <Layout>
            
            <section className="container flex flex-col items-center justify-start gap-3 pb-10 pt-6 w-[80%] overflow-hidden">
            <div className="flex items-center justify-start w-full">
                <Button variant="link" className="whitespace-nowrap p-0 " onClick={() => router.push('/dashboard')}><ArrowLeft className="mr-2"/><CardTitle>View available courses below</CardTitle></Button>

                </div>
                <Accordion type="multiple" className="w-full grid gap-4 overflow-auto">
              {selectedRequirementObjects.map((requirement, index) => (
                      <AccordionItem value={`item-${index}`} key={index} className="border-[1px] border-solid rounded">
                      <AccordionTrigger className="border px-4 py-3 text-sm w-full text-left rounded"><div>{requirement.code}</div>{requirement.title}</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                      <Table className="border px-4 py-3 text-sm rounded-b-md">
                  <TableHeader>
                    <TableRow>
                      <TableCell>Section</TableCell>
                      <TableCell>Instructor</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>StartTime</TableCell>
                      <TableCell>EndTime</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell className="text-right">Course Code</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  <TableRow>
                    {classSections.length === 0 && <TableCell
                  colSpan={7}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>}
                
              </TableRow>
                    {classSections.map((section, index) => (
                      <TableRow key={index}>
                        <TableCell>{section.section}</TableCell>
                        <TableCell>
                            <div>
                            <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="link" className="text-left text-blue-600 hover:underline">
                                {section.instructor}
                                </Button>
                            
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => openRateMyProfessor(section.instructor)}>
                            <Expand className="mr-2 h-4 w-4" />
                                View on Rate My Professor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                            onClick={() => openPolyRatings(section.instructor)}
                            >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Open Poly Ratings
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                            </div>
                       
                           
                        </TableCell>
                        <TableCell>{section.days}</TableCell>
                        <TableCell>{section.startTime}</TableCell>
                        <TableCell>{section.endTime}</TableCell>
                        <TableCell>{section.room}</TableCell>
                        <TableCell className="text-right">
                       
                        <Button variant="link"   className="text-left text-blue-600 hover:underline"  onClick={() => copyCourse(section.courseCode)}>
                                {section.courseCode} 
                                {section.courseCode === copiedCourse? <Check className="ml-1 ml-auto h-4 w-4 shrink-0"/>: <Copy className="ml-1 ml-auto h-4 w-4 shrink-0"/>}
                                

                                </Button>
                            
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                      </AccordionContent>
                    </AccordionItem>
        ))}
     
    </Accordion>
            
            </section>
             
        </Layout>
    
    );
  }