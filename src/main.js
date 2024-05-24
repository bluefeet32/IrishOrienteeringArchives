function capitalizeFirstLetter(str) {
    // Check if the input string is not empty
    if (str.length === 0) {
        return str;
    }

    // Capitalize the first character and concatenate it with the rest of the string
    return str.charAt(0).toUpperCase() + str.slice(1);
}

var overallCourse = "overall"
var individualCourse = "individual"
var individualForestCourse = "individual forest"
var forestCourse = "forest"

var rankingCourses = [
    overallCourse,
    individualCourse,
    individualForestCourse,
    forestCourse,
]

function sortCourses(a, b) {
    courseValues = {
        "sprint": 0,
        "middle": 1,
        "long": 2,
        "relay": 3,
        "overall": 4,
        "individual": 5,
        "individual forest": 6,
        "forest": 7,
    }
    return courseValues[a] - courseValues[b];

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
        get courses() {
            return Object.keys(this.yearData).sort((a,b) => sortCourses(a, b));
        },
        currentCourse: "",
        get classes() {
            return Object.keys(this.yearData?.[this.currentCourse]?.classes || {});
        },
        currentClass: "",
        get results() {
            return this._indexResults(this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || []);
        },
        get results() {
            return this.yearData?.[this.currentCourse]?.classes?.[this.currentClass]?.results || [];
        },
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
        },
    };
};

const getRunner = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.name = params.get("name");
            this.currentCourse = params.get("course");
            this.currentClass = params.get("class");

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
        get classes() {
            return Object.keys(this.allResults);
        },
        get courses() {
            return Object.keys(this.allResults?.[this.currentClass] || {}).sort((a,b) => sortCourses(a, b));
        },
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
                        const result = ageClassData.results.find((runner) => runner.name === this.name);
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
        },
    };
};

const getRankings = () => {
    return {
        async init() {
            const params = new URLSearchParams(document.location.search);
            this.currentCourse = params.get("course");
            this.currentClass = params.get("class");

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
        get classes() {
            return Object.keys(this.allResults);
        },
        get courses() {
            return Object.keys(this.allResults?.[this.currentClass] || {}).sort((a,b) => sortCourses(a, b));
        },
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
        addRankedResult(course, resultData, year, points){
            const result = course.find((runner) => runner.name === resultData.name);
            if(result) {
                if (!result.hasOwnProperty(year)) {
                    result[year] = points;
                } else {
                    result[year] += points;
                }
                result["total"] += points;
            } else {
                tmpResult = {};
                tmpResult["name"] = resultData.name;
                tmpResult[year] = points;
                tmpResult["total"] = points;
                course.push(tmpResult);
            }
        },
        formatResults() {
            const data = {};
            for (const [year, courses] of Object.entries(this.allYears)) {
                for (const [course, courseData] of Object.entries(courses)) {
                    for (const [ageClass, ageClassData] of Object.entries(courseData.classes)) {
                        if (!data.hasOwnProperty(ageClass)) data[ageClass] = {};
                        if (!data[ageClass].hasOwnProperty(course)) data[ageClass][course] = [];
                        for (const rankingCourse of rankingCourses) {
                            if (!data[ageClass].hasOwnProperty(rankingCourse)) data[ageClass][rankingCourse] = [];
                        }
                        for (const [result, resultData] of Object.entries(ageClassData.results)) {
                            points = pointsFromPosition[resultData.position];
                            points = points ? points : 0;

                            this.addRankedResult(data[ageClass][course], resultData, year, points);
                            this.addRankedResult(data[ageClass][overallCourse], resultData, year, points);

                            if (course != "relay") {
                                this.addRankedResult(data[ageClass][individualCourse], resultData, year, points);
                                if (course != "sprint") {
                                    this.addRankedResult(data[ageClass][individualForestCourse], resultData, year, points);
                                }
                            }
                            if (course != "sprint") {
                                this.addRankedResult(data[ageClass][forestCourse], resultData, year, points);
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
        },
    };
};
