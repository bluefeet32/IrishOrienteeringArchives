import util

def main():
    test_names = [("Áine", "McCann", "Aine McCann"),
                  ("Sarah", "Ní Ruairc", "Sarah Ni Ruairc"),
                  ("Seamus", "O' Boyle", "Seamus O'Boyle"),
                  ("Erik", "Ivarsson Sandberg", "Erik Ivarsson Sandberg"),
                  ]
    for name in test_names:
        parsed_name = util.ParseName(name[0], name[1])
        assert parsed_name == name[2], f'Expected {name[2]}, got {parsed_name}'


if __name__ == '__main__':
    main()