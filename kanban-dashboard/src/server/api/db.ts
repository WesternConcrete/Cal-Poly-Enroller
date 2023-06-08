import { Course, GESubArea, PrismaClient } from "@prisma/client";
import {
  scrapeDegrees,
  scrapeSubjects,
  scrapeSubjectCourses,
  scrapeDegreeRequirements,
  CourseRequirement,
  DegreeRequirementSection,
  GeRequirement,
  CourseCode,
} from "../../scraping/catalog";

const CREATE_DEGREES = false;
const CREATE_COURSES = false;
const CREATE_GE_REQUIREMENTS = false;
const CREATE_COURSE_REQUIREMENTS = false;
const CREATE_CONCENTRATIONS = true;

const skipDuplicates = true;

const createCourses = async (prisma: PrismaClient) => {
  const subjects = await scrapeSubjects();
  await prisma.subject.createMany({ data: subjects, skipDuplicates });
  const foundCourses = new Set();
  await Promise.all(
    subjects.map(async (subject) => {
      const courses = await scrapeSubjectCourses(subject.code);
      console.log(
        "found",
        courses.length,
        "courses for subject:",
        subject.code
      );
      for (const course of courses) {
        foundCourses.add(course.code);
      }
      await prisma.subject.update({
        where: { code: subject.code },
        data: {
          courses: {
            createMany: {
              data: courses,
              skipDuplicates,
            },
          },
        },
      });
    })
  );
};

const createDegrees = async (prisma: PrismaClient) => {
  // await prisma.degree.deleteMany();
  const degrees = await scrapeDegrees();
  return await Promise.all(
    degrees.map(
      async (degree) =>
        await prisma.degree.create({
          data: {
            name: degree.name,
            link: degree.link,
            id: degree.id,
            kind: degree.kind,
          },
          select: {
            id: true,
            name: true,
            link: true,
            kind: true,
          },
        })
    )
  );
};

const createDegreeGERequirements = async (
  prisma: PrismaClient,
  ges: GeRequirement[],
  degreeId: string
) => {
  return await Promise.all(
    ges.map(async (geReq: GeRequirement) => {
      await prisma.gERequirement.create({
        data: {
          degree: { connect: { id: degreeId } },
          area: geReq.area,
          subArea: geReq.subarea as GESubArea,
          units: geReq.units,
        },
      });
    })
  );
};

const createRequirementGroup = async (
  prisma: PrismaClient,
  group: CourseRequirement,
  section: DegreeRequirementSection
): Promise<number> => {
  if (section.kind === "ge") {
    throw new Error(
      "cannot create course group for ge's:" + `${{ group, section }}`
    );
  }
  const courses: CourseCode[] = [];
  const childGroups = [];
  let kind;
  if (group.kind === "course") {
    throw new Error("cannot create group from only course");
  }
  for (let subGroup of group.courses) {
    if (subGroup.kind === "course") {
      courses.push(subGroup.course);
      continue;
    }
    let subGroupId = await createRequirementGroup(prisma, subGroup, section);
    childGroups.push(subGroupId);
  }

  let courseKindInfo = null;
  if (section.kind === "elective") {
    courseKindInfo = section.electiveKind;
  } else if (section.kind === "support") {
    courseKindInfo = section.supportKind;
  }

  const createdGroup = await prisma.courseRequirementGroup
    .create({
      data: {
        groupKind: group.kind as "or" | "and",
        coursesKind: section.kind,
        courseKindInfo,
        courses: {
          createMany: {
            data: courses.map((c: CourseCode) => ({
              courseCode: c,
              kind: section.kind,
            })),
            skipDuplicates,
          },
        },
        ...(childGroups.length > 0 && {
          childGroups: {
            connect: childGroups.map((id) => ({ id })),
          },
        }),
      },
      select: {
        id: true,
      },
    })
    .catch((e) => {
      console.error("failed to create group:", group);
      throw e;
    });
  return createdGroup.id;
};
const createCourseRequirements = async (
  prisma: PrismaClient,
  sections: DegreeRequirementSection[],
  degreeId: string
) => {
  for (const section of sections) {
    if (section.kind === "ge") continue;
    if (section.courses.length === 0) continue;

    let groupKind: "or" | "and" = section.kind === "elective" ? "or" : "and";
    let rootGroupId = await createRequirementGroup(
      prisma,
      {
        kind: groupKind,
        courses: section.courses,
        // FIXME: scrape degree units
        units: 0,
      },
      section
    );

    await prisma.degree.update({
      where: { id: degreeId },
      data: {
        requirements: {
          connect: [{ id: rootGroupId }],
        },
      },
    });
  }
};

const createConcentrations = async (
  prisma: PrismaClient,
  concentrations: {
    name: string;
    link: string;
    id: string;
    courses: DegreeRequirementSection[];
  }[],
  degreeId: string
) => {
  await prisma.degree.update({
    where: { id: degreeId },
    data: {
      concentrations: {
        createMany: {
          data: concentrations.map(({name,id}) => ({name, id})),
            skipDuplicates,
        },
      },
    },
  });

  for (const concentration of concentrations) {
    for (const section of concentration.courses) {
      if (section.kind === "ge")
        throw new Error(
          "found ge section in concentration!" + `${{ concentration }}`
        );
      let groupKind: "or" | "and" = section.kind === "elective" ? "or" : "and";
      let rootGroupId = await createRequirementGroup(
        prisma,
        {
          kind: groupKind,
          courses: section.courses,
          // FIXME: scrape degree units
          units: 0,
        },
        section
      );
    // TODO: make array of root group ids and update all with connnect{many}
      await prisma.concentration.update({
        where: { id: concentration.id },
        data: {
          courseRequirements: {
            connect: [{ id: rootGroupId }],
          },
        },
      });
    }
  }
};

export const updateCatalogDataInDB = async (prisma: PrismaClient) => {
  if (CREATE_COURSES) await createCourses(prisma);

  let degrees;
  if (CREATE_DEGREES) {
    degrees = await createDegrees(prisma);
  } else {
    degrees = await prisma.degree.findMany({
      select: {
        id: true,
        name: true,
        link: true,
        kind: true,
      },
    });
  }
  if (CREATE_GE_REQUIREMENTS || CREATE_COURSE_REQUIREMENTS || CREATE_CONCENTRATIONS) {
    for (let degree of degrees) {
      const requirements = await scrapeDegreeRequirements(degree);
      if (CREATE_GE_REQUIREMENTS)
        await createDegreeGERequirements(prisma, requirements.ge, degree.id);
      if (CREATE_COURSE_REQUIREMENTS)
        await createCourseRequirements(prisma, requirements.courses, degree.id);
      if (CREATE_CONCENTRATIONS)
        await createConcentrations(prisma, requirements.concentrations, degree.id);
    }
  }
  // FIXME: use CourseCodeSchema for ALL course codes to catch weird edge cases and prevent the "not found" errors when connecting
  // FIXME: implement retry logic as connection is very unstable
};

if (require.main === module) {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      // set timeout to unlimited because adding degree requirements is very slow
      db: { url: process.env.DATABASE_URL + "&pool_timeout=0" },
    },
  });
  (async () => await updateCatalogDataInDB(prisma).then(console.log))();
}
