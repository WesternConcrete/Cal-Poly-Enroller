import Layout from "../components/Layout";
import { Transition } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "~/utils/api";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

import { FlowchartState } from "~/dashboard/state";

type CardProps = React.ComponentProps<typeof Card>;

export default function OnboardingPage() {
  const trpcClient = api.useContext();
  const { setDegree, startYear, requirements } =
    React.useContext(FlowchartState);
  const [step, setStep] = useState(0);
  const step_text = [
    "What's your major?",
    "What classes have you completed?",
    "What year are you?",
  ];
  const [going_to_next, setGoingToNext] = useState(false);
  const [nextStepComplete, setNextStepComplete] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();
  const degreesQuery = api.degrees.all.useQuery(undefined, {
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
    signOut({ callbackUrl: "/auth" });
  };

  const updateDegree = (name: string) => {
    if (!degreesQuery.data) {
      return;
    }
    for (const degree of degreesQuery.data) {
      // TODO: create record of string id: Degree for faster lookup
      if (degree.name === name) {
        console.log("fetching degree requirements for:", degree);
        trpcClient.degrees.requirements.prefetch({ degreeId: degree.id, startYear });
        setDegree(degree);
        break;
      }
    }
  };

  useEffect(() => {
    console.log(requirements);
  }, [requirements]);

  const setDegreeWrapper = (degree: string) => {
    updateDegree(degree);
    setValue(degree);
  };

  const goToStep = (step: number) => {
    setNextStepComplete(true);
    setGoingToNext(true);
    if (step < 0) {
      return handleLogout();
    } else if (step > 1) {
      setTimeout(() => router.push("/dashboard"), 450);

      return;
    }
    setTimeout(() => {
      setNextStepComplete(false);
      setStep(step);
      setGoingToNext(false);
    }, 350);
  };

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
        {step === 0 && (
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
                        ? degreesQuery.data?.find(
                            (degree) => degree.name === value
                          )?.name
                        : "Major..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`w-[330px] p-0 ${
                      open && `max-h-[300px] overflow-auto`
                    }`}
                  >
                    <Command>
                      <CommandInput placeholder="Search degree..." />
                      <CommandEmpty>No degree found.</CommandEmpty>
                      <CommandGroup>
                        {degreesQuery.data &&
                          degreesQuery.data.map((degree, idx) => (
                            <CommandItem
                              key={degree.name + idx}
                              onSelect={(currentValue) => {
                                setDegreeWrapper(
                                  currentValue === value ? "" : degree.name
                                );
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  value === degree.name
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {degree.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => goToStep(step - 1)}>
                  Go Back
                </Button>

                <Button
                  className="bg-primaryGreen"
                  onClick={() => goToStep(step + 1)}
                >
                  Next
                </Button>
              </CardFooter>
            </Card>{" "}
          </section>
        )}

        {step === 1 && (
          <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              {step_text[step]}
            </h1>
            <Card>
              <CardHeader>
                <CardTitle>Select Courses</CardTitle>
                <CardDescription>
                  Click on the courses down below.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-center items-center gap-6">
                {requirements &&
                  requirements.slice(0, 7).map((req, index) => {
                    const classes = `w-1/3 flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                      index < 3 ? "lg:w-1/5" : "lg:w-1/5"
                    } ${
                      selectedClasses.includes(req.code)
                        ? "border-primaryGreen"
                        : "border-muted"
                    } 
        `;

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
                <Button variant="outline" onClick={() => goToStep(step - 1)}>
                  Go Back
                </Button>

                <Button
                  className="bg-primaryGreen"
                  onClick={() => goToStep(step + 1)}
                >
                  Next
                </Button>
              </CardFooter>
            </Card>
          </section>
        )}
      </Transition>
    </Layout>
  );
}
