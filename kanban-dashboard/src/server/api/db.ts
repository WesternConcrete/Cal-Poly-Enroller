import { PrismaClient } from "@prisma/client";
import {
  scrapeDegrees,
  scrapeSubjects,
  scrapeCollegesAndDepartments,
  scrapeSubjectCourses,
  scrapeDegreeRequirements,
} from "../../scraping/catalog";

export const updateCatalogDataInDB = async (prisma: PrismaClient) => {
  const [departments, subjects, degrees] = await Promise.all([
    scrapeCollegesAndDepartments().then((colleges) =>
      colleges
        .map((col) => col.departments.map(({ name, id }) => ({ name, id })))
        .flat()
    ),
    scrapeSubjects(),
    scrapeDegrees(),
  ]);
  const skipDuplicates = true;
  // TODO: figure out how to join these into a (single?) Promise.all
  await prisma.department.createMany({ data: departments, skipDuplicates });
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

  await prisma.degree.createMany({ data: degrees, skipDuplicates });
  await prisma.courseRequirement.deleteMany();
  degrees.forEach(async (degree) => {
    const courseCodes = await scrapeDegreeRequirements(degree).then((reqs) =>
      Array.from(reqs.courses.keys())
    );
    courseCodes.forEach(async (courseCode) => {
      console.log(
        "creating course requirement",
        courseCode,
        "for degree",
        degree.name
      );
      await prisma.courseRequirement
        .create({
          data: {
            course: { connect: { code: courseCode } },
            degree: { connect: { id: degree.id } },
          },
        })
        .catch((_e) =>
          console.error(
            "failed creating course requirement",
            courseCode,
            "for degree",
            degree.name,
            _e
          )
        );
    });
  });
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
