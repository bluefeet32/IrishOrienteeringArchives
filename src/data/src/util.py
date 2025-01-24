import json
import re
import string

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


def ParseName(first_name: str, second_name: str) -> str:
    """Parse a name from first and second name.

    Irish people have awkward names with accents and stuff :)

    TODO match with existing known names to avoid duplicates due to misspellings.
    """
    # Get rid of any leading/trailing whitespace
    name = f'{first_name.strip()} {second_name.strip()}'.strip()
    # We're pretty naive here. Just create some known mappings for replacement.
    # Note that the order matters here, we replace the irish characters first so
    # the typos are in the correct format (e.g. consider "Ruarí").
    chars_mapping = [
        # Irish Characters
        ('Á', 'A'), ('É', 'E'), ('Í', 'I'), ('Ó', 'O'), ('Ú', 'U'),
        ('á', 'a'), ('é', 'e'), ('í', 'i'), ('ó', 'o'), ('ú', 'u'),
        # Common Typos
        ("' ", "'"),  # e.g. Fix O' Boyle -> O'Boyle
        ("Mcc", "McC"),  # e.g. Fix Mccann -> McCann
        ("O ", "O'"),  # e.g. Fix O Boyle -> O'Boyle
        # Known common misspellings
        ("Nick Simonin", "Nicolas Simonin"),
        ("Ales Simonin", "Alex Simonin"),
        ("Lawrence Quinn", "Laurence Quinn"),
        ("Jonathon Quinn", "Jonathan Quinn"),
        ("O'S H", "O'Sullivan-Hourihan"),
        ("O'Sullivan Hourihan", "O'Sullivan-Hourihan"),
        ("Conall Whealan", "Conal Whelan"),
        ("Vildas Tilunas", "Valdas Tilunas"),
        ("Cillian Corbett", "Cillin Corbett"),
        ("Ruari", "Ruairi"),
        ("Tyndadll", "Tyndall"),
        ]

    for char_pair in chars_mapping:
        name = name.replace(char_pair[0], char_pair[1])

    return name 


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