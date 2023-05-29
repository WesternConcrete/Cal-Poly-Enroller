import assert from "assert";
import * as cheerio from "cheerio/lib/slim";
import { z } from "zod";

export type Term = "winter" | "spring" | "summer" | "fall";
export type TermNum = 2 | 4 | 6 | 8;

export const TERM_NUMBER = Object.freeze({
  winter: 2,
  spring: 4,
  summer: 6,
  fall: 8,
});

export const TERM_SEASON = Object.freeze({
  2: "winter",
  4: "spring",
  6: "summer",
  8: "fall",
});

export const TERM = z.enum(["winter", "spring", "summer", "fall"]).enum;

export const termCode = (year: number, term: Term | TermNum) =>
  parseInt(
    `2${year > 2000 ? year - 2000 : year}${
      typeof term === "string" ? TERM_NUMBER[term] : term
    }`
  );

export const scrapeCurrentQuarter = async () => {
  const url = "https://registrar.calpoly.edu/academic-calendar";
  const $ = await fetch(url)
    .then((res) => res.text())
    .then(cheerio.load);

  const quarters = [];
  const quarterTables = $("table[id*=TERM]");
  quarterTables.each((i, el) => {
    const year = parseInt($(el).find("caption").text().trim().slice(-4));
    const term = $(el).attr("id").split("TERM")[0].trim().toLowerCase();
    const start = $(el)
      .find("tr")
      .filter((i, row) =>
        $(row).find("td:last-of-type").text().includes("classes begin")
      )
      .children("td:first-of-type")
      .text()
      .trim();
    const startDate = new Date(`${start} ${year}`);
    // e.x. "June 12 - 16"
    const finalsDates = $(el)
      .find("tr")
      .filter((i, row) =>
        $(row)
          .find("td:last-of-type")
          .text()
          .includes("Final examination period")
      )
      .children("td:first-of-type")
      .text()
      .trim();
    // end of finals
    const end =
      finalsDates.split(" ")[0].trim() + " " + finalsDates.split("-")[1].trim();
    const endDate = new Date(`${end} ${year}`);
    quarters.push({
      term,
      year,
      startDate,
      endDate,
      code: termCode(year, term),
    });
  });
  // console.log(quarters);

  const today = new Date();
  let currentQuarterCode = quarters.find(
    (q) => q.startDate < today && q.endDate > today
  )?.code;
  if (!currentQuarterCode) {
    let timeUntilClosestStartDate = Infinity;
    for (let i = 1; i < quarters.length; i++) {
      const timeUntilStartDate = Math.abs(quarters[i].startDate - today);
      const startsAfterToday = quarters[i].startDate > today;
      if (timeUntilStartDate < timeUntilClosestStartDate && startsAfterToday) {
        timeUntilClosestStartDate = timeUntilStartDate;
        currentQuarterCode = quarters[i].code;
      }
    }
    if (!currentQuarterCode) {
      assert(
        quarters[3].term == "spring",
        "Determined that current date was past end of year but last term was not spring. Help!"
      );
      currentQuarterCode = quarters[3].code + 2;
    }
    // TODO: if still no current quarter then it must be spring and the next quarter should be summer but the registrar hasn't updated the page yet
  }
  return currentQuarterCode;
};
