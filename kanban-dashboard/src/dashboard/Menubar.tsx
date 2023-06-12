import React, { Fragment, useRef, useEffect } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  CreditCard,
  LogOut,
  Settings,
  User,
  Plus,
  Users,
  CheckCheck,
  GraduationCap,
  Pencil,
  School,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { FlowchartState, STUDENT_TERM_OPTIONS, STUDENT_YEAR_OPTIONS, useMoveRequirement } from "~/dashboard/state";
import { api } from "~/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingBar from "react-top-loading-bar";
import CalPoly from "~/components/icons/calpoly";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface MenubarProps {}

export default function Menubar({}: MenubarProps) {
  const {
    setDegree,
    startYear,
    selectedRequirements,
    setSelectedRequirements,
    setIndexForQuarter
  } = React.useContext(FlowchartState);
  const router = useRouter();

  const degreesQuery = api.degrees.all.useQuery(undefined, {
    staleTime: Infinity, // don't refresh until the user refreshes
  });

  const [selectedDegreeDisplayName, setSelectedDegreeDisplayName] =
    React.useState<string>("Select a Degree");
  const updateDegree = (name: string) => {
    if (!degreesQuery.data) {
      return;
    }
    for (const degree of degreesQuery.data) {
      // TODO: create record of string id: Degree for faster lookup
      if (degree.name === name) {
        trpcClient.degrees.requirements.prefetch({ degree, startYear } as any);
        setDegree(degree);
        setSelectedDegreeDisplayName(degree.name);
        break;
      }
    }
  };

  const ref = useRef(null as any);
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "loading") {
      ref.current.staticStart();
    } else {
      ref.current.complete();
    }
  }, [sessionStatus]);

  const trpcClient = api.useContext();

  const moveRequirement = useMoveRequirement();

  const markAllComplete = () => {
    selectedRequirements.forEach((req) => {
      const requirementId = req;
      const quarterId = -1;
      setIndexForQuarter(quarterId.toString(), 0, requirementId)
      moveRequirement(requirementId, quarterId);
    });
    setSelectedRequirements([]);
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <UserNav />

        <div />
        <div className="ml-auto flex items-center space-x-4">
          <div />
          {router.pathname === "/dashboard" ? (
            <>
              <FlowchartSwitcher />
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={selectedRequirements.length === 0}
                >
                  <Button
                    className="bg-primaryGreen hover:bg-primaryGreenHover"
                    disabled={selectedRequirements.length === 0}
                  >
                    Mark Complete{" "}
                    <CheckCheck className="icon-margin ml-auto h-4 w-4 shrink-0 opacity-50" />{" "}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark classes complete?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will move all selected classes into the
                      "Completed" column.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={markAllComplete}
                      className="bg-primaryGreen hover:bg-primaryGreenHover"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={selectedRequirements.length === 0}
                >
                  <Button
                    className="bg-primaryGreen hover:bg-primaryGreenHover"
                    disabled={selectedRequirements.length === 0}
                  >
                    Enroll
                    <GraduationCap className="icon-margin ml-auto h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>View open sections?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be redirected to a list of all open sections for
                      the courses you selected
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-primaryGreen hover:bg-primaryGreenHover"
                      onClick={() => router.push("/enrollment")}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <CalPoly />
          )}
        </div>
      </div>
      <LoadingBar color="#16a34a" ref={ref} shadow={true} height={3} />
    </div>
  );
}

const flowcharts = [
  {
    label: "Flowcharts",
    options: [
      {
        label: "First Flowchart",
        id: "123123",
      },
      {
        label: "Another Flowchart",
        id: "3213213",
      },
    ],
  },
];

type Flowchart = (typeof flowcharts)[number]["options"][number];

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

type TeamSwitcherProps = PopoverTriggerProps;

export function FlowchartSwitcher({ className }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showNewFlowchartDialog, setShowNewFlowchartDialog] =
    React.useState(false);
  const [selectedFlowchart, setSelectedFlowchart] =
    React.useState<Flowchart | null>(null);
  const trpcClient = api.useContext();

  const { setDegree, startYear, requirements } =
    React.useContext(FlowchartState);

  const updateDegree = (name: string) => {
    if (!degreesQuery.data) {
      return;
    }
    for (const degree of degreesQuery.data) {
      // TODO: create record of string id: Degree for faster lookup
      if (degree.name === name) {
        trpcClient.degrees.requirements.prefetch({ degreeId: degree.id, startYear });
        setDegree(degree);
        break;
      }
    }
  };
  const [value, setValue] = React.useState("");
  const [openDegree, setOpenDegree] = React.useState(false);

  const degreesQuery = api.degrees.all.useQuery(undefined, {
    staleTime: Infinity, // don't refresh until the user refreshes
  });

  const confirmSelectedDegree = () => {
    updateDegree(value);
    setShowNewFlowchartDialog(false);
  };

  return (
    <Dialog
      open={showNewFlowchartDialog}
      onOpenChange={setShowNewFlowchartDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a flowchart"
            className={cn("w-[200px] justify-between", className)}
          >
            {selectedFlowchart
              ? selectedFlowchart.label
              : "Select flowchart..."}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search flowchart..." />
              <CommandEmpty>No team found.</CommandEmpty>
              {flowcharts.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.id}
                      onSelect={() => {
                        setSelectedFlowchart(option);
                        setOpen(false);
                      }}
                      className="text-sm"
                    >
                      {option.label}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedFlowchart &&
                            selectedFlowchart.id === option.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewFlowchartDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create flowchart
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create flowchart</DialogTitle>
          <DialogDescription>
            Select a name and degree for your new flowchart.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Flowchart name</Label>
              <Input id="name" placeholder="Input name..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Degree</Label>
              <Popover open={openDegree} onOpenChange={setOpenDegree}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDegree}
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
                  className={`w-[470px] p-0 ${
                    openDegree && `max-h-[250px]`
                  }  overflow-auto`}
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
                              setValue(
                                currentValue === value ? "" : degree.name
                              );
                              setOpenDegree(false);
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
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowNewFlowchartDialog(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primaryGreen hover:bg-primaryGreenHover"
            onClick={confirmSelectedDegree}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserNav() {
  const { data: session, status: sessionStatus } = useSession();

  const handleLogin = () => {
    signIn("google", {
      callbackUrl: `${window.location.origin}/onboarding`,
    });
  };

  

  const { studentYear, setStudentYear, studentTerm, setStudentTerm } =
    React.useContext(FlowchartState);

  const [year, setYear] = React.useState(studentYear);
  const [term, setTerm] = React.useState(studentTerm);


  const [isOpenEditYear, setIsOpenEditYear] = React.useState(false);
  const [isOpenEditTerm, setIsOpenEditTerm] = React.useState(false);

  // This effect updates the local 'year' state when 'studentYear' changes
  React.useEffect(() => {
    setYear(studentYear);
  }, [studentYear]);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={sessionStatus === "unauthenticated"}
      >
        <div className="flex flex-row justify-center items-center">
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {sessionStatus === "authenticated" ? (
                <AvatarImage src={session.user?.image ?? ""} alt="@user" />
              ) : (
                <AvatarImage src={""} alt="@user" />
              )}
              <AvatarFallback>
                  <AvatarImage src={""} alt="@user" />
              </AvatarFallback>
            </Avatar>
          </Button>
          <Button
            variant="link"
            onClick={
              sessionStatus === "unauthenticated"
                ? () => handleLogin()
                : () => null
            }
          >
            {sessionStatus === "authenticated" ? session.user?.email : "Login"}
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name?.split(" ")[0] || "N/A"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
       <DropdownMenuItem className="flex justify-between" onClick={() => setIsOpenEditYear(true)}>
          <div className="flex items-center">
            <School className="mr-2 h-4 w-4" />
            <span>Edit year</span>
          </div>
          <span className="opacity-60">{studentYear}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between" onClick={() => setIsOpenEditTerm(true)}>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span>Change term</span>
          </div>
          <span className="opacity-60">{studentTerm}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ redirect: true, callbackUrl: "/auth" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Dialog open={isOpenEditYear} onOpenChange={setIsOpenEditYear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What is your year?</DialogTitle>
            
          </DialogHeader>
          <div className="space-y-2">
              <Label htmlFor="plan">Select year</Label>
          <Select onValueChange={(val: "Freshman" | "Sophomore" | "Junior" | "Senior") => setYear(val)}>
      <SelectTrigger>
        <SelectValue placeholder={year} />
      </SelectTrigger>
      <SelectContent>
      <SelectGroup>
    {STUDENT_YEAR_OPTIONS.map(yr => (
      <SelectItem value={yr} key={yr}>{yr}</SelectItem>
    ))}
  </SelectGroup>
      </SelectContent>
    </Select>
    </div>
          <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpenEditYear(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primaryGreen hover:bg-primaryGreenHover"
            onClick={() => {setStudentYear(year); setIsOpenEditYear(false)}}
          >
            Confirm
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isOpenEditTerm} onOpenChange={setIsOpenEditTerm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What is the current term?</DialogTitle>
            
          </DialogHeader>
          <div className="space-y-2">
              <Label htmlFor="plan">Select term</Label>
          <Select onValueChange={(val: "Winter" | "Spring" | "Fall") => setTerm(val)}>
      <SelectTrigger>
        <SelectValue placeholder={term} />
      </SelectTrigger>
      <SelectContent>
      <SelectGroup>
    {STUDENT_TERM_OPTIONS.map(term => (
      <SelectItem value={term} key={term}>{term}</SelectItem>
    ))}
  </SelectGroup>
      </SelectContent>
    </Select>
    </div>
          <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpenEditTerm(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primaryGreen hover:bg-primaryGreenHover"
            onClick={() => {setStudentTerm(term); setIsOpenEditTerm(false)}}
          >
            Confirm
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
   </>
  );
}