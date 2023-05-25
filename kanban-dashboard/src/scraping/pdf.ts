import * as PDFJS from "pdfjs-dist/legacy/build/pdf";

const PAGE_SCALE = 1.0;
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];

const findClosest = (arr: number[], target: number) => {
  let minDiff = Infinity;
  let minDiffIndex = -1;
  for (let i = 0; i < arr.length; i++) {
    if (Math.abs(target - arr[i]) < minDiff) {
      minDiff = Math.abs(target - arr[i]);
      minDiffIndex = i;
    }
  }
  return minDiffIndex;
};

export const getDegreeRequirementQuarters = async (pdfBytes: Uint8Array) => {
  return PDFJS.getDocument(pdfBytes)
    .promise.then((pdf) => pdf.getPage(1))
    .then(async (page) => {
      const viewport = page.getViewport({ scale: PAGE_SCALE });
      const txt = await page.getTextContent();
      let quarterLocs = new Array(12);
      let quarterNames = new Array(12);
      let quarter = 0;
      let requirements = new Map<string, number[][]>();
      let notesY: null | number = null;

      txt.items.forEach((item: { str: string; transform: number[] }) => {
        const { str, transform } = item;
        // apply viewport transform to get absolute position (and reverse x,y?)
        const tx = PDFJS.Util.transform(viewport.transform, transform);
        const [x, y] = [tx[4], tx[5]];

        let matchedCourseCode;
        let req: null | string = null;
        const isBelowNotes = notesY && y > notesY;
        if (str === "Notes:") {
          // console.log("notesY", y);
          notesY = y;
        } else if (str === "Fall" || str === "Winter" || str === "Spring") {
          quarterLocs[quarter] = x;
          quarterNames[quarter] = str;
          quarter++;
        } else if (
          (matchedCourseCode = str.match(/^([A-Z]+\/)?([A-Z]+ [0-9]+)/))
        ) {
          // first match group is for optional crosslist prefix
          // ^ excludes prereq lists which start with '('
          req = matchedCourseCode[2];
        } else if (str === "Technical Elective") {
          req = "TE";
        } else if (str.includes("Graduation Writing Requirement")) {
          req = "GWE";
        } else if (str.includes("United States Cultural Pluralism")) {
          req = "USCP";
        } else if (
          str.includes("Support") ||
          str.includes("Additional Science")
        ) {
          req = str
            .replace(/\(\d+ units\)[^]?/, "")
            .replace("Support", "")
            .replace(/Electives?/, "")
            .trim();
        } else if (str.match(/^GE /)) {
          req = "GE";
        }

        if (req && !isBelowNotes) {
          if (!requirements.has(req)) {
            requirements.set(req, []);
          } else if (matchedCourseCode && matchedCourseCode[0]) {
            console.warn(
              "Found course with multiple times:",
              matchedCourseCode[1]
            );
          }
          requirements.get(req)!.push([x, y]);
        } else if (req) {
          // log that we're skipping this requirement only when it's actually a requirement
          console.log("Skipping req found in notes:", str);
        }
      });
      if (quarter !== 12) {
        console.warn("expected 12 quarters but found:", quarter);
      }
      const locations = new Map<string, string[][]>();
      // console.log(requirements);
      for (let [req, locs] of requirements) {
        for (let loc of locs) {
          const [x, y] = loc;
          const closestQuarter = findClosest(quarterLocs, x);
          const year = YEARS[Math.floor(closestQuarter / 3)];
          if (!locations.has(req)) {
            locations.set(req, []);
          }
          locations.get(req)!.push([year, quarterNames[closestQuarter]]);
        }
      }
      return locations;
    });
};
