/* eslint-disable */
// TODO: remove eslint-disable once this code is being used
import assert from "assert";
import * as cheerio from "cheerio/lib/slim";

const URL =
  "https://cmsweb.pscs.calpoly.edu/psc/CSLOPRD/EMPLOYEE/SA/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL";

const assertNotPageNoLongerAvailable = async (body: string) => {
  assert(!body.includes("This page is no longer available."));
  return body;
};

const initialFetch = await fetch(URL, {
  method: "GET",
  redirect: "manual",
})
  .then((res) => {
    if (res.headers.get("RespondingWithSignOnPage") !== null) {
      throw new Error(
        "RespondingWithSignOnPage - set redirect back to manual instead of follow"
      );
    }
    return res;
  })
  .then((res) => {
    if (res.status === 302) {
      console.log("redirected");
      const cookies = res.headers.get("set-cookie");
      // NOTE: actually going to newURL is not necessary.
      // The only thing stopping us from getting another 302 is the cookies
      const newURL = res.headers.get("location");
      return fetch(newURL, {
        method: "GET",
        headers: { Cookie: cookies },
      });
    } else {
      return res;
    }
  });

const cookies = initialFetch.headers.get("set-cookie");
let ICHiddens = await initialFetch.text().then((page) => {
  const $ = cheerio.load(page);
  const hiddens = $("#win0divPSHIDDENFIELDS").find("input");
  const ics = new Map();
  hiddens.each((i, elem) => {
    ics.set($(elem).attr("name"), $(elem).attr("value"));
  });
  return ics;
});

const headers = new Headers({ Cookie: cookies });
ICHiddens = new URLSearchParams(ICHiddens);
const ICHiddensCopy = new URLSearchParams(ICHiddens);

// select SLCMP as institution
headers.set("Content-Type", "application/x-www-form-urlencoded");
ICHiddens.set("ICAction", "CLASS_SRCH_WRK2_INSTITUTION$31$");
ICHiddens.set("CLASS_SRCH_WRK2_INSTITUTION$31$", "SLCMP");

await fetch(URL, {
  method: "POST",
  headers,
  body: ICHiddens,
})
  .then((res) => res.text())
  .then(assertNotPageNoLongerAvailable)
  .then((page) => {
    const $ = cheerio.load(page);
    assert(
      $("option[value=SLCMP]").attr("selected") === "selected",
      "failed to select SLCMP"
    );
  });

// select current quarter
ICHiddens.set("ICAction", "SLO_SS_DERIVED_STRM");
ICHiddens.set("SLO_SS_DERIVED_STRM", "2234");
await fetch(URL, {
  method: "POST",
  headers,
  body: ICHiddens,
})
  .then((res) => res.text())
  .then(assertNotPageNoLongerAvailable)
  .then((page) => {
    const $ = cheerio.load(page);
    assert(
      $("#SLO_SS_DERIVED_STRM").attr("value") === "2234",
      "failed to change selected term"
    );
  });

// select CS as subject
ICHiddens.set("SSR_CLSRCH_WRK_SUBJECT_SRCH$0", "CSC");

// set course number >=
ICHiddens.set("SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$1", "G");

// set course number >= than 0 (hack to get the minimum 2 search criteria)
ICHiddens.set("SSR_CLSRCH_WRK_CATALOG_NBR$1", "0");

// Show Closed classes as well
// ICHiddens.set("SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$3", "N");

// execute search
ICHiddens.set("ICAction", "CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH");
const searchResultsPage = await fetch(URL, {
  method: "POST",
  headers,
  body: ICHiddens,
})
  .then((res) => res.text())
  .then(assertNotPageNoLongerAvailable)
  .then((page) => {
    if (
      page.includes(
        "Your search will return over 50 classes, would you like to continue?"
      )
    ) {
      console.log("over 50 classes found, continuing");
      // TODO: ignore this problem for now and redo the search with a constraint on the course number
      // ICHiddensCopy.set("ICAction", "#ICSave");
      // ICHiddensCopy.set("ICAJAX", "1");
      // ICHiddensCopy.set("ICNAVTYPEDROPDOWN", "0");
      // ICHiddensCopy.set("ICBcDomData", "Unknownvalue");
      // ICHiddensCopy.set("ICStateNum", "6");
      // console.log(ICHiddensCopy)
      // console.log(headers.get('Cookie'))
      return fetch(URL, {
        method: "POST",
        headers,
        body: ICHiddensCopy,
      })
        .then((res) => res.text())
        .then(assertNotPageNoLongerAvailable);
    } else {
      // TODO: check for other messages and handle
      return page;
    }
  })
  .then((page) => {
    assert(page.includes("Search Results"), "not on search results page");
    return page;
  })
  .then((page) => {
    const $ = cheerio.load(page);
    const courses = $("div[id*=win0divSSR_CLSRSLT_WRK_GROUPBOX2\\$]");
    courses.each((i, elem) => {
      const name = $(elem).find(".PAGROUPBOXLABELLEVEL1").text().trim();
      console.log(name);
      const sections = $(elem).find("span[title=Class\\ Nbr]");
      sections.each((i, elem) => {
        const action = $(elem).find("a").attr("id");
        const num = $(elem).text();
        console.log(num);
      });
    });
  });
// TODO: look into this AppServ link <DIV id='pt_envinfo_win0' Browser='OTHERS/0/WIN' User='SLO_GUEST' DB='CSLOPRD/ORACLE' AppServ='//cslprd400:42005' ToolsRel='8.59.07'></DIV>
// AppServ is a php/apache/mysql server
// ToolsRel is a PeopleSoft/Tools function for formatting the current version
