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

const CREATE_DEGREES = true;
const CREATE_COURSES = true;
const CREATE_GE_REQUIREMENTS = false;
const CREATE_COURSE_REQUIREMENTS = false;
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
