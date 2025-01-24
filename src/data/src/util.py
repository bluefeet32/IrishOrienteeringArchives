import json

def GetEligibility(name: str, eligibility_data: dict[str, bool], eligibility_file: str = None) -> bool:
    """Determine if a name is eligible based on the eligibility data.
    
    If the name is not present prompt the user to enter the eligibility.
    New data will be written to a file if a file is provided.
    """
    if name in eligibility_data:
        return eligibility_data[name]
    else:
        user_in = input(f'Is {name} eligible (Y/n)?')
        eligible = not user_in in ['n', 'N']
        if eligibility_file is not None:
            eligibility_data[name] = eligible
            # Rewrite the file because we've added a new entry and having to re-enter all the data is annoying.
            with open(eligibility_file, 'w') as jsonfile:
                json.dump(eligibility_data, jsonfile, indent=2, ensure_ascii=False)
    return eligible


def UpdateRaceResult(year: int, race: str, race_result: dict):
    """Update the specified year with the result provided.
    
    If the year file doesn't exist it will be created.
    Will append to the existing data, overwriting a race if it already exists.
    """
    data = {}
    try:
        with open(f'src/data/{year}.json', 'r') as jsonfile:
            data = json.load(jsonfile)
    except FileNotFoundError:
        # That's fine, we'll just create a new file
        pass

    data[race] = race_result

    with open(f'src/data/{year}.json', 'w') as jsonfile:
        json.dump(data, jsonfile, indent=2, ensure_ascii=False)