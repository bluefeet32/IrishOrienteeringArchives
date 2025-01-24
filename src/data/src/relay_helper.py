
import csv
import re

from datetime import timedelta

# Local imports
import util

class Runner:
    """A class to represent a runner in a relay event."""
    name = ''
    club = ''
    time = ''
    leg = 0
    eligible = None

    def __init__(self, name, club, time, leg, dnf, eligible):
        self.name = name
        self.club = club
        self.time = time if not dnf else 'DNF'
        self.leg = leg
        self.eligible = False if dnf else eligible

    def __str__(self):
        return f'{self.name} ({self.club}) {self.leg} {self.time}'
        
    def __repr__(self):
        return self.__str__()

class Team:
    """A class to represent a team in a relay event."""
    position = None
    time = None
    club_num = None
    team_name = None
    club_name = None
    team_name = None
    eligible = True
    gender = None

    def __init__(self, club_num, team_name, gender):
        self.club_num = club_num
        self.team_name = team_name
        self.gender = gender
        # Clubs are actually the team names in the relay results. We want to translate to a consistent club name.
        # These are usually inside parentesis so extract that.
        if '(' in self.team_name and ')' in self.team_name:
            self.club_name = re.search(r'\((.*)\)', team_name).group(1)
        else:
            self.club_name = team_name
        self.runners = []

    def __str__(self):
        return f'{self.club_num} {self.club_name} {self.time} {self.team_name} {self.gender} {self.runners}'  # ()'  # {self.runners}'
    
    def __repr__(self):
        return self.__str__()

    def getTime(self):
        return 0
    
    def _computeTotalTime(self):
        self.time = timedelta(0)
        for runner in self.runners:
            if runner.time == 'DNF':
                self.time = None
                return
            minutes, seconds = runner.time.split(':')
            time = timedelta(minutes=int(minutes), seconds=int(seconds))
            self.time += time
    
    def addrunner(self, runner: Runner):
        if len(self.runners) >= 3:
            print(f'Team cannot have more than 3 runners. Skipped adding runner: {runner}')
        self.runners.append(runner)
        if runner.eligible == False:
            self.eligible = False
        # Once we have all three runners we can compute the team's time
        if len(self.runners) == 3:
            self._computeTotalTime()

    def __lt__(self, other):
        """We can't guarantee every team has a time, so handle that for sorting"""
        if self.time is None:
            return False
        if other.time is None:
            return True
        return self.time < other.time


def ParseRelayResult(race_result: dict, eligibile_data: dict, eligibility_file: str, map_url: str):
# Relays are different, the fields are used a bit differently.
    with open('results.csv', newline='') as csvfile:
        results_reader = csv.DictReader(csvfile, delimiter=';', quotechar='|')

        # Get the indexes of the fields we need
        row = results_reader

        fname = 'First name'
        sname = 'Surname'
        leg = 'Leg'
        time = 'Time'
        # Clubs are actually the team names in the relay results
        club = 'Club'
        club_num_header = 'Club no.'
        class_name = 'Short'
        place = 'Pl'
        distance = 'km'
        climb = 'm'
        controls = 'Course controls'
        classifier = "Classifier"

        
        mens_classes = ['"Open Premier"', 'Open Premier']
        womens_classes = ['"Womens Premier"', 'Womens Premier']

        # Relay results are ordered by the finish times on the course. We need to group the results by team and then figure out the team's position, then apply
        # that to the individual's position. A team is ineligible if any individual in that team is ineligible.

        # Build a dictionary of teams and their results
        teams = {}

        m_course = race_result['classes']['m21']
        w_course = race_result['classes']['w21']

        for results_row in results_reader:
            if results_row[class_name] in mens_classes or results_row[class_name] in womens_classes:
                gender = 'm' if results_row[class_name] in mens_classes else 'w'
                # print(results_row)

                course = m_course if gender == 'm' else w_course
                if 'distance' not in course:
                    course.update({
                        'distance': float(results_row[distance]),
                        'climb': int(results_row[climb]),
                        'controls': int(results_row[controls]),
                        'course_image': map_url,
                        'results': []
                    })

                row = {}
                for key, value in results_row.items():
                    if key:
                        row[key] = value.replace('"', '')
                name = f'{row[fname].strip()} {row[sname].strip()}'.strip()
                # print(f'"{name}"')
                eligible = util.GetEligibility(name, eligibile_data, eligibility_file is not None)

                club_num = row[club_num_header]
                # print(f'club num: {club_num}')
                team = teams[club_num] if club_num in teams else Team(club_num, team_name=row[club], gender=gender)
                # print(f'got team: {team}')
                dnf = '-----' in row or row[classifier] != '0'
                team.addrunner(Runner(name=name, club=row[club], time=row[time], leg=row[leg], dnf=dnf, eligible=eligible))
                teams[club_num] = team
                
        # print(teams)

        # Now that we have all the teams, we can sort them by time and assign positions
        
        sorted_teams = sorted(teams.values())  #, key=team_sort_key)
        # print('')
        # print(f'sorted: {sorted_teams}')

        m_pos = 1
        w_pos = 1
        for team in sorted_teams:
            course = m_course if team.gender == 'm' else w_course
            if team.eligible == False:
                pos = None
            else:
                pos = m_pos if team.gender == 'm' else w_pos
                if team.gender == 'm':
                    m_pos += 1
                else:
                    w_pos += 1
            sorted_runners = sorted(team.runners, key=lambda x: x.leg)
            for runner in sorted_runners:
                course['results'].append({
                    'position': pos,
                    'name': runner.name,
                    'club': team.club_name,
                    'time': runner.time,
                    'eligible': team.eligible
                })
            # If less than 3 runners, insert blanks up to 3
            if len(sorted_runners) < 3:
                for i in range(3 - len(sorted_runners)):
                    course['results'].append({
                        'position': pos,
                        'name': '',
                        'club': '',
                        'time': '',
                        'eligible': False
                    })

    return race_result