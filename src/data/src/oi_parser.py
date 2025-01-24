
import argparse
import csv
import json
import os
import urllib.request

# Local imports
import relay_helper
import util


def main():
    parser = argparse.ArgumentParser(
                        prog='OI Results Parses',
                        description='Parses CSV files from o.ie to produce json format output',
                        epilog='Designed for preparing data for https://github.com/bluefeet32/IrishOrienteeringArchives')

    parser.add_argument('result_id')
    parser.add_argument('-y', '--year', required=True)
    parser.add_argument('-r', '--race', choices=['sprint', 'middle', 'long', 'relay'], required=True)
    parser.add_argument('-a', '--area')
    parser.add_argument('-e', '--eligibility_file')

    args = parser.parse_args()

    # o.ie has a folder structure for the csv files. There are up to 100 files (00-99) in the
    # root directory. The parent is then the result id with the last two digits stripped
    root_dir = args.result_id[:-2]
    results_url = f'https://www.orienteering.ie/result2/?oaction=moreResult&id={args.result_id}'

    urllib.request.urlretrieve(f'https://www.orienteering.ie/results/files/{root_dir}/{args.result_id}.csv', 'results.csv')

    urllib.request.urlretrieve(results_url, "results.txt")
    map_url = ''
    with open('results.txt', newline='') as resultsfile:
        data = resultsfile.read()
        search_string_start = 'https://www.orienteering.ie/gadget/cgi-bin'
        search_string_end = '">Route Gadget'
        start = data.find(search_string_start)
        end = data.find(search_string_end)
        map_url = data[start:end]
    os.remove("results.txt")

    eligibile_data = {}
    if args.eligibility_file:
        with open(args.eligibility_file, 'r') as eligiblefile:
            eligibile_data = json.load(eligiblefile)

    race_result = {
        'area': args.area,
        'results_url': results_url,
        'map_url': map_url,
        'classes': {
            'm21': {},
            'w21': {},
            }
        }
    if args.race != 'relay':
        race_result = ParseIndividualResult(race_result, eligibile_data, args.eligibility_file, map_url)
    else:
        race_result = relay_helper.ParseRelayResult(race_result, eligibile_data, args.eligibility_file, map_url)
        
    # print(race_result)

    util.UpdateRaceResult(args.year, args.race, race_result)

    os.remove("results.csv")


def ParseIndividualResult(race_result: dict, eligibile_data: dict, eligibility_file: str, map_url: str):
    with open('results.csv', newline='') as csvfile:
        results_reader = csv.reader(csvfile, delimiter=';', quotechar='|')
        i = 0
        m_pos_modifier = 0
        w_pos_modifier = 0
        for row in results_reader:
            if i == 0:
                fname_idx = row.index('First name')
                sname_idx = row.index('Surname')
                time_idx = row.index('Time')
                club_idx = row.index('City')
                class_idx = row.index('Short')
                place_idx = row.index('Pl')
                distance_idx = row.index('km')
                climb_idx = row.index('m')
                controls_idx = row.index('Course controls')
                classifier_idx = row.index('Classifier')
                i += 1

            mens_classes = ['"M21"', '"M21E"', '"M21L"', 'M21', 'M21E', 'M21L']
            womens_classes = ['"W21"', '"W21E"', '"M21L"', 'W21', 'W21E', 'W21L']
            if row[class_idx] in mens_classes or row[class_idx] in womens_classes:
                row = [item.replace('"', '') for item in row]
                name = util.ParseName(row[fname_idx], row[sname_idx])
                eligible = util.GetEligibility(name, eligibile_data, eligibility_file)
                position = int(row[place_idx])
                if row[class_idx] in ['M21', 'M21E']:
                    course = race_result['classes']['m21']
                    if not eligible:
                        m_pos_modifier += 1
                        position = None
                    else:
                        position = position - m_pos_modifier
                else:
                    course = race_result['classes']['w21']
                    if not eligible:
                        w_pos_modifier += 1
                        position = None
                    else:
                        position = position - w_pos_modifier
                if 'distance' not in course:
                    course.update({
                        'distance': float(row[distance_idx]),
                        'climb': int(row[climb_idx]),
                        'controls': int(row[controls_idx]),
                        'course_image': map_url,
                        'results': []
                    })
                # print(row[fname_idx], row[sname_idx], row[club_idx], row[class_idx], row[place_idx])
                dnf = '-----' in row or row[classifier_idx] != '0'
                course['results'].append({
                        'position': position if not dnf else None,
                        'name': name,
                        'club': row[club_idx],
                        'time': row[time_idx] if not dnf else 'DNF',
                        'eligible': eligible if not dnf else False,
                        })
    return race_result


if __name__ == '__main__':
    main()