
import argparse
import bisect
import csv
import json

# Local imports
import util

name_club_map = {
    "Brian Corbett": "CORKO",
    "Eoin Rothery": "",
    "Pat Healy": "",
    "Peter James": "",
    "Robin Bryson": "",
    "Denis Reidy": "",
    "Peter Kernan": "",
    "Colm O'Halloran": "",
    "Marcus Pinker": "CORKO",
    "Bill Edwards": "CORKO",
    "Shane Lynch": "CORKO",
    "James Logue": "",
    "John Feehan": "",
    "Colm Rothery": "",
    "Colm Moran": "3ROC",
    "A. O'Cleirigh": "",
    "Ruairi Short": "CNOC",
    "Andrew Quin": "",
    "Neil Dobbs": "",
    "Conor Short": "CNOC",
    "Nicolas Simonin": "BOC",
    "V. Joyce": "",
    "Paul Pruzina": "LVO",
    "Steven Linton": "",
    "Padraig Higgins": "",
    "Justin May": "3ROC",
    "Darren Burke": "CORKO",
    "Colm Hill": "CNOC",
    "Seamus O'Boyle": "CNOC",
    "Gerard Butler": "3ROC",
    "Eoin McCullough": "3ROC",
    "W. Young": "",
    "Eoghan Whelan": "",
    "Niall Bourke": "",
    "Laurence Quinn": "GEN",
    "Ruairi Long": "",
    "Jussi Makila": "",
    "Josh O'Sullivan-Hourihan": "CORKO",
    "David Healy": "GEN",
    "Brendan O'Brien": "",
    "Kyle Heron": "",
    "Kevin O'Boyle": "CNOC",
    "W. McAuliffe": "",
    "Ondrej Pijak": "GEN",
    "Mark Stephens": "",
    "Cillin Corbett": "CORKO",
    "Daniel Morrogh": "",
    "Brian Ervine": "",
    "Allan Bogle": "",
    "Stewart Caithness": "",
    "John Casey": "",
    "Billy Reed": "",
    "Liam Cotter": "",
    "Ivan Millar": "",
    "Iain Rochford": "",
    "G. Pattern": "",
    "Danny O'Hare": "",
    "Rory Morrish": "",
    "Peter O'Hara": "",
    "Patrick Higgins": "LVO",
    "M. Deasy": "",
    "Kevin O'Reilly": "",
    "Hugh Cashell": "CNOC",
    "Brendan Delaney": "CNOC",
    "Kevin O'Dwyer": "",
    "Darragh Hoare": "",
    "Niamh O'Boyle": "CNOC",
    "Una Creagh": "",
    "Toni O'Donovan": "",
    "Eileen Loughman": "",
    "Ciara Largey": "",
    "Ruth Lynam": "CNOC",
    "D. NiChallanian": "",
    "Aislinn Austin": "",
    "Julie Cleary": "",
    "Eadaoin Morrish": "",
    "Petranka Pacheva": "",
    "C. NicMhuiris": "",
    "Roisin Long": "Ajax",
    "Nuala Higgins": "",
    "Maeve O'Grady": "",
    "Ailbhe Creedon": "",
    "Olivia Baxter": "",
    "Rosalind Hussey": "",
    "Niamh Corbett": "CORKO",
    "Aoife McCavana": "GEN",
    "M. Thornhill": "",
    "Aine McCann": "LVO",
    "Darina Cunnane": "",
    "Faye Pinker": "CORKO",
    "Regina Kelly": "CNOC",
    "M. Macpherson": "",
    "Sharon Lucey": "",
    "O. Cooke": "",
    "Susan Bell": "",
    "L. Holenstein": "",
    "Clodagh Moran": "3ROC",
    "Kathryn Barr": "UCDO",
    "S. Clarke": "",
    "R. Burgess": "",
    "D. Lewis": "",
    "Tara Horan": "",
    "P. Murphy": "",
    "Miriam Feehan": "",
    "Violet Linton": "",
    "Orla Jennings": "",
    "Katarina Stefkova": "",
    "Emer Perkins": "",
    "Mary Curran": "",
    "Joanne Mein": "",
    "Emma Glanville": "",
    "Nina Philips": "",
    "Eadaoin McCavana": "",
    "Roxanne White": "",
    "Helen Pruzina": "",
    "Fionne Austin": "",
    "Danielle Buckley": "",
    "Emily Rowe": "GEN",
    "Lolita Kauke": "",
    "Hanna Mira Oerter": "",
    "Aoife O Sullivan": "",
    "Vilmalotta Silvonen": "",
    "Fiona O'Hanlon": "",
    "Stephanie Pruzina": "",
    "Caoimhe O'Boyle": "CNOC",
    "Elodie Donet": "",
}

points_results_map = {
    10: 1,
    8: 2,
    6: 3,
    5: 4,
    4: 5,
    3: 6,
    2: 7,
    1: 8,
}

def FormatYear(short_year: int):
    """Convert a two digit year to a four digit year."""
    if short_year < 25:
        return 2000 + short_year
    else:
        return 1900 + short_year

def main():
    parser = argparse.ArgumentParser(
                        prog='Sheet Results Parser',
                        description='Parses a CSV files from that has historical data on IOC results to produce json format output',
                        epilog='Designed for preparing data for https://github.com/bluefeet32/IrishOrienteeringArchives')

    # The sheet contains many years and only long distance
    # Note that we assume everyone in the sheet is eligible
    parser.add_argument('-i', '--input_file')
    parser.add_argument('-c', '--class_name', choices=['m', 'w'], required=True)

    args = parser.parse_args()

    with open(args.input_file, newline='') as csvfile:
        results_reader = csv.DictReader(csvfile, delimiter=',', quotechar='|')

        # Get the indexes of the fields we need
        headers = results_reader.fieldnames
        name_header = headers[1]
        years = [header for header in headers[2:-1]]

        results = {}
        skipped_years = []
        class_name = 'm21' if args.class_name == 'm' else 'w21'
        for year in years:
            
            # See if there's already data for this year
            # We will overwrite the data if it exists, but we only want to do it for the class we're parsing
            # and we don't want to overwrite "better" data.
            # We'll define better as having o.ie results url
            data = {}
            try:
                with open(f'src/data/{FormatYear(int(year))}.json', 'r') as jsonfile:
                    data = json.load(jsonfile)
                if 'long' in data and data['long']['results_url'] != "":
                    print(f'skipping {year} as it already has data')
                    skipped_years.append(year)
                    continue
            except FileNotFoundError:
                print(f'did not find {year}.json')
                # That's fine, we'll just create a new file
                # build some empty data
                data['long'] = {
                    'area': None,
                    'results_url': "",
                    'map_url': "",
                    'classes': {
                        'm21': {
                            "distance": None,
                            "climb": None,
                            "controls": None,
                            "course_image": None,
                            "results": []
                        },
                        'w21': {
                            "distance": None,
                            "climb": None,
                            "controls": None,
                            "course_image": None,
                            "results": []
                        },
                    }
                }

            # Blank out data for the year
            results[year] = data['long']
            results[year]["classes"][class_name]["results"] = []

        for name_row in results_reader:
            for year in years:
                if year in skipped_years:
                    continue
                if 'IOC Results' in name_row[name_header]:
                    # This is a header row with the area names
                    results[year]["area"] = name_row[year]
                else:
                    name = util.ParseName(name_row[name_header].strip())
                    if name_row[year] != '':
                        position = points_results_map[int(name_row[year])]
                        bisect.insort_left(results[year]["classes"][class_name]["results"], {
                            "position": position,
                            "name": name,
                            "club": name_club_map[name],
                            "time": None,
                            "eligible": True
                        }, key=lambda x: x["position"])

    for short_year in years:
        if short_year in skipped_years:
            continue
        long_year = FormatYear(int(short_year))
        util.UpdateRaceResult(long_year, 'long', results[short_year])

if __name__ == '__main__':
    main()