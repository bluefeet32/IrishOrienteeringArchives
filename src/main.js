
function capitalizeFirstLetter(str) {
    // Check if the input string is not empty
    if (str.length === 0) {
        return str;
    }

    // Capitalize the first character and concatenate it with the rest of the string
    return str.charAt(0).toUpperCase() + str.slice(1);
}

pointsFromPosition = {
    1: 10,
    2: 8,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
}

const getResults = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.currentYear = params.get("year");
            this.currentCourse = params.get("course");
            this.currentClass = params.get("class");

            this.years = await (await fetch("./data/years.json")).json();
            if (!this.currentYear) this.currentYear = this.years[0];
            await this.fetchYearData();

            if (!this.currentCourse || !this.courses.includes(this.currentCourse)) this.currentCourse = this.courses[0];
            if (!this.currentClass || !this.classes.includes(this.currentClass)) this.currentClass = this.classes[0];
            this._setUrlParams();

        },
        years: [],
        currentYear: "",
        yearData: {},
        get courses() { return Object.keys(this.yearData); },
        currentCourse: "",
        get classes() { return Object.keys(this.yearData?.[this.currentCourse]?.classes || {}); },
        currentClass: "",
        get results() { return this._indexResults(this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || []); },
        get results() { return this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || []; },
        async onClickYear(year) {
            this.currentYear = year;
            await this.fetchYearData();
            this._setUrlParams();
        },
        onClickCourse(course) {
            this.currentCourse = course;
            this._setUrlParams();
        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;
            this._setUrlParams();
        },
        async fetchYearData() {
            this.yearData = await (await fetch(`./data/${this.currentYear}.json`)).json();
        },
        _setUrlParams() {
            const params = new URLSearchParams(document.location.search);
            params.set("class", this.currentClass);
            params.set("course", this.currentCourse);
            params.set("year", this.currentYear);
            history.replaceState(null, null, "?" + params.toString());
        }
    };
};

const getRunner = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.name = params.get("name");
            this.currentCourse = params.get("course")
            this.currentClass = params.get("class")

            await this.loadAllYears();
            this.allResults = this.formatResults();

            if (!this.currentClass || !this.classes.includes(this.currentClass)) this.currentClass = this.classes[0];
            if (!this.currentCourse || !this.courses.includes(this.currentCourse)) this.currentCourse = this.courses[0];
            this._setUrlParams();

            console.log(this.allResults);
        },
        name: "",
        allYears: {},
        async loadAllYears() {
            const years = await (await fetch("./data/years.json")).json();
            const data = {};
            for (const year of years) {
                data[year] = await (await fetch(`./data/${year}.json`)).json();
            }
            this.allYears = data;
        },
        allResults: {},
        get classes() { return Object.keys(this.allResults); },
        get courses() { return Object.keys(this.allResults?.[this.currentClass] || {}); },
        get currentResults() {
            return (this.allResults?.[this.currentClass]?.[this.currentCourse] || []).sort((a, b) => b.year - a.year);
        },
        currentClass: "",
        currentCourse: "",
        onClickCourse(course) {
            this.currentCourse = course;
            this._setUrlParams();
        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;
            this._setUrlParams();
        },
        formatResults() {
            const data = {};
            for (const [year, courses] of Object.entries(this.allYears)) {
                for (const [course, courseData] of Object.entries(courses)) {
                    for (const [ageClass, ageClassData] of Object.entries(courseData.classes)) {
                        const result = ageClassData.results.find(runner => runner.name === this.name);
                        if (result) {
                            points = result.position ? pointsFromPosition[result.position] : null
                            if (!data.hasOwnProperty(ageClass)) data[ageClass] = {};
                            if (!data[ageClass].hasOwnProperty(course)) data[ageClass][course] = [];
                            data[ageClass][course].push({ ...result, year, points});
                        }
                    }
                }
            }
            return data;
        },
        _setUrlParams() {
            const params = new URLSearchParams(document.location.search);
            params.set("name", this.name);
            params.set("class", this.currentClass);
            params.set("course", this.currentCourse);
            history.replaceState(null, null, "?" + params.toString());
        }
    };
};

const getRankings = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.currentCourse = params.get("course")
            this.currentClass = params.get("class")

            await this.loadAllYears();
            this.allResults = this.formatResults();

            if (!this.currentClass || !this.classes.includes(this.currentClass)) this.currentClass = this.classes[0];
            if (!this.currentCourse || !this.courses.includes(this.currentCourse)) this.currentCourse = this.courses[0];
            this._setUrlParams();

            console.log(this.allResults);
        },
        name: "",
        years: [],
        allYears: {},
        async loadAllYears() {
            this.years = await (await fetch("./data/years.json")).json();
            const data = {};
            for (const year of this.years) {
                data[year] = await (await fetch(`./data/${year}.json`)).json();
            }
            this.allYears = data;
        },
        allResults: {},
        get classes() { return Object.keys(this.allResults); },
        get courses() { return Object.keys(this.allResults?.[this.currentClass] || {}); },
        get currentResults() {
            return (this.allResults?.[this.currentClass]?.[this.currentCourse] || []).sort((a, b) => b.total - a.total);
        },
        // get years() {return this.years},
        currentClass: "",
        currentCourse: "",
        onClickCourse(course) {
            this.currentCourse = course;
            this._setUrlParams();
        },
        // class is keyword, hence ageClass
        onClickClass(ageClass) {
            this.currentClass = ageClass;
            this._setUrlParams();
        },
        formatResults() {
            const data = {};
            for (const [year, courses] of Object.entries(this.allYears)) {
                for (const [course, courseData] of Object.entries(courses)) {
                    for (const [ageClass, ageClassData] of Object.entries(courseData.classes)) {
                        if (!data.hasOwnProperty(ageClass)) data[ageClass] = {};
                        if (!data[ageClass].hasOwnProperty(course)) data[ageClass][course] = [];
                        workingCourse = data[ageClass][course]
                        for (const [result, resultData] of Object.entries(ageClassData.results)) {
                            points = pointsFromPosition[resultData.position]
                            const result = workingCourse.find(runner => runner.name === resultData.name);
                            if (result) {
                                result[year] = points
                                result["total"] += points ? points: 0
                            } else {
                                tmpResult = {}
                                tmpResult["name"] = resultData.name
                                // We want to leave undefined in the year entries as it's a nicer
                                // table, but for sorting we need 0 values in total.
                                tmpResult[year] = points
                                tmpResult["total"] = points ? points : 0 
                                workingCourse.push(tmpResult)
                            }
                        }
                    }
                }
            }
            return data;
        },
        _setUrlParams() {
            const params = new URLSearchParams(document.location.search);
            params.set("class", this.currentClass);
            params.set("course", this.currentCourse);
            history.replaceState(null, null, "?" + params.toString());
        }
    };
};
