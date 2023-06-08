import { PrismaClient, Requirement } from "@prisma/client";
import assert from "assert";
import { constants } from "buffer";
import * as cheerio from "cheerio/lib/slim";
import { CheerioAPI } from "cheerio/lib/slim";
import fetchRetry from "fetch-retry";
const fetch = fetchRetry(global.fetch);
import { z } from "zod";

const DOMAIN = "https://catalog.calpoly.edu";

export const DepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string().url(),
});
export type Department = z.infer<typeof DepartmentSchema>;

const CollegeSchema = z.object({
  name: z.string(),
  link: z.string().url(),
  departments: z.array(DepartmentSchema),
});
export type College = z.infer<typeof CollegeSchema>;

export const scrapeCollegesAndDepartments = async () => {
  const URL = DOMAIN + "/collegesanddepartments/";
  const page = await fetch(URL).then((res) => res.text());
  const $ = cheerio.load(page);

  const list = $("#textcontainer.page_content");
  const colleges: College[] = [];
  list.find("p").each((_i, elem) => {
    const collegeName = $(elem).text().trim();
    const collegePath = $(elem).find("a").attr("href");
    assert(collegePath, "collegePath is null");
    const collegeLink = DOMAIN + collegePath;
    const departmentList: z.infer<typeof DepartmentSchema>[] = [];
    $(elem)
      .next("ul")
      .find("li>a")
      .each((_i, elem) => {
        const link = DOMAIN + $(elem).attr("href");
        const id = link
          .split("/")
          .findLast((s) => s.length > 0 && !s.startsWith("#"));
        departmentList.push(
          DepartmentSchema.parse({
            name: $(elem).text().trim(),
            link,
            id,
          })
        );
      });
    colleges.push(
      CollegeSchema.parse({
        name: collegeName,
        link: collegeLink,
        departments: departmentList,
      })
    );
  });
  return colleges;
};

export const BACHELOR_DEGREE_KINDS = [
  "BA",
  "BFA",
  "BS",
  "BArch",
  "BLA",
] as const;

export const BACHELOR_DEGREE_KIND_NAMES = Object.freeze({
  BA: "Bachelor of Arts",
  BFA: "Bachelor of Fine Arts",
  BS: "Bachelor of Science",
  BArch: "Bachelor of Architecture",
  BLA: "Bachelor of Landscape Architecture",
});

export const RequirementTypeSchema = z.enum([
  "major",
  "elective",
  "ge",
  "support",
]);
export type RequirementType = z.infer<typeof RequirementTypeSchema>;

const stripCrosslistInfoFromCourseCode = (courseCode: string) => {
  const match = courseCode.match(/([A-Z]+)(?:\/[A-Z]+)*\s+(\d+)(?:\s+\d+)*/);
  if (!match)
    throw new Error(
      `course code: ${courseCode} did not match the course code regex`
    );
  const [_, code, num] = match;
  courseCode = code + " " + num;
  if (!courseCode.match(/^[A-Z]+\s\d+$/))
    throw new Error(
      `resulting course code: ${courseCode} from stripping crosslist info is not a valid course code`
    );
  return courseCode;
};

// NOTE: it is expected that information from crosslistings can be parsed in subject course
// lists and handled properly when using degree course requirements
const CourseCodeSchema = z.string().transform(stripCrosslistInfoFromCourseCode); // .regex(/^[A-Z]+\s\d+$/);

export type CourseCode = z.infer<typeof CourseCodeSchema>;

// TODO: decide whether this is usefull
// export const RequirementSchema = z.object({
//   kind: RequirementTypeSchema.or(z.string()),
//   fulfilledBy:
//
// });

export const RequirementCourseSchema = z.object({
  kind: RequirementTypeSchema.or(z.string()).nullable(),
  code: CourseCodeSchema,
  units: z.number(),
  title: z.string(),
});

export type RequirementCourse = z.infer<typeof RequirementCourseSchema>;

export const DegreeSchema = z.object({
  name: z.string(),
  kind: z.enum(BACHELOR_DEGREE_KINDS),
  link: z.string().url(),
  id: z.string(),
  // departmentId: z.string(),
});

export type Degree = z.infer<typeof DegreeSchema>;

const GEAreaCodeRE = /[ABCDEF][1234]/;
const GEDivisionCodeRE = /(Upper|Lower)-Division [ABCDEF]( Elective)?/;
const GeAreaRE = /Area [ABCDEF]( Elective)?/;

const GEDivisionSubAreaRE = /(Upper|Lower)-Division( Elective)?/;
const GESubAreaVariantSchema = z.union([
  z.string().regex(GEAreaCodeRE),
  z.string().regex(GEDivisionCodeRE),
  z.literal("Elective"),
]);

const GEAreasEnumSchema = z.enum(["A", "B", "C", "D", "E", "F", "ELECTIVE"]);

type GEArea = z.infer<typeof GEAreasEnumSchema>;

export const GeRequirementSchema = z.object({
  area: GEAreasEnumSchema,
  subarea: GESubAreaVariantSchema,
  units: z.number().nonnegative(),
  // TODO: constraints (C1 or C2) / fullfilled by (B3 = lab w/ B1 or B2 course)
});

export type GeRequirement = z.infer<typeof GeRequirementSchema>;

export type CourseRequirement =
  | { kind: "or"; courses: CourseRequirement[]; units: number }
  | { kind: "and"; courses: CourseRequirement[]; units: number }
  | { kind: "course"; course: CourseCode; units: number };

const CourseRequirementSchema: z.ZodType<CourseRequirement> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("or"),
      courses: z.array(CourseRequirementSchema),
      units: z.number(),
    }),
    z.object({
      kind: z.literal("and"),
      courses: z.array(CourseRequirementSchema),
      units: z.number(),
    }),
    z.object({
      kind: z.literal("course"),
      course: CourseCodeSchema,
      units: z.number(),
    }),
  ])
);

const DegreeRequirementSectionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("major"),
    courses: z.array(CourseRequirementSchema),
  }),
  z.object({
    kind: z.literal("elective"),
    electiveKind: z.string(),
    courses: z.array(CourseRequirementSchema),
  }),
  z.object({
    kind: z.literal("support"),
    supportKind: z.string(),
    courses: z.array(CourseRequirementSchema),
  }),
  z.object({ kind: z.literal("ge") }),
]);
export type DegreeRequirementSection = z.infer<
  typeof DegreeRequirementSectionSchema
>;

export type DegreeRequirementSectionInfo =
  | { kind: null; header: string }
  | { kind: RequirementType }
  | { kind: "elective"; electiveKind: string }
  | { kind: "support"; supportKind: string | null };

export const DegreeRequirementsSchema = z.lazy(() =>
  z.object({
    courses: z.array(DegreeRequirementSectionSchema),
    ge: z.array(GeRequirementSchema),
    concentrations: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        link: z.string(),
        courses: z.array(DegreeRequirementSectionSchema),
      })
    ),
  })
);

export type DegreeRequirements = z.infer<typeof DegreeRequirementsSchema>;

const parseDegreeRequirementSectionHeader = (
  $: CheerioAPI,
  headerElem: cheerio.Element
): DegreeRequirementSectionInfo => {
  let kind: RequirementType | null = null;
  let sectionTitle = $(headerElem)
    .find("span")
    .text()
    .replace(/\(.*\)$/, "")
    .trim();
  let electiveKind;
  let supportKind = null;
  if (sectionTitle.includes("MAJOR COURSES")) {
    kind = "major";
  } else if (!!sectionTitle.match(/^[\w\/\s\-]+ electives?$/i)) {
    // FIXME: include the type of elective
    kind = "elective";
    electiveKind = sectionTitle.replace(/electives?/i, "").trim();
  } else if (sectionTitle.includes("GENERAL EDUCATION")) {
    kind = "ge";
  } else if (sectionTitle.includes("SUPPORT COURSES")) {
    kind = "support";
  } else {
    kind = "support";
    supportKind = sectionTitle;
  }
  if (electiveKind) {
    if (kind !== "elective")
      throw new Error("found elective without elective kind: " + sectionTitle);
    return { kind, electiveKind };
  }
  if (kind === "support") {
    return { kind, supportKind };
  }
  if (!kind) {
    return { kind, header: sectionTitle };
  }
  return { kind };
};

// select from the following blocks:
// If we're in a sftf block the courses are in one of the following formats:
// a)
// [course]
// or [course]
// or [course]
// ... until row not starting with "or"
//
// b)
// [course]
// or
// [course]
// or
// ... until there are two [course] rows not separated by "or" row
//
// c)
// [course]
// [course]
// [course]
// ... until another sftf block or areaheader block (because y tf not)
//
// To differentiate these cases the in_sftf flag signifies if we're in a
// stft block and the sftf_sep is either "or" (for cases a or b) or null (for case c)
//
// Note that or conditions can occur OUTSIDE of a sftf block in which
// case we get our FOURTH and (hopefullly) final option:
// d)
// [course]
// or [course]
/// mapping of course code to meta information about the course (such as whether it is a support/major/etc)

export const parseCourseRequirementsTable = (
  $: cheerio.CheerioAPI,
  table: cheerio.Element,
  ctx: { kind: "degree" | "concentration"; name: string; link: string }
) => {
  const courses = new Map();
  const parsedClass = "parsed";

  const parseRowUnits = (row: cheerio.Element) => {
    // TODO: error checking
    let unitsStr = $(row).find("td.hourscol").text();
    let units = unitsStr == "" ? 0 : parseInt(unitsStr);
    return units;
  };
  const markRowAsParsed = (
    rowOrIndex: number | cheerio.Element,
    row?: cheerio.Element
  ) => {
    if (typeof rowOrIndex !== "number") {
      row = rowOrIndex;
    }
    if (!row) throw new Error("trying to mark undefined row as parsed");
    $(row).addClass(parsedClass);
  };
  const parseCourseRow = (row: cheerio.Element): CourseRequirement => {
    let codeCol = $(row).find("td.codecol");
    if (codeCol.length !== 1) {
      throw new Error(
        `tried to parse row: ${$(row).text()} without codecol ${ctx.link}`
      );
    }

    let units = parseRowUnits(row);

    markRowAsParsed(row);

    let code = $(codeCol).find("a.code");
    let course;
    // TODO: check for orclass
    if (code.length > 1 && $(row).is(":has(span:contains(&))")) {
      // and group
      // TODO: check to make sure its an and row
      let courses = $(code)
        .map((_, c) => ({ kind: "course", course: $(c).text(), units: 0 }))
        .get();
      course = { kind: "and", courses, units };
    } else if (codeCol.hasClass("orclass")) {
      course = {
        kind: "or",
        courses: [{ kind: "course", course: $(code).text(), units: 0 }],
        units,
      };
    } else {
      course = { kind: "course", course: $(code).text(), units };
    }
    return CourseRequirementSchema.parse(course);
  };
  const parseListOfCourseRows = (rows: cheerio.Cheerio<cheerio.Element>) => {
    let courses: CourseRequirement[] = [];
    rows.each((_, row) => {
      if ($(row).is(":has(span.courselistcomment)")) {
        // TODO: parsing comments (especially unit counts)
        console.log("comment:", $(row).text());
        return;
      }
      let course = parseCourseRow(row);
      if (course.kind === "or") {
        let prevCourse = courses.pop();
        if (!prevCourse) {
          console.error(
            "found or row:",
            $(row).text(),
            "with no preceeding row"
          );
          return;
        }
        switch (prevCourse.kind) {
          case "or":
            prevCourse.courses.push(...course.courses);
            course = prevCourse;
            break;
          case "course":
          case "and":
            course.units = prevCourse.units;
            prevCourse.units = 0;
            course.courses.push(prevCourse);
            break;
        }
      }
      courses.push(course);
    });
    return courses;
  };
  // some of the concentrations have no top level header for the course list
  // if that is the case we add one add one with the label Tech Electives
  if (
    ctx.kind === "concentration" &&
    $(table).is(
      ":has(tr.firstrow:has(td.codecol,span.courselistcomment:not(.areaheader)))"
    )
  ) {
    let txt = "Technical Electives";
    if ($(table).find("tr.firstrow").is(":has(td.codecol)")) {
      txt = "MAJOR COURSES";
    }
    $(
      `<tr class="areaheader"><td><span class="courselistcomment areaheader">${txt}</span></td></tr>`
    ).insertBefore("tr.firstrow");
  }
  // TODO: consider just reparsing the page when a non-header header is found instead of checking each comment for each page
  // TODO: consider making sections not be the result of mapping but of pushing found sections to list and create way to modify the lists of
  // headers/sftf comments then use if statements instead of the following replacements
  let comments = $(table)
    .find("tr:has(span.courselistcomment)")
    .each((_, c) => {
      const txt = $(c).find("span").text();
      let match;
      // sometimes things that should be headers but are comments instead :/
      // see Mathematics/Statistics Elective on the csc game-development concentration page
      if (!$(c).hasClass("areaheader") && !$(c).prev().hasClass("areaheader")) {
        let header = parseDegreeRequirementSectionHeader($, c);
        if (
          header.kind !== null &&
          header.kind === "support" &&
          !header.supportKind
        ) {
          console.log("making comment:", $(c).text(), "a header");
          $(c).addClass("areaheader");
          return;
        }
      }
      const approvedBelowRE =
        /up to (\d+) units may be taken from the approved ([\w\s]+) listed below/i;
      if (!!(match = txt.match(approvedBelowRE))) {
        const [_, units, sectionTitle] = match;
        $(c).replaceWith(`<tr class="areaheader">${sectionTitle}</tr>
                             <tr>
                                <td> <span class="courselistcomment"> Select from the following</span></td>
                                <td class="hourscol">${units}</td>
                            </tr>`);
      }
    });

  const sectionHeaders = $(table).find("tr.areaheader");
  const SFTF_RE = /\s*Select( one sequence)? from the following.*/;
  // TODO: check if table begins with course row (in concentrations) and figure out how to handle that
  const sections = $(sectionHeaders)
    .get()
    .map((headerElem) => {
      $(headerElem).addClass(parsedClass);
      const sectionRows = $(headerElem).nextUntil("tr.areaheader,tr.listsum");
      const sftfBlocks: CourseRequirement[] = $(sectionRows)
        .filter("tr:has(span.courselistcomment)")
        .filter(
          (_i, e) => !!$(e).find("span.courselistcomment").text().match(SFTF_RE)
        )
        .get()
        .map((sftf) => {
          // see select from the following blocks comment above
          let orRow = $(sftf).next().next();
          let courses;
          if ($(orRow).is(":has(td.orclass)")) {
            console.log("orclass");
            courses = $(orRow)
              .nextUntil(":not(:has(td.orclass))")
              .add(orRow)
              .add($(orRow).prev());
          } else if ($(orRow).is(":has(span.courselistcomment:contains(or))")) {
            console.log("dedicated or row");
            courses = $(orRow).prev().add($(orRow).next());
            orRow.addClass(parsedClass);
            if ($(orRow).next().next().text() === "or") {
              console.warn(
                "found more than two courses in or list separated by dedicated or rows...skipping"
              );
            }
          } else {
            courses = $(sftf).nextUntil(
              "tr.areaheader,tr:has(span.courselistcomment:contains(Select)),tr.listsum"
            );
          }
          // FIXME: remove this filterSelector and parse comments
          courses = parseListOfCourseRows(courses.filter(":has(td.codecol)"));
          $(sftf).addClass(parsedClass);
          return { kind: "or", courses, units: parseRowUnits(sftf) };
        });
      const remainingRows = $(sectionRows).not(`tr.${parsedClass}`);
      let remainingCourses: CourseRequirement[] =
        parseListOfCourseRows(remainingRows);

      const section = {
        ...parseDegreeRequirementSectionHeader($, headerElem),
        courses: sftfBlocks.concat(remainingCourses),
      };
      if (!section.kind) {
        console.error("failed to parse header:", $(headerElem).text());
      }
      return section;
    });
  const unparsedRows = $(table)
    .find("tr")
    .not("." + parsedClass);
  if (unparsedRows.length > 0) {
    console.error(
      "did not parse:",
      unparsedRows.get().map((e) => $(e).text())
    );
  }
  return sections;
};

const parseGeCourseRequirementsTable = (
  $: cheerio.CheerioAPI,
  table: cheerio.Element
) => {
  // FIXME: parse ge "constraints" (C1 or C2, three different prefixes, etc)
  const requirements: GeRequirement[] = $(table)
    .find("tr")
    .filter(":not(:is(.areaheader,.listsum))")
    .map((_i, tr) => {
      const label = $(tr).find("td").first().text();
      let units = parseInt($(tr).find("td.hourscol").text().trim());
      if (isNaN(units)) {
        let cSubjectPrefixesWarningStr =
          "Lower-division courses in Area C must come from three different subject prefixes.";
        if (label.includes(cSubjectPrefixesWarningStr)) {
          return null;
        }
      }
      let match;
      let area = null;
      let subarea = null;
      if ((match = label.match(/^([ABCDEF])([1234])?$/))) {
        let num;
        [subarea, area, num] = match;
        console.log(area, subarea);
      } else if ((match = label.match(/Area ([ABCDEF])( Elective)/))) {
        let _, elective;
        [_, area, elective] = match;
        if (!!elective) {
          subarea = elective.trim();
        }
        console.log("Area", area, subarea);
      } else if (
        (match = label.match(
          /((?:Upper|Lower)-Division) ([A-F])( Elective)?s?/
        ))
      ) {
        let _, elective;
        [_, subarea, area, elective] = match;
        subarea = subarea.replace("-", "") + (elective ? elective.trim() : "");
        console.log(subarea, area, elective);
      }
      if (area === null) {
        if (label.includes("Select courses from two different areas")) {
          return null;
        } else if (label.includes("GE Electives")) {
          console.assert(isNaN(units), "electives does not have NaN units");
        } else {
          console.error("unrecognized ge:", label);
          return null;
        }
      }
      if (isNaN(units)) {
        units = 0;
        const rowText = $(tr).text();
        const b3OneLabWarningStr =
          "One lab taken with either a B1 or B2 course";
        const twoAreasWarning = "Select courses from two different areas";
        if (!rowText.includes(twoAreasWarning) && area !== "B3") {
          console.error("could not determine why units for:", label, "was NaN");
        }
      }
      return { area, subarea, units };
    })
    .get()
    .filter((req) => !!req && !!req.area);
  console.dir(requirements, { depth: null });
  return requirements;
};

export const scrapeDegreeRequirements = async (degree: Degree) => {
  const $ = cheerio.load(await fetch(degree.link).then((res) => res.text()));
  let requirements: DegreeRequirements = {} as DegreeRequirements;

  // TODO: Parse footers (sc_footnotes)
  const tables = $("table.sc_courselist");

  tables.each((_ti, table) => {
    // page has flat structure and this is a way to find the previous h2 element (prevUntil is exclusive)
    const titleElem = $(table).prevUntil("h2").last().prev();
    const title = $(titleElem).text().trim();
    if (title === "Degree Requirements and Curriculum") {
      requirements.courses = parseCourseRequirementsTable($, table, degree);
    } else if (title === "General Education (GE) Requirements") {
      requirements.ge = parseGeCourseRequirementsTable($, table);
    } else {
      console.warn("Unrecognized table with title:", title);
    }
  });
  const concentrationsList = $("h2:contains(Concentration)+ul>li a")
    .get()
    .map((elem) => ({
      name: $(elem).text(),
      link: "https://catalog.calpoly.edu" + $(elem).attr("href"),
    }));
  const concentrations = await Promise.all(
    concentrationsList.map(async (conc) => {
      if (!conc.link) throw new Error(`Concentration ${conc.name} has no link`);
      const $ = await fetch(conc.link)
        .then((res) => res.text())
        .then(cheerio.load);
      const tables = $("table.sc_courselist").get();
      // FIXME: uncomment this
      const ctx: { kind: "concentration"; link: string; name: string } = {
        ...conc,
        kind: "concentration",
      };
      conc.courses = tables
        .map((table) => parseCourseRequirementsTable($, table, ctx))
        .flat();
      const linkSegments = conc.link
        .split("/")
        .filter((s) => s.length > 0 && !s.startsWith("#"));
      conc.id = linkSegments.at(-1);
      return conc;
    })
  );
  requirements.concentrations = concentrations;

  // FIXME: using unit counts to determine how many classes of sftf/or groups are required
  // TODO: check for correctness by counting the units and comparing to the degree's unit count
  // could keep total units count in groups and check against stated unit totals

  return requirements;
};

export const scrapeDegrees = async () => {
  const URL = "https://catalog.calpoly.edu/programsaz/";
  const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
  const majorRE = /(.+),\s+(B\w+)/;
  const degrees: Degree[] = [];
  $("a[name=bachelordegrees]")
    .nextUntil("a[name=concentrations]")
    .filter("p.plist:has(a[href])") // only <a> with href
    .each((i, elem) => {
      const [_matched, name, kind] = $(elem).text().match(majorRE) ?? [];
      const link = DOMAIN + $(elem).find("a").attr("href");
      const linkSegments = link
        .split("/")
        .filter((s) => s.length > 0 && !s.startsWith("#"));
      const id = linkSegments.at(-1);
      const departmentId = linkSegments.at(-2);
      degrees.push(DegreeSchema.parse({ name, kind, link, id, departmentId }));
    });
  return degrees;
};

// const TermSchema = z.enum(["F", "W", "SP", "SU", "TBD"]);

const CourseSchema = z.object({
  code: CourseCodeSchema,
  title: z.string(),
  // subjectCode: z.string(),
  number: z.number(),
  description: z.string(),
  // TODO: turn termsTypicallyOffered into bitmask based on 2,4,6,8 term codes
  termsTypicallyOffered: z.string(), // z.array(TermSchema),
  // if not range minUnits is maxUnits
  minUnits: z.number(),
  maxUnits: z.number(),
});

type Course = z.infer<typeof CourseSchema>;

export const scrapeSubjectCourses = async (subjectCode: string) => {
  const COURSE_INFO_RE = /(([A-Z]+)\s+(\d+))\. (.*?)\.?$/;
  const URL = `https://catalog.calpoly.edu/coursesaz/${subjectCode.toLowerCase()}/`;
  const $ = cheerio.load(await fetch(URL).then((res) => res.text()));

  const courses = $(".courseblock");
  const scrapedCourses: Course[] = [];
  courses.each((i, course) => {
    const title_block = $(course).find(".courseblocktitle");
    const units_str = $(title_block).find("strong span").text().trim();
    let minUnits = 0,
      maxUnits = 0;
    const units_num = units_str.replace(" units", "");
    if (units_num.includes("-")) {
      [minUnits, maxUnits] = units_num.split("-").map(Number);
    } else {
      let units = parseInt(units_num);
      minUnits = units;
      maxUnits = units;
    }
    let [_, code, subjectCode, numStr, title] =
      $(title_block)
        .find("strong")
        .text()
        .replace(units_str, "")
        .trim()
        .match(COURSE_INFO_RE) ?? [];
    const number = parseInt(numStr);
    const info_block = $(course).find(".courseextendedwrap");
    let termsTypicallyOffered = null;
    $(info_block)
      .find("p")
      .each((i, info_field) => {
        const field_text = $(info_field).text().trim();
        if (field_text.startsWith("Term Typically Offered:")) {
          // normalize terms offered list so it is in csv format without extra spaces
          termsTypicallyOffered = field_text
            .replace("Term Typically Offered: ", "")
            .split(/, ?/)
            .join(",");
        }
        // TODO: "catolog:" field specifying the requirements it fulfills
        // TODO: prerequisite field
        // TODO: "CR/NC" field
        // TODO: crosslisted as (+ field in db schema)
      });
    const description = $(course).find(".courseblockdesc").text().trim();
    scrapedCourses.push(
      CourseSchema.parse({
        number,
        code,
        title,
        termsTypicallyOffered,
        minUnits,
        maxUnits,
        description,
      })
    );
  });
  return scrapedCourses;
};

export const SubjectSchema = z.object({
  name: z.string(),
  code: z.string(),
});

export type Subject = z.infer<typeof SubjectSchema>;

export const scrapeSubjects = async () => {
  // TODO: scrape ge areas, gwr, uscp, etc from same page
  const subjectRE = /(.+)\s+\(([A-Z ]+)\)/;

  const URL = "https://catalog.calpoly.edu/coursesaz/";
  const $ = cheerio.load(await fetch(URL).then((res) => res.text()));
  const subjects: Subject[] = [];
  $("a.sitemaplink").each((_i, elem) => {
    const txt = $(elem).text();
    const [_matched, name, code] = txt.match(subjectRE) ?? [];
    subjects.push(SubjectSchema.parse({ name, code }));
  });
  return subjects;
};

const GESubAreaDataSchema = z
  .object({
    constraints: z.array(z.string()).default([]),
    name: z.string().nullable().default(null),
    fullfilledBy: z.array(CourseCodeSchema).default([]),
    description: z.string().nullable().default(null),
  })
  .default({});

type GESubAreaData = z.infer<typeof GESubAreaDataSchema>;

const GEAreaDataSchema = z
  .object({
    name: z.string().default(""),
    constraints: z.array(z.string()).default([]),
    subareas: z.record(GESubAreaVariantSchema, GESubAreaDataSchema).default({}),
    fullfilledBy: z.array(CourseCodeSchema).default([]),
  })
  .default({});

type GEAreaData = z.infer<typeof GEAreaDataSchema>;

export const GEDataSchema = z.map(GEAreasEnumSchema, GEAreaDataSchema);
type GEData = z.infer<typeof GEDataSchema>;

/** Returns courses that fulfill ge requirements for each area */
export const scrapeCourseGEFullfillments = async () => {
  const url =
    "https://catalog.calpoly.edu/generalrequirementsbachelorsdegree/#GE-Requirements";
  const $ = await fetch(url)
    .then((res) => res.text())
    .then(cheerio.load);
  // TODO: use high-unit/standard info for verification against major ge requirement scraping

  const sections: GEData = new Map();
  const areaTables = $("table.tbl_transfercredits").filter(
    (_i, table) =>
      // do not include info tables that are adjacent to sc_courselist tables
      $(table).next(":not(.sc_courselist)").length > 0 &&
      $(table).prev(":not(.sc_courselist)").length > 0
  );
  areaTables.each((_i, table) => {
    const info: GEAreaData = GEAreaDataSchema.parse({});
    const tbody = $(table).find("tbody");
    let areaLabel = $(tbody)
      .find("tr.firstrow")
      .find("td.column0")
      .first()
      .text()
      .trim();
    let area: GEArea;
    if (areaLabel.includes("GE ELECTIVES")) {
      info.name = areaLabel;
      area = "ELECTIVES";
      // TODO: include limit info (only area B C D)
    } else {
      let match = areaLabel.match(/\(AREA ([ABCDEF])\)/);
      if (!match)
        throw new Error(
          "unrecognized ge area label for section: ".concat(areaLabel)
        );
      area = GEAreasEnumSchema.parse(match[1]);
      areaLabel = areaLabel.replace(match[0], "").trim();
      info.name = areaLabel;
    }

    $(tbody)
      .find("tr:not(.firstrow)")
      .find("td.column0")
      .get()
      .map((labelElement) => $(labelElement).text().trim())
      .filter((label) => {
        return !!label && !["Unit Sub-total", "GE TOTAL"].includes(label);
      })
      .forEach((label) => {
        let match;
        let subarea;
        let subareaInfo: GESubAreaData = GESubAreaDataSchema.parse({});
        if (
          (match = label.match(
            /(?:-?(Writing Intensive))|(?:\s-\s((?:[\w \d,;-]|\(Standard\))+))/
          ))
        ) {
          let subconstraint = match[1] ?? match[2];
          if (match[1]) subareaInfo.constraints.push(subconstraint);
          label = label.replace(match[0], "").replace("()", "").trim();
          // still push the label at the end
          match = undefined;
        }
        if ((match = label.match(new RegExp(`\\((${area}([1234])?)\\)`)))) {
          let [matched, _subarea, num] = match;
          label = label.replace(matched, "").replace(/1$/, "").trim();
          if (num) {
            subarea = _subarea;
            subareaInfo.description = label;
          }
        }
        if (
          (match = label.match(
            /((?:Upper|Lower)-Division) [A-F]( Elective)?s?/
          ))
        ) {
          let [matched, _subarea, elective] = match;
          _subarea += elective ?? "";
          subarea = _subarea;
          label = label.replace(matched, "").trim();
          subareaInfo.description = label ?? null;
        }
        if ((match = label.match(/(Area [A-F] Elective)/))) {
          subarea = "Elective";
        }
        if (!subarea) {
          info.constraints.push(label);
          if (subareaInfo.constraints.length > 0) {
            console.warn(
              "adding subconstraints:",
              subareaInfo.constraints,
              "to area:",
              area,
              "because no subarea was found"
            );
          }
          return;
        }
        info.subareas[subarea] = subareaInfo;
      });
    sections.set(area, info);
  });
  const courseTables = $("table.sc_courselist:not(div#uscptextcontainer *)");

  courseTables.each((_i, table) => {
    const headerElement = $(table)
      .prev("table.sc_sctable")
      .find("tbody")
      .find("tr.lastrow")
      .find("td.column0")
      .get();

    const headerInfo = headerElement.map((e) => $(e).text().trim());
    let [title, ...meta] = headerInfo;
    const commentHeader = $(table)
      .find("tr.firstrow span.courselistcomment.areaheader")
      .first()
      .text()
      .trim();
    if (commentHeader && commentHeader !== "") title = commentHeader;
    console.log("title:", title);
    // title = commentHeader;
    // TODO: updating title when "td>div.courselistcomment" is encountered
    // TODO: parsing "ge" from title

    const courses = z.array(CourseCodeSchema).parse(
      $(table)
        .find("td.codecol")
        .map((_i, codeCol) => $(codeCol).text().trim())
        .get()
    );
    if (!title) {
      console.error("found courses for table with no title", { courses });
      return;
    }
    let match;
    if (title.includes("GE ELECTIVES")) {
      sections.get("ELECTIVES")!.fullfilledBy = courses;
    } else if ((match = title.match(/((?:Upper|Lower)-Division) ([A-F])/))) {
      const [_, division, area] = match;
      const subarea = sections.get(GEAreasEnumSchema.parse(area))!.subareas[
        division
      ];
      if (!subarea) {
        console.warn(
          "creating new found subarea:",
          division,
          "for",
          area,
          "because it was found in the course list"
        );
        sections.get(GEAreasEnumSchema.parse(area))!.subareas[division] =
          GESubAreaDataSchema.parse({
            fulfilledBy: courses,
          });
      } else subarea.fullfilledBy = courses;
    } else if ((match = title.match(/(([A-F])[1-4])/))) {
      const [_, subarea, area] = match;
      sections.get(GEAreasEnumSchema.parse(area))!.subareas[
        subarea
      ].fullfilledBy = courses;
      if (subarea === "B2" || subarea === "B1") {
        const b3courses = $(table)
          .find('td:contains("& B3")')
          .map((_i, b3desc) => $(b3desc).prev().text().trim())
          .get();
        const b3 = sections.get(GEAreasEnumSchema.parse(area))!.subareas.B3;
        b3.fullfilledBy = b3.fullfilledBy ?? [];
        b3.fullfilledBy.push(...b3courses);
      }
    }
    // FIXME: (B2 & B3)

    // sections.set(ge.ge, ge);
  });
  const uscpCourses = $("div#uscptextcontainer table.sc_courselist")
    .first()
    .find("td.codecol")
    .map((_i, codeCol) => $(codeCol).text().trim())
    .get();
  sections.set("USCP", GEAreaDataSchema.parse({ fullfilledBy: uscpCourses }));
  // FIXME: GWR courses
  // FIXME: extract parsing of these tables into separate functtions
  // to allow all ge's, uscp, gwr, and subjects from https://catalog.calpoly.edu/coursesaz

  // return Array.from(sections.values());
  return sections;
};
