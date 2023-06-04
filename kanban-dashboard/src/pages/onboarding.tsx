import Layout from "../components/Layout";
import { Transition } from '@headlessui/react';
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, BellRing } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { api } from "~/utils/api";
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FlowchartState } from "~/dashboard/state";

  type CardProps = React.ComponentProps<typeof Card>
   
  export function CardDemo({ className, ...props }: CardProps) {
    return (
      <Card className={cn("w-[380px]", className)} {...props}>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>You have 3 unread messages.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className=" flex items-center space-x-4 rounded-md border p-4">
            <BellRing />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Push Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Send notifications to device.
              </p>
            </div>
            <Switch />
          </div>
          {/* <div>
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div> */}
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </CardFooter>
      </Card>
    )
  }

export default function OnboardingPage() {
  const trpcClient = api.useContext();
  const { setDegree, startYear, requirements } = React.useContext(FlowchartState);
  const [step, setStep] = useState(0);
  const step_text = ["What's your major?", "What classes have you completed?", "What year are you?"]
  const [going_to_next, setGoingToNext]  = useState(false);
  const [nextStepComplete, setNextStepComplete]  = useState(false);
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const router = useRouter();
  const degreesQuery = api.degrees.useQuery(undefined, {
    staleTime: Infinity, // don't refresh until the user refreshes
  });
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const toggleClass = (className: string) => {
        if (selectedClasses.includes(className)) {
            setSelectedClasses(selectedClasses.filter((name) => name !== className));
        } else {
            setSelectedClasses([...selectedClasses, className]);
        }
    };

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth" })
  };

  const updateDegree = (name: string) => {
    if (!degreesQuery.data) {
      return;
    }
    for (const degree of degreesQuery.data) {
      // TODO: create record of string id: Degree for faster lookup
      if (degree.name === name) {
        console.log("fetching degree requirements for:", degree);
        trpcClient.degreeRequirements.prefetch({ degree, startYear });
        setDegree(degree);
        break;
      }
    }
  };

  useEffect(() => {
    console.log(requirements)
  }, [requirements]);

  const setDegreeWrapper = (degree: string) => {
    updateDegree(degree);
    setValue(degree);
  }

  const goToStep = (step: number) => {
    setNextStepComplete(true)
    setGoingToNext(true)
    if(step < 0) {
        return handleLogout()
    } else if (step > 1) {
        setTimeout(() => router.push("/dashboard"), 450)
        
        return
    }
    setTimeout(() => {
        setNextStepComplete(false)
        setStep(step);
        setGoingToNext(false);
    }, 350)
  }

  





  return (
    <Layout>
        
     

      <Transition
        show={!going_to_next}
        enter="transition-all ease-in duration-350"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-all ease-out duration-350"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {step === 0 && 
         <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
         <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
           {step_text[step]}
         </h1>
        <Card className="w-[380px]">
            
        <CardHeader>
        <CardTitle>Select your major down below</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
        <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
    <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
    >
        {value
        ? degreesQuery.data?.find((degree) => degree.name === value)?.name
        : "Major..."}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
    </PopoverTrigger>
    <PopoverContent className={`w-[330px] p-0 ${open && `max-h-[300px] overflow-auto`}`}>
    <Command>
        <CommandInput placeholder="Search degree..." />
        <CommandEmpty>No degree found.</CommandEmpty>
        <CommandGroup>
        {degreesQuery.data &&
            degreesQuery.data.map((degree, idx) => (
            <CommandItem
            key={degree.name + idx}
            onSelect={(currentValue) => {
                setDegreeWrapper(currentValue === value ? "" : degree.name)
                setOpen(false)
            }}
            >
            <Check
                className={cn(
                "mr-2 h-4 w-4",
                value === degree.name ? "opacity-100" : "opacity-0"
                )}
            />
            {degree.name}
            </CommandItem>
            )
            
            )}
        
        </CommandGroup>
    </Command>
    </PopoverContent>
</Popover>
        </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => goToStep(step - 1)}
            >
              Go Back
            </Button>
            
            <Button
              className="bg-primaryGreen"
              onClick={() => goToStep(step + 1)}
            >
              Next
            </Button>
          </CardFooter>
        </Card> </section>}

        {step === 1 && <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
         <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
           {step_text[step]}
         </h1><Card>
      <CardHeader>
        <CardTitle>Select Courses</CardTitle>
        <CardDescription>
            Click on the courses down below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center items-center gap-6">
    {requirements && requirements.slice(0, 7).map((req, index) => {
        const classes = `w-1/3 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
            index < 3 ? 'lg:w-1/5' : 'lg:w-1/5'
        } ${
            selectedClasses.includes(req.code) ? 'border-primaryGreen' : 'border-muted'
        } 
        `


        
        return (
            <Label
                htmlFor="card"
                key={req.code}
                onClick={() => toggleClass(req.code)}
                className={classes}
            >
                {req.code}
            </Label>
        );
    })}
</CardContent>


      <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => goToStep(step - 1)}
            >
              Go Back
            </Button>
            
            <Button
              className="bg-primaryGreen"
              onClick={() => goToStep(step + 1)}
            >
              Next
            </Button>
          </CardFooter>
    </Card></section>}
        
      </Transition>
     
      
    </Layout>
  );
}

