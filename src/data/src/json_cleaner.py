import argparse
import csv
import json
import os

# Local imports
import util

def main():
    parser = argparse.ArgumentParser(
                        prog='JSON Cleaner',
                        description='Cleans up the JSON files produced by the various parsers',
                        epilog='Designed for preparing data for https://github.com/bluefeet32/IrishOrienteeringArchives')
    # Earch argument is for the cleaning we want to do. e.g. --clubs means clean clubs
    parser.add_argument('-c', '--clubs', action='store_true')
    parser.add_argument('-n', '--names', action='store_true')

    args = parser.parse_args()

    year_data = {}
    try:
        with open(f'src/data/years.json', 'r') as jsonfile:
            year_data = json.load(jsonfile)
    except FileNotFoundError:
        raise FileNotFoundError('years.json not found.')

    data = {}
    for year in year_data:
        print(f'Cleaning {year}')
        with open(f'src/data/{year}.json', 'r') as jsonfile:
            data = json.load(jsonfile)
        for race in data.keys():
            for class_name in data[race]['classes'].keys():
                for result in data[race]['classes'][class_name]['results']:
                    if args.clubs:
                        result['club'] = util.ParseClub(result['club'])
                    if args.names:
                        result['name'] = util.ParseName(result['name'])
        with open(f'src/data/{year}.json', 'w') as jsonfile:
            json.dump(data, jsonfile, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    main()