import argparse
import os
import urllib.request
import json

# Local imports
import util


# Initial pass of parsing results from SportIdent results.
# These results aren't in a nice format and they only happen once every few years so mostly I don't care enough to make this well written.

def main():
    parser = argparse.ArgumentParser(
                        prog='Winsplits Results Parser',
                        description='Parses Winsplits XML files to produce json format output',
                        epilog='Designed for preparing data for https://github.com/bluefeet32/IrishOrienteeringArchives')

    # parser.add_argument('result_id')
    parser.add_argument('-t', '--men_table_num', required=True)
    parser.add_argument('-w', '--women_table_num', required=True)
    parser.add_argument('-y', '--year', required=True)
    parser.add_argument('-r', '--race', choices=['sprint', 'middle', 'long', 'relay'], required=True)
    parser.add_argument('-a', '--area')
    parser.add_argument('-e', '--eligibility_file')
    parser.add_argument('-s', '--results_url', required=True)
    parser.add_argument('-m', '--map_url', default=None)

    args = parser.parse_args()
    # results_url = f'https://www.nwoc.info/res/2025/IOC/day4/'
    # results_url = 'https://www.lvo.routegadget.co.uk/rg2/rg2api.php?type=splitsbrowser&id=567&_=1746384070826'

    urllib.request.urlretrieve(args.results_url, 'results.txt')
    # This gives us an awful format. The first characters of the result we'll want is like:
    # `if (tableNumber == 8) return [["<positon>st","<position>","<number>","<name>","<club>","<age_class>","<time>","\u0026nbsp;","\u0026nbsp;"],`
    # With the list repeated for each runner.

    race_result = {
        'area': args.area,
        'results_url': args.results_url,
        'map_url': args.map_url,
        'classes': {
            'm21': {},
            'w21': {},
            }
        }
    
    eligibile_data = {}
    if args.eligibility_file:
        with open(args.eligibility_file, 'r') as eligiblefile:
            eligibile_data = json.load(eligiblefile)
    with open('results.txt', newline='') as resultsfile:
        data = resultsfile.read()

    for class_name in ('m21', 'w21'):
        if class_name == 'm21':
            table_num = args.men_table_num
        else:
            table_num = args.women_table_num

        search_string_start = f'if (tableNumber == {table_num}) return '
        search_len = len(search_string_start)
        search_string_end = f';if (tableNumber == {int(table_num) + 1})'
        start = data.find(search_string_start)
        # print(f'start: {start}')
        end = data.find(search_string_end)
        # print(f'end: {end}')
        # print(f'data[start:end]: {data[start+search_len:end]}')

        data_list = eval(data[start+search_len:end])
        # print(f'data_list: {data_list[2]}')

        course = race_result['classes'][class_name]
        course.update({
                        # 'distance': float(row[distance_idx]),
                        # 'climb': int(row[climb_idx]),
                        # 'controls': int(row[controls_idx]),
                        'course_image': args.map_url,
                        'results': []
                    })
        pos_modifier = 0
        # Runners are in the format:
        # ["<position>st","<position>","<number>","<name>","<club>","<age_class>","<time>","\u0026nbsp;","\u0026nbsp;"]
        for runner in data_list:
            raw_name = runner[3]
            # Names can have urls appended to them, so we need to strip that off.
            url_start = raw_name.find('<a href=')
            if url_start != -1:
                name = util.ParseName(raw_name[:url_start])
            else:
                name = util.ParseName(raw_name)
            eligible = util.GetEligibility(name, eligibile_data, args.eligibility_file)
            if not eligible:
                pos_modifier += 1
            pos = int(runner[1]) - pos_modifier
            try:
                time = util.FormatTime(runner[6])
            except:
                time = 'DNF'
            course['results'].append({
                        'position': pos,
                        'name': name,
                        'club': runner[4],
                        'time': time,
                        'eligible': eligible if time != 'DNF' else False,
                        })
    # print(f'course: {course}')

    util.UpdateRaceResult(args.year, args.race, race_result)

    os.remove("results.txt")


    


if __name__ == '__main__':
    main()