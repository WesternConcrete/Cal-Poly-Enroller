import { Course, GESubArea, PrismaClient } from "@prisma/client";
import {
  scrapeDegrees,
  scrapeSubjects,
  scrapeCollegesAndDepartments,
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
const CREATE_COURSE_REQUIREMENTS = true;
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

const createCourseRequirements = async (
  prisma: PrismaClient,
  sections: DegreeRequirementSection[],
  degreeId: string
) => {
  for (const section of sections) {
    if (section.kind === "ge") continue;
    if (section.courses.length === 0) continue;

    const createGroup = async (group: CourseRequirement): Promise<number> => {
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
        let subGroupId = await createGroup(subGroup);
        childGroups.push(subGroupId);
      }

      let courseKindInfo = null;
      if (section.kind === "elective") {
        courseKindInfo = section.electiveKind;
      } else if (section.kind === "support") {
        courseKindInfo = section.supportKind;
      }

      const createdGroup = await prisma.courseRequirementGroup.create({
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
      }).catch((e) => { console.error("failed to create group:",group); throw e});
      return createdGroup.id;
    };

    let groupKind: "or" | "and" = section.kind === "elective" ? "or" : "and";
    let rootGroupId = await createGroup({
      kind: groupKind,
      courses: section.courses,
      // FIXME: scrape degree units
      units: 0,
    });

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
  if (CREATE_GE_REQUIREMENTS || CREATE_COURSE_REQUIREMENTS) {
    for (let degree of degrees) {
      const requirements = await scrapeDegreeRequirements(degree);
      if (CREATE_COURSE_REQUIREMENTS)
        await createCourseRequirements(prisma, requirements.courses, degree.id);
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
