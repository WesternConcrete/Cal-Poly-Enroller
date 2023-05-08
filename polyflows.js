require("dotenv").config();

const DOMAIN = "https://polyflowbuilder.duncanapple.io";

(async () => {
    const s = await fetch(DOMAIN)
        .then((res) => res.headers.get("set-cookie").split(";")[0])

    const email = process.env.POLYFLOWBUILDER_EMAIL;
    const password = process.env.POLYFLOWBUILDER_PWORD;

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);
    const login = { email, password };
    console.log(login);

    const headers = new Headers();
    // encode cookies properly
    headers.append("Cookie", s);
    headers.set("Content-Type", "application/x-www-form-urlencoded");

    await fetch(DOMAIN + "/login", {
        method: "POST",
        body: formData,
        headers,
    }).then(res => console.assert(res.status === 200, "Login failed"));

    headers.set("Content-Type", "application/json");
    // headers.set("Cookie", s);
    console.log(headers);

    const defaultFlow = await fetch(DOMAIN + "/api/util/getDefaultFlow", {
        method: "POST",
        headers,
        body: JSON.stringify({
            flowCatalogYear: "2021-2022",
            flowMajor: "52CSCBSU",
            flowConcentration: "",
            options: { fgoRemoveGE: false },
        }),
        redirect: "follow",
    })
    // assert defaultFLow response content type is json
    if (defaultFlow.headers.get("content-type").includes("html")) {
        console.log("sent back html")
    } else if (defaultFlow.headers.get("content-type").includes("json")){
        console.log(await defaultFlow.json())
    }
})();
