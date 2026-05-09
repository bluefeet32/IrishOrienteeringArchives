(function (global) {
const SPRINT = 'sprint';
const MIDDLE = 'middle';
const LONG = 'long';
const RELAY = 'relay';

const OVERALL_COURSE = 'overall';
const INDIVIDUAL_COURSE = 'individual';
const INDIVIDUAL_FOREST_COURSE = 'individual forest';
const FOREST_COURSE = 'forest';

const EVENT_COURSES = [SPRINT, MIDDLE, LONG, RELAY];

const RANKING_COURSES = [OVERALL_COURSE, INDIVIDUAL_COURSE, INDIVIDUAL_FOREST_COURSE, FOREST_COURSE];

const COURSE_SORT_ORDER = {
    [SPRINT]: 0,
    [MIDDLE]: 1,
    [LONG]: 2,
    [RELAY]: 3,
    [OVERALL_COURSE]: 4,
    [INDIVIDUAL_COURSE]: 5,
    [INDIVIDUAL_FOREST_COURSE]: 6,
    [FOREST_COURSE]: 7,
};

Object.assign(global, {
    SPRINT,
    MIDDLE,
    LONG,
    RELAY,
    OVERALL_COURSE,
    INDIVIDUAL_COURSE,
    INDIVIDUAL_FOREST_COURSE,
    FOREST_COURSE,
    EVENT_COURSES,
    RANKING_COURSES,
    COURSE_SORT_ORDER,
});
})(globalThis);
