import argparse
import json
from typing import List, Union

# Local imports
import util


def replace_course_data_strings(class_data: Union[int, float, str, None],
                                replace_list: List[str]) -> Union[int, float, str, None]:
    """Replace strings in the course data with the specified values."""
    common_replacements = [' ', 'null']
    if type(class_data) == str:
        for repr in replace_list + common_replacements:
            class_data = class_data.replace(repr, '')
    return class_data


def clean_course_data(data: Union[int, float, str, None],
                      out_type: str,
                      replace_list: List[str]) -> Union[int, float, None]:
    """Convert course data to the specified type, removing unwanted characters."""
    data = replace_course_data_strings(data, replace_list)
    if data == 0 or data:
        if out_type == 'int':
            return int(data)
        elif out_type == 'float':
            return float(data)
        else:
            raise ValueError(f'Unsupported type: {out_type}')
    else:
        return None

def main():
    parser = argparse.ArgumentParser(
                        prog='JSON Cleaner',
                        description='Cleans up the JSON files produced by the various parsers',
                        epilog='Designed for preparing data for https://github.com/bluefeet32/IrishOrienteeringArchives')
    # Earch argument is for the cleaning we want to do. e.g. --clubs means clean clubs
    parser.add_argument('-c', '--clubs', action='store_true')
    parser.add_argument('-n', '--names', action='store_true')
    parser.add_argument('-d', '--course_data', action='store_true')
    parser.add_argument('-y', '--year_to_stop', help='stop processing at the specified year (inclusive)')

    args = parser.parse_args()

    year_data = {}
    try:
        with open(f'src/data/years.json', 'r') as jsonfile:
            year_data = json.load(jsonfile)
    except FileNotFoundError:
        raise FileNotFoundError('years.json not found.')

    data = {}
    if args.year_to_stop:
        x = year_data.index(args.year_to_stop)
        year_data = year_data[:x+1]

    for year in year_data:
        print(f'Cleaning {year}')
        with open(f'src/data/{year}.json', 'r') as jsonfile:
            data = json.load(jsonfile)
        for race in data.keys():
            for class_name in data[race]['classes'].keys():
                class_data = data[race]['classes'][class_name]
                if args.course_data:
                    # Clean the course data. We want controls and climb to be ints and distance to be a float
                    class_data["distance"] = clean_course_data(class_data["distance"], 'float', ['km', 'k'])
                    class_data["climb"] = clean_course_data(class_data["climb"], 'int', ['m'])
                    class_data["controls"] = clean_course_data(class_data["controls"], 'int', [])
                for result in class_data['results']:
                    if args.clubs:
                        result['club'] = util.ParseClub(result['club'])
                    if args.names:
                        result['name'] = util.ParseName(result['name'])
        with open(f'src/data/{year}.json', 'w') as jsonfile:
            json.dump(data, jsonfile, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    main()