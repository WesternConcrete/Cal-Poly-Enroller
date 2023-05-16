import { log } from "console";
import puppeteer from "puppeteer";

const URL =
    "https://cmsweb.pscs.calpoly.edu/psc/CSLOPRD/EMPLOYEE/SA/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL";

const browser = await puppeteer.launch({ headless: false});

const page = await browser.newPage();
await page.goto(URL);


await page.evaluate(() => {
    submitAction_win0(document.win0, "DERIVED_CLSRCH_SSR_EXPAND_COLLAPS$149$$1")
});

const institutionSelect = await page.$("#CLASS_SRCH_WRK2_INSTITUTION\\$31\\$");
await institutionSelect.evaluate((select) => {
    addchg_win0(select);
    submitAction_win0(select.form,select.id);
});
// await institutionSelect.select("SLCMP");

// const additionalCriteriaButton = await page.$("#DERIVED_CLSRCH_SSR_EXPAND_COLLAPS\\$149\\$\\$1");
// await additionalCriteriaButton.click();

// const subjectSelect = await page.$("#SSR_CLSRCH_WRK_SUBJECT_SRCH\\$0");
// await subjectSelect.select("CSC");
// await subjectSelect.evaluate(select => select.value="CSC")

// const campusSelect = await page.waitForSelector("#SSR_CLSRCH_WRK_CAMPUS\\$14");
// await campusSelect.select("MAIN");

// const termInput = await page.$("#SLO_SS_DERIVED_STRM");
// await termInput.type("2234");
// await termInput.evaluate((term) => term.value = "2234");

// const searchButton = await page.$("#CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH")
// await searchButton.click()

// await page.waitForSelector('.PAPAGETITLE:contains("Search Results")')
// await page.waitForResponse();
// while (true) {
//     continue;
// }
browser.disconnect()

// await page.screenshot({ path: "./ss.png" });
// await browser.close();
