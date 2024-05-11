# Irish Champs archive website design requirements

## Objective
Create a website that has all of the data available about Irish orienteering championships for historical archive purposes and for fun.

## Requirements
- Can show results from any individual race results are present for
- Can show all races for an individual runner
  - Format example: https://www.attackpoint.org/viewlog.jsp/user_6293/period-1/enddate-2024-05-06
  - Entries should be clickable
    - Bonus points if there’s an option to copy it as HTML for posting to Attackpoint
- Can assign points to runners to be able to display ranking pages
  - Points assigned for 1st through 8th: 10, 8, 6, 5, 4, 3, 2, 1
    - Ignores non-irish eligible runners
  - Ranking pages
    - All time for each discipline
    - Format example: IOC Results - Women
    - All time across all disciplines
    - Clicking on points for an individual race brings you to results for that race
    - Clicking on a name brings you to that person’s results
- Supports disciplines
  - sprint
  - middle
  - Long
  - Should be possible to extend to support relays once the format is determined.
- Adding new years in the future should be easy, and doable without adding extra code, simply uploading the new year file.

## Input data
JSON format. All the races from a year grouped into a single file.
 - It is not guaranteed that every year has every discipline
 - Eligible is used to denote both non-irish eligible and competitors who were N/C

e.g file “2024.json” could contain:

```json
{
  "2024": {
    "middle": {
      "area": "Aughrane Wood",
      "results_url": "https://www.orienteering.ie/result2/?oaction=moreResult&id=22955",
      "map_url": "https://www.orienteering.ie/gadget/cgi-bin/reitti.cgi?act=map&id=970",
      "m21":{
        "distance": "6.1k",
      	"climb": "40m",
      	"controls": 20,
      	"course_image": "https://www.orienteering.ie/gadget/cgi-bin/reitti.cgi?act=map&id=970/",
        "results": [
          { "name": "Colm Moran",  "eligible": true, "club": "Three Rock", "time": "1.55"},
          { "name": "Adam Methven", "eligible": false,, "club": "BKO", "time": "1.58541666666667"},
          { "name": "Eoghan Whelan", "eligible": true, "club": "SEVO", "time": "1.58680555555556"},
          { "name": "Kevin O'Boyle", "eligible": true, "club": "Curragh-Naas", "time": "1.65833333333333"}
        ]
      }
      "w21":{
        "distance": "6.1 k",
      	"climb": "40m",
      	"controls": 20,
      	"course_image": "https://www.orienteering.ie/gadget/cgi-bin/reitti.cgi?act=map&id=970",
        "results": [
          {"name": "Clodagh Moran", "eligible": true, "club": "Three Rock", "time": "1.55"},
          {"name": "Helen Ockenden", "eligible": false, "club": "DRONGO", "time": "1.58541666666667"},
          {"name": "Roisin Long",, "eligible": true, , "club": "Ajax", "time": "1.58680555555556"},
          {"name": "Emer Perkins",, "eligible": true, "club": "Bishopstown", "time": "1.65833333333333"}
        ]
      }
    }
    "long": {
      "area": "Slieve Bawn",
      "results_url": "https://www.orienteering.ie/result2/?oaction=moreResult&id=22957",
      "map_url": "https://www.orienteering.ie/gadget/cgi-bin/reitti.cgi?act=map&id=971",
      "m21": {
        "distance": "11.9 k",
      	"climb": "500m",
      	"controls": 24,
      	"course_image": "https://www.orienteering.ie/gadget/cgi-bin/reitti.cgi?act=map&id=970"
        "results": [
          { "name": "Colm Moran", "points": "10", "eligible": true, "club": "Three Rock", "time": "1.55"},
          { "name": "Adam Methven", "eligible": false, "club": "BKO", "time": "1.58541666666667"},
          { "name": "Eoghan Whelan", "eligible": true, "club": "SEVO", "time": "1.58680555555556"},
          { "name": "Kevin O'Boyle", "eligible": true, "club": "Curragh-Naas", "time": "1.65833333333333"}
        ]
      }
      "w21": {
        "distance": "11.9 k",
      	"climb": "500m",
      	"controls": 24,
      	"course_image": "https://www.orienteering.ie/gadget/cgi-bin/reitti.cgi?act=map&id=970"
        "results": [
          { "name": "Niamh O’Boyle", "eligible": true, "club": "Curragh-Naa", "time": "1.55"},
          { "name": "Aoife McCavana", "eligible": false, "club": "Great Eastern Navigators", "time": "1.58541666666667"},
          { "name": "Emer Perkins", "eligible": true,, "club": "Bishopstown", "time": "1.58680555555556"},
          { "name": "Ciara Largey", "eligible": true, "club": "Fermanagh", "time": "1.65833333333333"}
        ]
      }
    }
  }
}
```
