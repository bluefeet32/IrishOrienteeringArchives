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


def ParseSplitName(first_name: str, second_name: str) -> str:
    """Parse a name from first and second name."""
    # Get rid of any leading/trailing whitespace
    name = f'{first_name.strip()} {second_name.strip()}'.strip()
    return ParseName(name)


def ParseName(name: str) -> str:
    """Parse a name from first and second name.
    Irish people have awkward names with accents and stuff :)

    TODO match with existing known names to avoid duplicates due to misspellings
    """
    # We're pretty naive here. Just create some known mappings for replacement.
    # Note that the order matters here, we replace the irish characters first so
    # the typos are in the correct format (e.g. consider "Ruarí").
    chars_mapping = [
        # Irish Characters
        ('Á', 'A'), ('É', 'E'), ('Í', 'I'), ('Ó', 'O'), ('Ú', 'U'),
        ('á', 'a'), ('é', 'e'), ('í', 'i'), ('ó', 'o'), ('ú', 'u'),
        # Encodings
        ("&#39;", "'"), ("&#225;", "a"), ("&#228;", "a"), ("&#233;", "e"),
        ("&#237;", "i"), ("&#243;", "o"), ("&#250;", "u"), ("&#241;", "n"), 
        # Common Typos
        ("' ", "'"),  # e.g. Fix O' Boyle -> O'Boyle
        ("Mcc", "McC"),  # e.g. Fix Mccann -> McCann
        ("O' ", "O'"),  # e.g. Fix O' Boyle -> O'Boyle
        # Known common misspellings
        ("O Boyle", "O'Boyle"),
        ("Nick Simonin", "Nicolas Simonin"),
        ("Nic Simonin", "Nicolas Simonin"),
        ("Ales Simonin", "Alex Simonin"),
        ("Lawrence Quinn", "Laurence Quinn"),
        ("Jonathon Quinn", "Jonathan Quinn"),
        ("Andrew Quinn", "Andrew Quin"),
        ("O'S H", "O'Sullivan-Hourihan"),
        ("O'Sullivan Hourihan", "O'Sullivan-Hourihan"),
        ("OHalloran", "O'Halloran"),
        ("Conall Whealan", "Conal Whelan"),
        ("Vildas Tilunas", "Valdas Tilunas"),
        ("Cillian Corbett", "Cillin Corbett"),
        ("P. Higgins", "Padraig Higgins"),
        ("Katarina Sterko", "Katarina Stefko"),
        ("Katarina Stefko", "Katarina Stefkova"),
        ("Andrea Stefko", "Andrea Stefkova"),
        ("Stefkovava", "Stefkova"),
        ("Beirne O'Boyle", "Bernie O'Boyle"),
        ("Shea O'Boyle", "Seamus O'Boyle"),
        ("Johnny Kendall", "Jonny Kendall"),
        ("Gerald Butler", "Gerard Butler"),
        ("Naill Ewwn", "Niall Ewen"),
        ("Rosalind Hussey", "Rosalind Heron"),
        ("Killeeen", "Killeen"),
        ("Ruari", "Ruairi"),
        ("Tyndadll", "Tyndall"),
        ("Mckenna", "McKenna"),
        # Old results have names with F. Surname format, we need to convert them to Firstname Surname
        # Men
        ("A. O'Cleirigh", "Aonghus O'Cleirigh"),
        ("E. Rothery", "Eoin Rothery"),
        ("G. Byrne", "Gerry Byrne"),
        ("H. Quirke", "Harry Quirke"),
        ("P. Healy", "Pat Healy"),
        ("P. Nash", "Pat Nash"),
        ("W. Young", "Wally Young"),
        # Women
        ("A. Shiel", "Ann Shiel"),
        ("B. Flanagan", "Brigid Flanagan"),
        ("D. NiChallanian", "Deirdre Ni Challanain"),  ("D. Ní Challanain", "Deirdre Ni Challanain"),
        ("E. Loughman", "Eileen Loughman"),
        ("G. Quinn", "Geraldine Quinn"),
        ("M. Thornhill", "Maura Thornhill"),
        ("M. Turley", "Monica Turley"),
        ("R. White", "Roxanne White"),
        ("U. Creagh", "Una Creagh"),
        ("U. Cregan", "Una Cregan"),
        ]

    for char_pair in chars_mapping:
        name = name.replace(char_pair[0], char_pair[1])

    return name

def ParseClub(club: str) -> str:
    """Convert a club name to a standard format."""

    club_mappings = [
        ("Ajax", "AJAX"),
        ("Bishopstown", "BOC"),
        ("Cork O", "CORKO"), ("CorkO", "CORKO"), ("Cork", "CORKO"),
        ("Curragh-Naas", "CNOC"), ("Curragh Naas", "CNOC"),
        ("Curragh", "CO"),  # CO is an older version of CNOC
        ("Fingal", "FIN"),
        ("Great Eastern Navigators", "GEN"),
        ("Lagan Valley", "LVO"),
        ("Lee O", "LEEO"), ("LeeO", "LEEO"),
        ("Three Rock", "3ROC"), ("3Rock", "3ROC"),
        ("University College Dublin", "UCDO"),
        ("WatO", "WATO"),
    ]

    for char_pair in club_mappings:
        club = club.replace(char_pair[0], char_pair[1])

    return club

def FormatTime(time_str: str) -> str:
    """Format a time string to a consistent format.
    
    Args:
        time_str: The time string to format. Either "mm:ss" or "h:mm:ss".

    Returns:
        Time formatted at mmm:ss
    """
    time_arr = time_str.split(':')
    if len(time_arr) == 3:
        # We have h:mm:ss
        mins = int(time_arr[0]) * 60 + int(time_arr[1])
        return f'{mins}:{time_arr[2]}'
    if len(time_arr) == 2:
        # We have mm:ss, don't need to do anything
        return time_str
    else:
        raise ValueError(f'Unsupported time format: {time_str}')


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